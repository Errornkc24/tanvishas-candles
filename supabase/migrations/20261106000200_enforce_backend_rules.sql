-- The Express API validates normal storefront requests, but Supabase's public
-- anon key can also be used to call PostgREST directly. Keep input invariants
-- in PostgreSQL so they cannot be bypassed by a direct client request.

alter table public.profiles
  add constraint profiles_first_name_length check (first_name is null or length(btrim(first_name)) <= 60) not valid,
  add constraint profiles_last_name_length check (last_name is null or length(btrim(last_name)) <= 60) not valid,
  add constraint profiles_phone_format check (
    phone is null or btrim(phone) = '' or btrim(phone) ~ '^[6-9][0-9]{9}$'
  ) not valid,
  add constraint profiles_instagram_length check (instagram is null or length(btrim(instagram)) <= 60) not valid;

alter table public.addresses
  add constraint addresses_full_name_length check (length(btrim(full_name)) between 2 and 100) not valid,
  add constraint addresses_phone_format check (btrim(phone) ~ '^[6-9][0-9]{9}$') not valid,
  add constraint addresses_line1_length check (length(btrim(line1)) between 5 and 300) not valid,
  add constraint addresses_landmark_length check (landmark is null or length(btrim(landmark)) <= 120) not valid,
  add constraint addresses_city_length check (length(btrim(city)) between 2 and 80) not valid,
  add constraint addresses_state_length check (length(btrim(state)) between 2 and 80) not valid,
  add constraint addresses_pincode_format check (btrim(pincode) ~ '^[0-9]{6}$') not valid;

alter table public.categories
  add constraint categories_name_length check (length(btrim(name)) between 1 and 80) not valid,
  add constraint categories_slug_format check (
    length(slug) between 1 and 80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ) not valid,
  add constraint categories_sort_nonnegative check (sort >= 0) not valid;

alter table public.products
  add constraint products_name_nonblank check (length(btrim(name)) >= 1) not valid,
  add constraint products_slug_format check (
    length(slug) between 1 and 80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ) not valid;

-- Role predicates are called by authenticated RLS policies. Do not expose them
-- to anonymous callers as SECURITY DEFINER role-enumeration helpers.
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
revoke all on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated, service_role;

-- SECURITY DEFINER admin functions must not inherit PostgreSQL's default
-- EXECUTE grant to PUBLIC. Their internal checks remain the authorization
-- boundary for authenticated calls.
revoke all on function public.claim_owner() from public, anon;
grant execute on function public.claim_owner() to authenticated;
revoke all on function public.store_has_owner() from public, anon;
grant execute on function public.store_has_owner() to authenticated;
revoke all on function public.admin_adjust_stock(uuid, integer, text, text) from public, anon;
grant execute on function public.admin_adjust_stock(uuid, integer, text, text) to authenticated;
revoke all on function public.admin_update_order(uuid, public.order_status, text, text, text) from public, anon;
grant execute on function public.admin_update_order(uuid, public.order_status, text, text, text) to authenticated;

-- Harden the remaining admin functions against search_path object shadowing and
-- make the owner bootstrap status obey the same session timebox as other APIs.
create or replace function public.store_has_owner()
returns boolean
language sql stable security definer set search_path = '' as $$
  select public.auth_session_is_current()
    and exists (select 1 from public.user_roles where role = 'owner');
$$;

create or replace function public.claim_owner()
returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.auth_session_is_current() then
    raise exception 'Please sign in again to claim store ownership';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(4242);
  if exists (select 1 from public.user_roles where role = 'owner') then return false; end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'owner') on conflict do nothing;
  return true;
end $$;

create or replace function public.admin_adjust_stock(
  _product_id uuid, _change integer, _reason text, _note text default null
)
returns integer
language plpgsql security definer set search_path = '' as $$
declare _new integer;
begin
  if not public.is_admin(auth.uid()) then raise exception 'Not allowed'; end if;
  if _change = 0 then raise exception 'Change cannot be zero'; end if;
  if _reason is null or _reason not in ('initial', 'restock', 'returned', 'correction', 'damaged', 'lost', 'gifted') then
    raise exception 'Invalid stock adjustment reason';
  end if;
  if length(coalesce(_note, '')) > 500 then raise exception 'Stock note is too long'; end if;
  select stock + _change into _new from public.products where id = _product_id for update;
  if not found then raise exception 'Product not found'; end if;
  if _new < 0 then raise exception 'Stock cannot go below zero'; end if;
  update public.products set stock = _new where id = _product_id;
  insert into public.stock_adjustments (product_id, change, new_stock, reason, note, changed_by)
  values (_product_id, _change, _new, coalesce(nullif(btrim(_reason), ''), 'manual'), _note, auth.uid());
  return _new;
end $$;

create or replace function public.admin_update_order(
  _order_id uuid, _status public.order_status, _note text default null,
  _courier text default null, _tracking text default null
)
returns void
language plpgsql security definer set search_path = '' as $$
declare _o record; _it record; _new integer;
begin
  if not public.is_admin(auth.uid()) then raise exception 'Not allowed'; end if;
  select * into _o from public.orders where id = _order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if _o.status = 'cancelled' then raise exception 'This order is already cancelled'; end if;
  if _o.status = 'delivered' and _status <> 'delivered' then
    raise exception 'Delivered orders cannot be changed';
  end if;
  update public.orders set status = _status,
    courier = coalesce(nullif(btrim(_courier), ''), courier),
    tracking_number = coalesce(nullif(btrim(_tracking), ''), tracking_number),
    payment_status = case when _status = 'delivered' then 'paid' else payment_status end,
    updated_at = now()
  where id = _order_id;
  if _status <> _o.status then
    insert into public.order_status_history (order_id, status, note, changed_by)
    values (_order_id, _status, _note, auth.uid());
  end if;
  if _status = 'cancelled' then
    for _it in
      select * from public.order_items where order_id = _order_id and product_id is not null
    loop
      update public.products set stock = stock + _it.quantity
      where id = _it.product_id returning stock into _new;
      if found then
        insert into public.stock_adjustments
          (product_id, change, new_stock, reason, note, changed_by, order_id)
        values (_it.product_id, _it.quantity, _new, 'order_cancelled', 'Cancelled by store', auth.uid(), _order_id);
      end if;
    end loop;
  end if;
end $$;

-- Dashboard business figures must cover the full database, not a browser page
-- capped at a fixed number of orders. The function returns only what the
-- authenticated store admin needs for the existing dashboard.
create or replace function public.admin_dashboard_summary()
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  _today timestamptz := date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata';
  _month timestamptz := date_trunc('month', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata';
  _orders_today bigint;
  _sales_today numeric;
  _sales_this_month numeric;
  _to_pack bigint;
  _recent jsonb;
  _low_stock jsonb;
begin
  if auth.uid() is null or not public.is_admin(auth.uid()) then
    raise exception 'Not allowed';
  end if;

  select
    count(*) filter (where created_at >= _today and status <> 'cancelled'),
    coalesce(sum(total) filter (where created_at >= _today and status <> 'cancelled'), 0),
    coalesce(sum(total) filter (where created_at >= _month and status <> 'cancelled'), 0),
    count(*) filter (where status in ('placed', 'confirmed', 'packed'))
  into _orders_today, _sales_today, _sales_this_month, _to_pack
  from public.orders;

  select coalesce(jsonb_agg(to_jsonb(recent) order by recent.created_at desc), '[]'::jsonb)
  into _recent
  from (
    select id, order_number, created_at, status, total, contact
    from public.orders order by created_at desc limit 8
  ) as recent;

  select coalesce(jsonb_agg(to_jsonb(low) order by low.stock, low.name), '[]'::jsonb)
  into _low_stock
  from (
    select id, name, stock, low_stock_threshold
    from public.products
    where archived = false and stock <= low_stock_threshold
  ) as low;

  return jsonb_build_object(
    'orders_today', _orders_today,
    'sales_today', _sales_today,
    'sales_this_month', _sales_this_month,
    'to_pack_count', _to_pack,
    'recent_orders', _recent,
    'low_stock', _low_stock
  );
end $$;
revoke all on function public.admin_dashboard_summary() from public, anon;
grant execute on function public.admin_dashboard_summary() to authenticated;

-- Keep the detailed sales report calculations on the server as well. The
-- browser supplies only the requested date range and display grouping; all
-- sums, status/payment groupings, and product totals come from database rows.
create or replace function public.admin_sales_report(_from date, _to date, _group text)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  _from_date date := _from;
  _prior_from date;
  _step interval;
  _period_start timestamp;
  _period_end timestamp;
  _result jsonb;
begin
  if auth.uid() is null or not public.is_admin(auth.uid()) then
    raise exception 'Not allowed';
  end if;
  if _from is null or _to is null or _to < _from or _group is null
    or _group not in ('day', 'month', 'year') then
    raise exception 'Invalid sales report range';
  end if;

  if _from = date '0001-01-01' then
    select coalesce(min(timezone('Asia/Kolkata', created_at)::date), _to)
      into _from_date from public.orders;
  end if;
  _prior_from := _from_date - (_to - _from_date + 1);
  _step := case _group when 'day' then interval '1 day'
    when 'month' then interval '1 month' else interval '1 year' end;
  _period_start := date_trunc(_group, _from_date::timestamp);
  _period_end := date_trunc(_group, _to::timestamp);

  with selected as materialized (
    select o.id, o.order_number, o.created_at, o.status, o.payment_status,
      o.payment_method, o.subtotal, o.shipping, o.total, o.local_date
    from (
      select id, order_number, created_at, status, payment_status, payment_method,
        subtotal, shipping, total, timezone('Asia/Kolkata', created_at)::date as local_date
      from public.orders
      where created_at >= (_from_date::timestamp at time zone 'Asia/Kolkata')
        and created_at < ((_to + 1)::timestamp at time zone 'Asia/Kolkata')
    ) as o
  ), live as materialized (
    select * from selected where status <> 'cancelled'
  ), report_orders as (
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'id', s.id, 'order_number', s.order_number, 'created_at', s.created_at,
        'status', s.status, 'payment_status', s.payment_status,
        'payment_method', s.payment_method, 'subtotal', s.subtotal,
        'shipping', s.shipping, 'total', s.total,
        'order_items', coalesce((
          select jsonb_agg(jsonb_build_object(
            'name', i.name, 'product_id', i.product_id, 'price', i.price, 'quantity', i.quantity
          ) order by i.id)
          from public.order_items as i where i.order_id = s.id
        ), '[]'::jsonb)
      ) order by s.created_at desc, s.id
    ), '[]'::jsonb) as payload from selected as s
  ), product_report as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'name', p.name, 'units', p.units, 'revenue', p.revenue
    ) order by p.revenue desc, p.name), '[]'::jsonb) as payload,
      coalesce(sum(p.units), 0) as units
    from (
      select coalesce(i.product_id::text, i.name) as product_key,
        (array_agg(i.name order by l.created_at desc, i.id))[1] as name,
        sum(i.quantity)::bigint as units,
        sum(i.price * i.quantity) as revenue
      from live as l join public.order_items as i on i.order_id = l.id
      group by coalesce(i.product_id::text, i.name)
    ) as p
  ), period_values as (
    select g.bucket,
      count(s.id) filter (where s.status <> 'cancelled') as orders,
      coalesce(sum(s.total) filter (where s.status <> 'cancelled'), 0) as revenue,
      coalesce(sum(s.total) filter (where s.status <> 'cancelled' and s.payment_status = 'paid'), 0) as collected,
      count(s.id) filter (where s.status = 'cancelled') as cancelled
    from generate_series(_period_start, _period_end, _step) as g(bucket)
    left join selected as s on date_trunc(_group, s.local_date::timestamp) = g.bucket
    group by g.bucket
  ), period_report as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'period', case _group when 'day' then to_char(pv.bucket, 'YYYY-MM-DD')
        when 'month' then to_char(pv.bucket, 'YYYY-MM') else to_char(pv.bucket, 'YYYY') end,
      'orders', pv.orders,
      'revenue', pv.revenue,
      'collected', pv.collected,
      'cancelled', pv.cancelled
    ) order by pv.bucket), '[]'::jsonb) as payload
    from period_values as pv
  ), payment_report as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'method', p.method,
      'label', case p.method when 'online' then 'Online'
        when 'cod' then 'Cash on Delivery' else 'Other' end,
      'count', p.order_count, 'value', p.value, 'paid', p.paid,
      'pending', p.value - p.paid
    ) order by case p.method when 'online' then 1 when 'cod' then 2 else 3 end), '[]'::jsonb) as payload
    from (
      select methods.method, coalesce(t.order_count, 0) as order_count,
        coalesce(t.value, 0) as value, coalesce(t.paid, 0) as paid
      from (values ('online'), ('cod')) as methods(method)
      left join (
        select payment_method as method, count(*) as order_count,
          coalesce(sum(total), 0) as value,
          coalesce(sum(total) filter (where payment_status = 'paid'), 0) as paid
        from live where payment_method in ('online', 'cod') group by payment_method
      ) as t on t.method = methods.method
      union all
      select 'other', count(*), coalesce(sum(total), 0),
        coalesce(sum(total) filter (where payment_status = 'paid'), 0)
      from live where payment_method not in ('online', 'cod')
      having count(*) > 0
    ) as p
  ), status_report as (
    select coalesce(jsonb_object_agg(status::text, order_count), '{}'::jsonb) as counts
    from (select status, count(*) as order_count from selected group by status) as s
  ), prior_report as (
    select coalesce(sum(total) filter (where status <> 'cancelled'), 0) as revenue
    from public.orders
    where created_at >= (_prior_from::timestamp at time zone 'Asia/Kolkata')
      and created_at < (_from_date::timestamp at time zone 'Asia/Kolkata')
  )
  select jsonb_build_object(
    'effective_from', _from_date,
    'effective_to', _to,
    'selected', report_orders.payload,
    'live_count', (select count(*) from live),
    'revenue', coalesce((select sum(total) from live), 0),
    'collected', coalesce((select sum(total) from live where payment_status = 'paid'), 0),
    'outstanding', coalesce((select sum(total) from live), 0)
      - coalesce((select sum(total) from live where payment_status = 'paid'), 0),
    'subtotal', coalesce((select sum(subtotal) from live), 0),
    'shipping', coalesce((select sum(shipping) from live), 0),
    'cancelled', (select count(*) from selected where status = 'cancelled'),
    'cancelled_value', coalesce((select sum(total) from selected where status = 'cancelled'), 0),
    'cancelled_paid', coalesce((select sum(total) from selected where status = 'cancelled' and payment_status = 'paid'), 0),
    'average', case when (select count(*) from live) = 0 then 0
      else (select sum(total) from live) / (select count(*) from live) end,
    'units', product_report.units,
    'products', product_report.payload,
    'periods', period_report.payload,
    'statuses', status_report.counts,
    'payments', payment_report.payload,
    'prior_revenue', prior_report.revenue,
    'growth_percent', case when prior_report.revenue = 0 then null
      else ((coalesce((select sum(total) from live), 0) - prior_report.revenue)
        / prior_report.revenue) * 100 end
  ) into _result
  from report_orders, product_report, period_report, payment_report, status_report, prior_report;

  return _result;
end $$;
revoke all on function public.admin_sales_report(date, date, text) from public, anon;
grant execute on function public.admin_sales_report(date, date, text) to authenticated;

-- Payment state is written only by the backend's service-role client. Keep the
-- remote-provider round trip outside the transaction, but make the final DB
-- writes conditional so cancellation or duplicate callbacks cannot overwrite
-- a different payment state.
create or replace function public.backend_set_razorpay_order(
  _order_id uuid, _razorpay_order_id text
)
returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  update public.orders
  set razorpay_order_id = _razorpay_order_id
  where id = _order_id and status <> 'cancelled' and payment_status <> 'paid'
    and (razorpay_order_id is null or razorpay_order_id = _razorpay_order_id);

  if found then return true; end if;
  return exists (
    select 1 from public.orders
    where id = _order_id and status <> 'cancelled'
      and payment_status <> 'paid' and razorpay_order_id = _razorpay_order_id
  );
end $$;
revoke all on function public.backend_set_razorpay_order(uuid, text) from public, anon, authenticated;
grant execute on function public.backend_set_razorpay_order(uuid, text) to service_role;

create or replace function public.backend_mark_order_paid(
  _order_id uuid, _razorpay_order_id text, _payment_id text, _paid_at timestamptz
)
returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  update public.orders
  set payment_method = 'online',
      payment_status = 'paid',
      razorpay_payment_id = _payment_id,
      paid_at = _paid_at,
      updated_at = _paid_at
  where id = _order_id and razorpay_order_id = _razorpay_order_id
    and payment_status <> 'paid';

  if found then return true; end if;
  return exists (
    select 1 from public.orders
    where id = _order_id and razorpay_order_id = _razorpay_order_id
      and payment_status = 'paid' and razorpay_payment_id = _payment_id
  );
end $$;
revoke all on function public.backend_mark_order_paid(uuid, text, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.backend_mark_order_paid(uuid, text, text, timestamptz)
  to service_role;

-- These predicates are intended to answer questions about the caller only.
-- Do not let an authenticated user probe another account's role by RPC.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = '' as $$
  select public.auth_session_is_current()
    and _user_id = auth.uid()
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = _role
    );
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql stable security definer set search_path = '' as $$
  select public.auth_session_is_current()
    and _user_id = auth.uid()
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role in ('owner', 'staff')
    );
$$;
