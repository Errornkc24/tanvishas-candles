-- Keep statuses forward-only while allowing admins to select any later stage.
create or replace function public.enforce_order_status_progression()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  old_step integer;
  new_step integer;
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status = 'cancelled' then
    return new;
  end if;

  if old.status = 'cancelled' then
    raise exception 'Cancelled orders cannot be reopened';
  end if;

  old_step := case old.status
    when 'placed' then 1
    when 'confirmed' then 2
    when 'packed' then 3
    when 'shipped' then 4
    when 'out_for_delivery' then 5
    when 'delivered' then 6
    else 0
  end;
  new_step := case new.status
    when 'placed' then 1
    when 'confirmed' then 2
    when 'packed' then 3
    when 'shipped' then 4
    when 'out_for_delivery' then 5
    when 'delivered' then 6
    else 0
  end;

  if new_step > old_step then
    return new;
  end if;

  raise exception 'Order status cannot move backwards';
end;
$$;
