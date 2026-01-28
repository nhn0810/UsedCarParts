-- Seed Data for Products
INSERT INTO products (title, description, price, images, brand_id, category_id, year, status, user_id)
SELECT
  'Hyundai Sonata 2018 Headlight',
  'Original headlight for Sonata 2018. Good condition.',
  150000,
  ARRAY['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=500'],
  (SELECT id FROM brands WHERE name = 'Hyundai' LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Exterior' LIMIT 1),
  2018,
  'available',
  (SELECT id FROM profiles LIMIT 1); -- Assumes at least one profile exists. If not, this might fail or insert null if nullable (it is not nullable).

-- Insert a product with NO image to test the Red X
INSERT INTO products (title, description, price, images, brand_id, category_id, year, status, user_id)
SELECT
  'Kia Sorento Suspension Kit',
  'Full suspension kit used. Needs refurbishment.',
  85000,
  '{}',
  (SELECT id FROM brands WHERE name = 'Kia' LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Suspension' LIMIT 1),
  2015,
  'available',
  (SELECT id FROM profiles LIMIT 1);

-- Insert more sample data
INSERT INTO products (title, description, price, images, brand_id, category_id, year, status, user_id)
SELECT
  'BMW 3 Series Brake Pads',
  'Unused new brake pads for BMW f30.',
  120000,
  ARRAY['https://images.unsplash.com/photo-1626244669866-9311664c2049?auto=format&fit=crop&q=80&w=500'],
  (SELECT id FROM brands WHERE name = 'BMW' LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Brake' LIMIT 1),
  2020,
  'available',
  (SELECT id FROM profiles LIMIT 1);

INSERT INTO products (title, description, price, images, brand_id, category_id, year, status, user_id)
SELECT
  'Mercedes Benz C-Class Mirror',
  'Side mirror right side. Black color.',
  250000,
  ARRAY['https://images.unsplash.com/photo-1598202078696-68153448373b?auto=format&fit=crop&q=80&w=500'],
  (SELECT id FROM brands WHERE name = 'Mercedes-Benz' LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Exterior' LIMIT 1),
  2019,
  'available',
  (SELECT id FROM profiles LIMIT 1);
