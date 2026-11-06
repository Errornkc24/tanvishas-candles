-- Public visitors may read active catalog items without execute permission on
-- the SECURITY DEFINER admin predicate. Authenticated reads keep the session
-- timebox and may also include archived items for store admins.
drop policy if exists "prod read" on public.products;
drop policy if exists "prod read anon" on public.products;
drop policy if exists "prod read authenticated" on public.products;

create policy "prod read anon"
  on public.products for select to anon
  using (archived = false);

create policy "prod read authenticated"
  on public.products for select to authenticated
  using (
    public.auth_session_is_current()
    and (archived = false or public.is_admin(auth.uid()))
  );

grant select on public.products to anon, authenticated;
