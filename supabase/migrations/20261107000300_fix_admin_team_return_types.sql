-- Keep the RPC's returned column types explicit for PostgREST/PostgreSQL.
-- Read email from Auth first so accounts without a profile row still appear.
create or replace function public.admin_team()
returns table (
  user_id uuid,
  email text,
  name text,
  role public.app_role
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.has_role(auth.uid(), 'owner'::public.app_role) then
    raise exception 'Only the owner can manage the team';
  end if;

  return query
    select
      r.user_id::uuid,
      coalesce(u.email::text, p.email::text)::text,
      pg_catalog.btrim(
        coalesce(p.first_name::text, '') || ' ' || coalesce(p.last_name::text, '')
      )::text,
      r.role::public.app_role
    from public.user_roles as r
    left join auth.users as u on u.id = r.user_id
    left join public.profiles as p on p.id = r.user_id
    where r.role in ('owner'::public.app_role, 'staff'::public.app_role)
    order by r.role, coalesce(u.email::text, p.email::text);
end;
$$;

revoke all on function public.admin_team() from public, anon;
grant execute on function public.admin_team() to authenticated;
