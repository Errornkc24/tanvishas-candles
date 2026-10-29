-- Order progress may stay the same for metadata edits, move forward one step,
-- or be cancelled. This also protects writes that bypass the admin UI.
create or replace function public.enforce_order_status_progression()
returns trigger
language plpgsql
set search_path = public
as $$
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

  if (old.status = 'placed' and new.status = 'confirmed')
    or (old.status = 'confirmed' and new.status = 'packed')
    or (old.status = 'packed' and new.status = 'shipped')
    or (old.status = 'shipped' and new.status = 'out_for_delivery')
    or (old.status = 'out_for_delivery' and new.status = 'delivered') then
    return new;
  end if;

  raise exception 'Order status can only move to the next step';
end;
$$;

drop trigger if exists enforce_order_status_progression on public.orders;
create trigger enforce_order_status_progression
before update of status on public.orders
for each row
execute function public.enforce_order_status_progression();
