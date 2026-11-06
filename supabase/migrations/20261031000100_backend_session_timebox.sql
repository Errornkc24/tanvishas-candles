-- Session lifetime is based on the Auth session row, not a refreshable JWT's iat.
create or replace function public.auth_session_is_current()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.sessions as s
    where s.id = nullif(auth.jwt()->>'session_id', '')::uuid
      and s.created_at is not null
      and s.created_at + interval '24 hours' > now()
      and (s.not_after is null or s.not_after > now())
  );
$$;

revoke all on function public.auth_session_is_current() from public;
grant execute on function public.auth_session_is_current() to authenticated, service_role;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.touch_updated_at() from public;
drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists cart_items_touch_updated_at on public.cart_items;
create trigger cart_items_touch_updated_at
  before update on public.cart_items
  for each row execute function public.touch_updated_at();

alter table public.cart_items
  add constraint cart_items_quantity_limit check (quantity between 1 and 50) not valid;

-- Ensure admin checks also fail closed for expired sessions, including Storage RLS.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.auth_session_is_current()
    and exists (
      select 1 from public.user_roles
      where user_id = _user_id and role = _role
    );
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.auth_session_is_current()
    and exists (
      select 1 from public.user_roles
      where user_id = _user_id and role in ('owner', 'staff')
    );
$$;

-- Enforce session freshness in row policies as well as in the Express API. This
-- covers direct PostgREST and Realtime access, which otherwise bypass the API.
drop policy if exists "own roles readable" on public.user_roles;
create policy "own roles readable" on public.user_roles for select to authenticated
  using (public.auth_session_is_current() and (user_id = auth.uid() or public.has_role(auth.uid(), 'owner')));

drop policy if exists "profile own select" on public.profiles;
create policy "profile own select" on public.profiles for select to authenticated
  using (public.auth_session_is_current() and (id = auth.uid() or public.is_admin(auth.uid())));
drop policy if exists "profile own insert" on public.profiles;
create policy "profile own insert" on public.profiles for insert to authenticated
  with check (public.auth_session_is_current() and id = auth.uid());
drop policy if exists "profile own update" on public.profiles;
create policy "profile own update" on public.profiles for update to authenticated
  using (public.auth_session_is_current() and id = auth.uid())
  with check (public.auth_session_is_current() and id = auth.uid());

drop policy if exists "addr own" on public.addresses;
create policy "addr own" on public.addresses for all to authenticated
  using (public.auth_session_is_current() and user_id = auth.uid())
  with check (public.auth_session_is_current() and user_id = auth.uid());

drop policy if exists "cat admin" on public.categories;
create policy "cat admin" on public.categories for all to authenticated
  using (public.auth_session_is_current() and public.has_role(auth.uid(), 'owner'))
  with check (public.auth_session_is_current() and public.has_role(auth.uid(), 'owner'));

drop policy if exists "prod admin" on public.products;
create policy "prod admin" on public.products for all to authenticated
  using (public.auth_session_is_current() and public.is_admin(auth.uid()))
  with check (public.auth_session_is_current() and public.is_admin(auth.uid()));

drop policy if exists "cart own" on public.cart_items;
create policy "cart own" on public.cart_items for all to authenticated
  using (public.auth_session_is_current() and user_id = auth.uid())
  with check (public.auth_session_is_current() and user_id = auth.uid());

drop policy if exists "orders read" on public.orders;
create policy "orders read" on public.orders for select to authenticated
  using (public.auth_session_is_current() and (user_id = auth.uid() or public.is_admin(auth.uid())));
drop policy if exists "orders admin update" on public.orders;
revoke update on public.orders from authenticated;

drop policy if exists "items read" on public.order_items;
create policy "items read" on public.order_items for select to authenticated
  using (public.auth_session_is_current() and exists (
    select 1 from public.orders as o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_admin(auth.uid()))
  ));

drop policy if exists "hist read" on public.order_status_history;
create policy "hist read" on public.order_status_history for select to authenticated
  using (public.auth_session_is_current() and exists (
    select 1 from public.orders as o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_admin(auth.uid()))
  ));

drop policy if exists "stock log admin" on public.stock_adjustments;
create policy "stock log admin" on public.stock_adjustments for select to authenticated
  using (public.auth_session_is_current() and public.is_admin(auth.uid()));

-- Make changing the default delivery address atomic and preserve one-default-per-user.
with ranked_defaults as (
  select id, row_number() over (partition by user_id order by created_at, id) as position
  from public.addresses
  where is_default
)
update public.addresses as a
set is_default = false
from ranked_defaults as r
where a.id = r.id and r.position > 1;

create unique index if not exists addresses_one_default_per_user_idx
  on public.addresses (user_id) where is_default;

create or replace function public.set_default_address(_address_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.auth_session_is_current() then
    raise exception 'Please sign in again to update your delivery address';
  end if;

  perform 1 from public.addresses where user_id = auth.uid() for update;
  update public.addresses set is_default = false where user_id = auth.uid();
  update public.addresses set is_default = true
    where id = _address_id and user_id = auth.uid();
  if not found then raise exception 'Address not found'; end if;
end;
$$;
revoke all on function public.set_default_address(uuid) from public, anon;
grant execute on function public.set_default_address(uuid) to authenticated;

-- SECURITY DEFINER order functions must explicitly enforce session age.
create or replace function public.place_order(_items jsonb, _address jsonb, _contact jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _order_id uuid; _num text;
  _sub numeric := 0; _ship numeric; _it jsonb; _p record; _qty int;
begin
  if _uid is null or not public.auth_session_is_current() then
    raise exception 'Please sign in again to place an order';
  end if;
  if coalesce(jsonb_typeof(_items), '') <> 'array' then raise exception 'Invalid cart'; end if;
  if jsonb_array_length(_items) = 0 then raise exception 'Your cart is empty'; end if;
  if coalesce(jsonb_typeof(_address), '') <> 'object'
    or length(btrim(coalesce(_address->>'full_name', ''))) not between 2 and 100
    or btrim(coalesce(_address->>'phone', '')) !~ '^[6-9][0-9]{9}$'
    or length(btrim(coalesce(_address->>'line1', ''))) not between 5 and 300
    or length(btrim(coalesce(_address->>'landmark', ''))) > 120
    or length(btrim(coalesce(_address->>'city', ''))) not between 2 and 80
    or length(btrim(coalesce(_address->>'state', ''))) not between 2 and 80
    or btrim(coalesce(_address->>'pincode', '')) !~ '^[0-9]{6}$' then
    raise exception 'Enter a valid delivery address';
  end if;
  if coalesce(jsonb_typeof(_contact), '') <> 'object'
    or length(btrim(coalesce(_contact->>'first_name', ''))) not between 1 and 60
    or length(btrim(coalesce(_contact->>'last_name', ''))) not between 1 and 60
    or length(btrim(coalesce(_contact->>'email', ''))) > 255
    or btrim(coalesce(_contact->>'email', '')) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or btrim(coalesce(_contact->>'phone', '')) !~ '^[6-9][0-9]{9}$'
    or length(btrim(coalesce(_contact->>'instagram', ''))) > 60 then
    raise exception 'Enter valid contact details';
  end if;
  for _it in select * from jsonb_array_elements(_items) loop
    _qty := (_it->>'quantity')::int;
    if _qty is null or _qty < 1 or _qty > 50 then raise exception 'Invalid quantity'; end if;
    select * into _p from products where id = (_it->>'product_id')::uuid and archived = false for update;
    if not found then raise exception 'A product in your cart is no longer available'; end if;
    if _p.stock < _qty then raise exception 'Only % left of %', _p.stock, _p.name; end if;
    _sub := _sub + _p.price * _qty;
  end loop;
  _ship := case when _sub >= 999 then 0 else 79 end;
  insert into orders (user_id, subtotal, shipping, total, shipping_address, contact)
  values (_uid, _sub, _ship, _sub + _ship, _address, _contact) returning id, order_number into _order_id, _num;
  for _it in select * from jsonb_array_elements(_items) loop
    _qty := (_it->>'quantity')::int;
    select * into _p from products where id = (_it->>'product_id')::uuid;
    insert into order_items (order_id, product_id, name, image, price, quantity)
    values (_order_id, _p.id, _p.name, _p.images[1], _p.price, _qty);
    update products set stock = stock - _qty where id = _p.id;
    insert into stock_adjustments (product_id, change, new_stock, reason, changed_by, order_id)
    values (_p.id, -_qty, _p.stock - _qty, 'sale', _uid, _order_id);
  end loop;
  insert into order_status_history (order_id, status, changed_by) values (_order_id, 'placed', _uid);
  delete from cart_items where user_id = _uid;
  return json_build_object('id', _order_id, 'order_number', _num);
end $$;

create or replace function public.cancel_order(_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare _o record; _i record; _new int;
begin
  if auth.uid() is null or not public.auth_session_is_current() then
    raise exception 'Please sign in again to cancel an order';
  end if;
  select * into _o from orders where id = _order_id for update;
  if not found or (_o.user_id <> auth.uid() and not public.is_admin(auth.uid())) then raise exception 'Order not found'; end if;
  if _o.user_id = auth.uid() and not public.is_admin(auth.uid()) and _o.status not in ('placed','confirmed') then
    raise exception 'This order is already packed and can no longer be cancelled';
  end if;
  if _o.status = 'cancelled' then return; end if;
  update orders set status = 'cancelled', updated_at = now() where id = _order_id;
  for _i in select * from order_items where order_id = _order_id loop
    if _i.product_id is not null then
      update products set stock = stock + _i.quantity where id = _i.product_id returning stock into _new;
      if found then
        insert into stock_adjustments (product_id, change, new_stock, reason, changed_by, order_id)
        values (_i.product_id, _i.quantity, _new, 'cancellation', auth.uid(), _order_id);
      end if;
    end if;
  end loop;
  insert into order_status_history (order_id, status, changed_by) values (_order_id, 'cancelled', auth.uid());
end $$;

create or replace function public.claim_owner()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.auth_session_is_current() then
    raise exception 'Please sign in again to claim store ownership';
  end if;
  perform pg_advisory_xact_lock(4242);
  if exists (select 1 from public.user_roles where role = 'owner') then return false; end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'owner') on conflict do nothing;
  return true;
end $$;

-- Expose the Auth session expiry to the backend only. Refreshing the JWT cannot extend it.
create or replace function public.get_auth_session_expiry(_session_id uuid)
returns timestamptz
language sql
stable
security definer
set search_path = ''
as $$
  select least(
    s.created_at + interval '24 hours',
    coalesce(s.not_after, 'infinity'::timestamptz)
  )
  from auth.sessions as s
  where s.id = _session_id
    and s.created_at is not null
    and s.created_at + interval '24 hours' > now()
    and (s.not_after is null or s.not_after > now());
$$;

revoke all on function public.get_auth_session_expiry(uuid) from public, anon, authenticated;
grant execute on function public.get_auth_session_expiry(uuid) to service_role;
