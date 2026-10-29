-- Starter inventory for the new catalogue. These are sample counts; change them
-- in the admin panel to match the physical stock before accepting real orders.
with starting_stock(slug, quantity) as (
  values
    ('daisy-candle', 12),
    ('lotus-urli-candle', 4),
    ('lotus-candle', 8),
    ('sunflower-candle', 5),
    ('tealight-candle', 12),
    ('diya-candle', 10),
    ('ladoo-candle', 8),
    ('iced-coffee-latte-candle', 4),
    ('scented-soy-candle', 7),
    ('daisy-candle-with-jar', 8),
    ('cube-candle', 5),
    ('tulip-candle', 10)
), changed as (
  update public.products p
  set stock = starting_stock.quantity
  from starting_stock
  where p.slug = starting_stock.slug
    and p.stock = 0
    and starting_stock.quantity > 0
  returning p.id, p.stock
)
insert into public.stock_adjustments (product_id, change, new_stock, reason, note)
select
  id,
  stock,
  stock,
  'initial',
  'Sample starter inventory; adjust to physical stock count.'
from changed;
