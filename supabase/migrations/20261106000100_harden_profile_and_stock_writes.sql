-- Profile email is managed by Supabase Auth. Keep it read-only in public.profiles,
-- since team role assignment must resolve identity from auth.users.
revoke update on table public.profiles from authenticated;
grant update (first_name, last_name, phone, instagram)
  on table public.profiles to authenticated;

-- Product stock changes must go through admin_adjust_stock or transactional order
-- functions so every adjustment is recorded in stock_adjustments.
revoke insert, update on table public.products from authenticated;
revoke delete on table public.products from authenticated;
grant insert (
  name, slug, short_description, description, scent_notes, burn_time, size,
  price, category_id, images, low_stock_threshold, featured, bestseller, archived
) on table public.products to authenticated;
grant update (
  name, slug, short_description, description, scent_notes, burn_time, size,
  price, category_id, images, low_stock_threshold, featured, bestseller, archived
) on table public.products to authenticated;

create or replace function public.admin_team()
returns table(user_id uuid, email text, name text, role public.app_role)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.has_role(auth.uid(), 'owner') then
    raise exception 'Only the owner can manage the team';
  end if;

  return query
    select r.user_id, u.email,
      trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')),
      r.role
    from public.user_roles as r
    left join auth.users as u on u.id = r.user_id
    left join public.profiles as p on p.id = r.user_id
    where r.role in ('owner', 'staff')
    order by r.role, u.email;
end;
$$;

create or replace function public.admin_set_role(
  _email text,
  _role public.app_role,
  _grant boolean
)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  _uid uuid;
begin
  if _role not in ('owner', 'staff') then
    raise exception 'Invalid role';
  end if;
  -- Serialize owner grants/removals so two owners cannot concurrently remove
  -- each other and leave the store without an owner.
  perform pg_catalog.pg_advisory_xact_lock(4243);
  if not public.has_role(auth.uid(), 'owner') then
    raise exception 'Only the owner can manage the team';
  end if;

  select u.id into _uid
  from auth.users as u
  where lower(u.email) = lower(trim(_email))
  limit 1;
  if _uid is null then
    raise exception 'No account found with that email. Ask them to sign up first.';
  end if;

  if _grant then
    insert into public.user_roles (user_id, role)
    values (_uid, _role) on conflict do nothing;
  else
    if _role = 'owner'
      and (select count(*) from public.user_roles where role = 'owner') <= 1 then
      raise exception 'The store needs at least one owner';
    end if;
    delete from public.user_roles where user_id = _uid and role = _role;
  end if;
end;
$$;

revoke all on function public.admin_team() from public, anon;
grant execute on function public.admin_team() to authenticated;
revoke all on function public.admin_set_role(text, public.app_role, boolean) from public, anon;
grant execute on function public.admin_set_role(text, public.app_role, boolean) to authenticated;
