-- Insert test artworks for each artist
INSERT INTO public.artworks (id, title, description, price, artist_id, status, images, created_at, updated_at)
VALUES
  -- Emma Davis - Abstract Expressionist
  ('00000000-0000-0000-1111-000000000001', 'Waves of Emotion', 'Abstract expressionist piece exploring the depths of human emotion', 2500.00, '00000000-0000-0000-0000-000000000011', 'published',
   jsonb_build_array(
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1615184697985-c9bde1b07da7', 'isPrimary', true),
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1615184697985-c9bde1b07da7', 'isPrimary', false)
   ),
   now(), now()),
  ('00000000-0000-0000-1111-000000000002', 'Urban Symphony', 'A vibrant exploration of city life through abstract forms', 1800.00, '00000000-0000-0000-0000-000000000011', 'published',
   jsonb_build_array(
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5', 'isPrimary', true)
   ),
   now(), now()),

  -- David Wilson - Digital Artist
  ('00000000-0000-0000-1111-000000000003', 'Digital Dreams', 'NFT artwork exploring the intersection of reality and digital space', 800.00, '00000000-0000-0000-0000-000000000012', 'published',
   jsonb_build_array(
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', 'isPrimary', true),
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', 'isPrimary', false)
   ),
   now(), now()),

  -- Lisa Chen - Traditional Oil Painter
  ('00000000-0000-0000-1111-000000000004', 'Morning Light', 'Oil portrait capturing the serene beauty of early morning', 3500.00, '00000000-0000-0000-0000-000000000013', 'published',
   jsonb_build_array(
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5', 'isPrimary', true),
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5', 'isPrimary', false)
   ),
   now(), now()),

  -- Marcus Rodriguez - Street Artist
  ('00000000-0000-0000-1111-000000000005', 'Urban Stories', 'Large-scale mural design celebrating community diversity', 2200.00, '00000000-0000-0000-0000-000000000014', 'published',
   jsonb_build_array(
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1561059488-916d69792237', 'isPrimary', true),
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1561059488-916d69792237', 'isPrimary', false)
   ),
   now(), now()),

  -- Nina Patel - Mixed Media
  ('00000000-0000-0000-1111-000000000006', 'Recycled Dreams', 'Mixed media installation using sustainable materials', 4500.00, '00000000-0000-0000-0000-000000000015', 'published',
   jsonb_build_array(
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7', 'isPrimary', true),
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7', 'isPrimary', false)
   ),
   now(), now()),

  -- Thomas Wright - Sculptor
  ('00000000-0000-0000-1111-000000000007', 'Earth and Sky', 'Sustainable sculpture combining wood and recycled metal', 5500.00, '00000000-0000-0000-0000-000000000016', 'published',
   jsonb_build_array(
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1620503374956-c942862f0372', 'isPrimary', true),
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1620503374956-c942862f0372', 'isPrimary', false)
   ),
   now(), now()),

  -- Yuki Tanaka - Japanese Calligraphy
  ('00000000-0000-0000-1111-000000000008', 'Harmony', 'Contemporary calligraphy piece exploring balance and peace', 1200.00, '00000000-0000-0000-0000-000000000017', 'published',
   jsonb_build_array(
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1603665301175-57ba46f392bf', 'isPrimary', true),
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1603665301175-57ba46f392bf', 'isPrimary', false)
   ),
   now(), now()),

  -- Clara Fontaine - Watercolor
  ('00000000-0000-0000-1111-000000000009', 'Spring Garden', 'Botanical watercolor series featuring local flora', 900.00, '00000000-0000-0000-0000-000000000018', 'published',
   jsonb_build_array(
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1582454235987-03b10219e011', 'isPrimary', true),
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1582454235987-03b10219e011', 'isPrimary', false)
   ),
   now(), now()),

  -- Hassan Ahmed - Islamic Art
  ('00000000-0000-0000-1111-000000000010', 'Geometric Harmony', 'Contemporary Islamic geometric patterns in vibrant colors', 2800.00, '00000000-0000-0000-0000-000000000019', 'published',
   jsonb_build_array(
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1582454235987-03b10219e011', 'isPrimary', true),
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1582454235987-03b10219e011', 'isPrimary', false)
   ),
   now(), now()),

  -- Isabella Santos - Multimedia
  ('00000000-0000-0000-1111-000000000011', 'Digital Metamorphosis', 'Interactive multimedia installation exploring transformation', 3800.00, '00000000-0000-0000-0000-000000000020', 'published',
   jsonb_build_array(
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', 'isPrimary', true),
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', 'isPrimary', false)
   ),
   now(), now())
ON CONFLICT (id) DO NOTHING;

-- Add some draft artworks too
INSERT INTO public.artworks (id, title, description, price, artist_id, status, images, created_at, updated_at)
VALUES
  -- Emma Davis - Draft work
  ('00000000-0000-0000-1111-000000000012', 'Work in Progress', 'New abstract piece exploring light and shadow', 2200.00, '00000000-0000-0000-0000-000000000011', 'draft',
   jsonb_build_array(
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1615184697985-c9bde1b07da7', 'isPrimary', true)
   ),
   now(), now()),

  -- David Wilson - Draft work
  ('00000000-0000-0000-1111-000000000013', 'Upcoming NFT', 'Preview of new digital art collection', 1500.00, '00000000-0000-0000-0000-000000000012', 'draft',
   jsonb_build_array(
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', 'isPrimary', true)
   ),
   now(), now()),

  -- Lisa Chen - Draft work
  ('00000000-0000-0000-1111-000000000014', 'Portrait Study', 'Work in progress portrait commission', 4000.00, '00000000-0000-0000-0000-000000000013', 'draft',
   jsonb_build_array(
     jsonb_build_object('url', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5', 'isPrimary', true)
   ),
   now(), now()); 