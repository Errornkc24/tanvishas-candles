-- Replace the starter listings with the requested CANDLEVERSE catalogue.
-- Existing products are archived rather than deleted so order and stock records remain intact.
insert into public.categories (name, slug, description, image_url, sort) values
  ('Decorative Candles', 'decorative-candles', 'Sculptural candles for gifting and home decor.', '/images/catalog/lotus-candle.webp', 1),
  ('Jar Candles', 'jar-candles', 'Decorative and scented candles in jars.', '/images/catalog/iced-coffee-latte-candle.webp', 2),
  ('Tealights', 'tealights', 'Small candles for warm corners and celebrations.', '/images/catalog/tealight-candle.webp', 3),
  ('Special Candles', 'special-candles', 'Seasonal designs and distinctive candle styles.', '/images/catalog/valentine-special-candle.webp', 4)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  sort = excluded.sort;

update public.products set archived = true
where slug not in (
  'daisy-candle', 'lotus-urli-candle', 'lotus-candle', 'sunflower-candle',
  'tealight-candle', 'laddu-candle-with-jar', 'diya-candle', 'ladoo-candle',
  'iced-coffee-latte-candle', 'scented-soy-candle', 'valentine-special-candle',
  'daisy-candle-with-jar', 'cube-candle', 'rainbow-candle', 'tulip-candle', 'rose-candle'
);

insert into public.products (
  name, slug, short_description, description, scent_notes, burn_time, size, price,
  category_id, images, stock, featured, bestseller, created_at
)
select c.name, c.slug, c.short_description, c.description, '{}'::text[], null, c.size,
  c.price, cat.id, array[c.image], 0, c.featured, c.featured, now() - c.position * interval '1 second'
from (values
  ('Daisy Candle', 'daisy-candle', 'Handmade candle · 1 piece', 'Handmade daisy-shaped candle. Quantity: 1 piece.', '1 piece', 30::numeric, '/images/catalog/daisy-candle.webp', 'decorative-candles', 1, true),
  ('Lotus Urli Candle', 'lotus-urli-candle', 'Handmade candle · 1 piece · 3.5 inch', 'Handmade lotus urli candle. Quantity: 1 piece. Size: 3.5 inch.', '3.5 inch', 100::numeric, '/images/catalog/lotus-urli-candle.webp', 'decorative-candles', 2, true),
  ('Lotus Candle', 'lotus-candle', 'Handmade candle · 1 piece', 'Handmade lotus-shaped candle. Quantity: 1 piece.', '1 piece', 70::numeric, '/images/catalog/lotus-candle.webp', 'decorative-candles', 3, true),
  ('Sunflower Candle', 'sunflower-candle', 'Handmade candle · 1 piece', 'Handmade sunflower-shaped candle. Quantity: 1 piece.', '1 piece', 30::numeric, '/images/catalog/sunflower-candle.webp', 'decorative-candles', 4, true),
  ('Tealight Candle', 'tealight-candle', 'Handmade candle · 6 pieces', 'Set of handmade tealight candles. Quantity: 6 pieces.', '6 pieces', 110::numeric, '/images/catalog/tealight-candle.webp', 'tealights', 5, false),
  ('Laddu Candle with Jar', 'laddu-candle-with-jar', 'Handmade candle · 1 piece', 'Handmade laddu candle with jar. Quantity: 1 piece.', '1 piece', 150::numeric, '/images/catalog/laddu-candle-with-jar.webp', 'jar-candles', 6, false),
  ('Diya Candle', 'diya-candle', 'Handmade candle · 1 piece', 'Handmade diya-shaped candle. Quantity: 1 piece.', '1 piece', 35::numeric, '/images/catalog/diya-candle.webp', 'decorative-candles', 7, false),
  ('Ladoo Candle', 'ladoo-candle', 'Handmade candle · 1 piece', 'Handmade ladoo-shaped candle. Quantity: 1 piece.', '1 piece', 35::numeric, '/images/catalog/ladoo-candle.webp', 'decorative-candles', 8, false),
  ('Iced Coffee Latte Candle', 'iced-coffee-latte-candle', 'Handmade candle · 1 piece', 'Handmade iced coffee latte candle. Quantity: 1 piece.', '1 piece', 190::numeric, '/images/catalog/iced-coffee-latte-candle.webp', 'jar-candles', 9, false),
  ('Scented Soy Candle', 'scented-soy-candle', 'Handmade candle · 1 piece', 'Handmade scented soy candle. Quantity: 1 piece.', '1 piece', 180::numeric, '/images/catalog/scented-soy-candle.webp', 'jar-candles', 10, false),
  ('Valentine Special Candle', 'valentine-special-candle', 'Handmade candle · 1 piece', 'Handmade Valentine special candle. Quantity: 1 piece.', '1 piece', 130::numeric, '/images/catalog/valentine-special-candle.webp', 'special-candles', 11, false),
  ('Daisy Candle with Jar', 'daisy-candle-with-jar', 'Handmade candle · 1 piece', 'Handmade daisy candle with jar. Quantity: 1 piece.', '1 piece', 170::numeric, '/images/catalog/daisy-candle-with-jar.webp', 'jar-candles', 12, false),
  ('Cube Candle', 'cube-candle', 'Handmade candle · 1 piece', 'Handmade cube-shaped candle. Quantity: 1 piece.', '1 piece', 80::numeric, '/images/catalog/cube-candle.webp', 'decorative-candles', 13, false),
  ('Rainbow Candle', 'rainbow-candle', 'Handmade candle · 1 piece', 'Handmade rainbow candle. Quantity: 1 piece.', '1 piece', 140::numeric, '/images/catalog/rainbow-candle.webp', 'special-candles', 14, false),
  ('Tulip Candle', 'tulip-candle', 'Handmade candle · 1 piece', 'Handmade tulip-shaped candle. Quantity: 1 piece.', '1 piece', 170::numeric, '/images/catalog/tulip-candle.webp', 'decorative-candles', 15, false),
  ('Rose Candle', 'rose-candle', 'Handmade candle · 1 piece', 'Handmade rose-shaped candle. Quantity: 1 piece.', '1 piece', 50::numeric, '/images/catalog/rose-candle.webp', 'decorative-candles', 16, false)
) as c(name, slug, short_description, description, size, price, image, category_slug, position, featured)
join public.categories cat on cat.slug = c.category_slug
on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  size = excluded.size,
  price = excluded.price,
  category_id = excluded.category_id,
  images = excluded.images,
  featured = excluded.featured,
  bestseller = excluded.bestseller,
  archived = false;

delete from public.categories where slug in ('floral', 'woody', 'fresh', 'sweet');
