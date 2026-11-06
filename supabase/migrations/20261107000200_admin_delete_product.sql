-- Only admins may remove a product. Preserve product rows referenced by sales
-- or stock history by archiving them instead of deleting their records.
create or replace function public.admin_delete_product(_product_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.auth_session_is_current()
    or not public.is_admin(auth.uid()) then
    raise exception 'Only store admins can delete products';
  end if;

  perform 1 from public.products where id = _product_id for update;
  if not found then raise exception 'Product not found'; end if;

  if exists (select 1 from public.order_items where product_id = _product_id)
    or exists (select 1 from public.stock_adjustments where product_id = _product_id) then
    update public.products set archived = true where id = _product_id;
    return 'archived';
  end if;

  delete from public.products where id = _product_id;
  return 'deleted';
end;
$$;

revoke all on function public.admin_delete_product(uuid) from public, anon;
grant execute on function public.admin_delete_product(uuid) to authenticated;
