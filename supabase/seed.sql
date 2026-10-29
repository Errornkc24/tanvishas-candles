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

insert into public.products (name, slug, short_description, description, scent_notes, burn_time, size, price, category_id, images, stock, featured, bestseller, created_at) values
  ('Daisy Candle', 'daisy-candle', 'Handmade candle · 1 piece', 'Handmade daisy-shaped candle. Quantity: 1 piece.', '{}', null, '1 piece', 30, (select id from public.categories where slug = 'decorative-candles'), '{/images/catalog/daisy-candle.webp}', 12, true, true, now() - interval '1 second'),
  ('Lotus Urli Candle', 'lotus-urli-candle', 'Handmade candle · 1 piece · 3.5 inch', 'Handmade lotus urli candle. Quantity: 1 piece. Size: 3.5 inch.', '{}', null, '3.5 inch', 100, (select id from public.categories where slug = 'decorative-candles'), '{/images/catalog/lotus-urli-candle.webp}', 4, true, true, now() - interval '2 seconds'),
  ('Lotus Candle', 'lotus-candle', 'Handmade candle · 1 piece', 'Handmade lotus-shaped candle. Quantity: 1 piece.', '{}', null, '1 piece', 70, (select id from public.categories where slug = 'decorative-candles'), '{/images/catalog/lotus-candle.webp}', 8, true, true, now() - interval '3 seconds'),
  ('Sunflower Candle', 'sunflower-candle', 'Handmade candle · 1 piece', 'Handmade sunflower-shaped candle. Quantity: 1 piece.', '{}', null, '1 piece', 30, (select id from public.categories where slug = 'decorative-candles'), '{/images/catalog/sunflower-candle.webp}', 5, true, true, now() - interval '4 seconds'),
  ('Tealight Candle', 'tealight-candle', 'Handmade candle · 6 pieces', 'Set of handmade tealight candles. Quantity: 6 pieces.', '{}', null, '6 pieces', 110, (select id from public.categories where slug = 'tealights'), '{/images/catalog/tealight-candle.webp}', 12, false, false, now() - interval '5 seconds'),
  ('Laddu Candle with Jar', 'laddu-candle-with-jar', 'Handmade candle · 1 piece', 'Handmade laddu candle with jar. Quantity: 1 piece.', '{}', null, '1 piece', 150, (select id from public.categories where slug = 'jar-candles'), '{/images/catalog/laddu-candle-with-jar.webp}', 0, false, false, now() - interval '6 seconds'),
  ('Diya Candle', 'diya-candle', 'Handmade candle · 1 piece', 'Handmade diya-shaped candle. Quantity: 1 piece.', '{}', null, '1 piece', 35, (select id from public.categories where slug = 'decorative-candles'), '{/images/catalog/diya-candle.webp}', 10, false, false, now() - interval '7 seconds'),
  ('Ladoo Candle', 'ladoo-candle', 'Handmade candle · 1 piece', 'Handmade ladoo-shaped candle. Quantity: 1 piece.', '{}', null, '1 piece', 35, (select id from public.categories where slug = 'decorative-candles'), '{/images/catalog/ladoo-candle.webp}', 8, false, false, now() - interval '8 seconds'),
  ('Iced Coffee Latte Candle', 'iced-coffee-latte-candle', 'Handmade candle · 1 piece', 'Handmade iced coffee latte candle. Quantity: 1 piece.', '{}', null, '1 piece', 190, (select id from public.categories where slug = 'jar-candles'), '{/images/catalog/iced-coffee-latte-candle.webp}', 4, false, false, now() - interval '9 seconds'),
  ('Scented Soy Candle', 'scented-soy-candle', 'Handmade candle · 1 piece', 'Handmade scented soy candle. Quantity: 1 piece.', '{}', null, '1 piece', 180, (select id from public.categories where slug = 'jar-candles'), '{/images/catalog/scented-soy-candle.webp}', 7, false, false, now() - interval '10 seconds'),
  ('Valentine Special Candle', 'valentine-special-candle', 'Handmade candle · 1 piece', 'Handmade Valentine special candle. Quantity: 1 piece.', '{}', null, '1 piece', 130, (select id from public.categories where slug = 'special-candles'), '{/images/catalog/valentine-special-candle.webp}', 0, false, false, now() - interval '11 seconds'),
  ('Daisy Candle with Jar', 'daisy-candle-with-jar', 'Handmade candle · 1 piece', 'Handmade daisy candle with jar. Quantity: 1 piece.', '{}', null, '1 piece', 170, (select id from public.categories where slug = 'jar-candles'), '{/images/catalog/daisy-candle-with-jar.webp}', 8, false, false, now() - interval '12 seconds'),
  ('Cube Candle', 'cube-candle', 'Handmade candle · 1 piece', 'Handmade cube-shaped candle. Quantity: 1 piece.', '{}', null, '1 piece', 80, (select id from public.categories where slug = 'decorative-candles'), '{/images/catalog/cube-candle.webp}', 5, false, false, now() - interval '13 seconds'),
  ('Rainbow Candle', 'rainbow-candle', 'Handmade candle · 1 piece', 'Handmade rainbow candle. Quantity: 1 piece.', '{}', null, '1 piece', 140, (select id from public.categories where slug = 'special-candles'), '{/images/catalog/rainbow-candle.webp}', 0, false, false, now() - interval '14 seconds'),
  ('Tulip Candle', 'tulip-candle', 'Handmade candle · 1 piece', 'Handmade tulip-shaped candle. Quantity: 1 piece.', '{}', null, '1 piece', 170, (select id from public.categories where slug = 'decorative-candles'), '{/images/catalog/tulip-candle.webp}', 10, false, false, now() - interval '15 seconds'),
  ('Rose Candle', 'rose-candle', 'Handmade candle · 1 piece', 'Handmade rose-shaped candle. Quantity: 1 piece.', '{}', null, '1 piece', 50, (select id from public.categories where slug = 'decorative-candles'), '{/images/catalog/rose-candle.webp}', 0, false, false, now() - interval '16 seconds')
on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  scent_notes = excluded.scent_notes,
  burn_time = excluded.burn_time,
  size = excluded.size,
  price = excluded.price,
  category_id = excluded.category_id,
  images = excluded.images,
  stock = excluded.stock,
  featured = excluded.featured,
  bestseller = excluded.bestseller,
  archived = false,
  created_at = excluded.created_at;

delete from public.categories where slug in ('floral', 'woody', 'fresh', 'sweet');
