-- Insert regular users
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES 
  -- Regular users
  ('00000000-0000-0000-0000-000000000001', 'user1@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'user2@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'user3@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'user4@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000005', 'user5@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000006', 'user6@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000007', 'user7@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000008', 'user8@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000009', 'user9@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000010', 'user10@example.com', now(), now(), now()),
  
  -- Artists
  ('00000000-0000-0000-0000-000000000011', 'artist1@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000012', 'artist2@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000013', 'artist3@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000014', 'artist4@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000015', 'artist5@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000016', 'artist6@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000017', 'artist7@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000018', 'artist8@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000019', 'artist9@example.com', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000020', 'artist10@example.com', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert corresponding profiles
INSERT INTO public.profiles (id, email, name, bio, website, instagram, role, created_at, updated_at)
VALUES
  -- Regular users
  ('00000000-0000-0000-0000-000000000001', 'user1@example.com', 'John Smith', 'Art enthusiast and collector focusing on contemporary pieces', 'https://johnsmith.com', '@johnsmith', 'user', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'user2@example.com', 'Sarah Johnson', 'Love discovering emerging artists and supporting local galleries', 'https://sarahjohnson.com', '@sarahj', 'user', now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'user3@example.com', 'Michael Brown', 'Contemporary art collector with a passion for abstract expressionism', 'https://michaelbrown.com', '@mikebrown', 'user', now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'user4@example.com', 'Emily Wilson', 'Digital art enthusiast and NFT collector', 'https://emilywilson.com', '@emilyw', 'user', now(), now()),
  ('00000000-0000-0000-0000-000000000005', 'user5@example.com', 'James Lee', 'Traditional art lover with focus on Asian ceramics', 'https://jameslee.com', '@jameslee', 'user', now(), now()),
  ('00000000-0000-0000-0000-000000000006', 'user6@example.com', 'Maria Garcia', 'Modern art curator and collector', 'https://mariagarcia.com', '@mariag', 'user', now(), now()),
  ('00000000-0000-0000-0000-000000000007', 'user7@example.com', 'Robert Taylor', 'Photography enthusiast and print collector', 'https://roberttaylor.com', '@robtaylor', 'user', now(), now()),
  ('00000000-0000-0000-0000-000000000008', 'user8@example.com', 'Lisa Anderson', 'Sculpture and installation art lover', 'https://lisaanderson.com', '@lisaa', 'user', now(), now()),
  ('00000000-0000-0000-0000-000000000009', 'user9@example.com', 'David Martinez', 'Street art and urban culture enthusiast', 'https://davidmartinez.com', '@davidm', 'user', now(), now()),
  ('00000000-0000-0000-0000-000000000010', 'user10@example.com', 'Sophie Turner', 'Pop art and contemporary collector', 'https://sophieturner.com', '@sophiet', 'user', now(), now()),
  
  -- Artists
  ('00000000-0000-0000-0000-000000000011', 'artist1@example.com', 'Emma Davis', 'Contemporary painter specializing in abstract expressionism', 'https://emmadavis.art', '@emmadavisart', 'artist', now(), now()),
  ('00000000-0000-0000-0000-000000000012', 'artist2@example.com', 'David Wilson', 'Digital artist and NFT creator', 'https://davidwilson.art', '@davidwilsonart', 'artist', now(), now()),
  ('00000000-0000-0000-0000-000000000013', 'artist3@example.com', 'Lisa Chen', 'Traditional oil painter focusing on portraits', 'https://lisachen.art', '@lisachenart', 'artist', now(), now()),
  ('00000000-0000-0000-0000-000000000014', 'artist4@example.com', 'Marcus Rodriguez', 'Street artist and muralist', 'https://marcusrodriguez.art', '@marcusrodriguezart', 'artist', now(), now()),
  ('00000000-0000-0000-0000-000000000015', 'artist5@example.com', 'Nina Patel', 'Mixed media artist specializing in installations', 'https://ninapatel.art', '@ninapatelart', 'artist', now(), now()),
  ('00000000-0000-0000-0000-000000000016', 'artist6@example.com', 'Thomas Wright', 'Sculptor working with sustainable materials', 'https://thomaswright.art', '@thomaswrightart', 'artist', now(), now()),
  ('00000000-0000-0000-0000-000000000017', 'artist7@example.com', 'Yuki Tanaka', 'Contemporary Japanese calligraphy artist', 'https://yukitanaka.art', '@yukitanakaart', 'artist', now(), now()),
  ('00000000-0000-0000-0000-000000000018', 'artist8@example.com', 'Clara Fontaine', 'Watercolor artist specializing in botanicals', 'https://clarafontaine.art', '@clarafontaineart', 'artist', now(), now()),
  ('00000000-0000-0000-0000-000000000019', 'artist9@example.com', 'Hassan Ahmed', 'Contemporary Islamic art and geometry', 'https://hassanahmed.art', '@hassanahmedart', 'artist', now(), now()),
  ('00000000-0000-0000-0000-000000000020', 'artist10@example.com', 'Isabella Santos', 'Experimental multimedia artist', 'https://isabellasantos.art', '@isabellasantosart', 'artist', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Update artist profiles with approved status
UPDATE public.profiles
SET 
  artist_status = 'approved',
  artist_approved_at = now(),
  artist_approved_by = '00000000-0000-0000-0000-000000000001'
WHERE id IN (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000014',
  '00000000-0000-0000-0000-000000000015',
  '00000000-0000-0000-0000-000000000016',
  '00000000-0000-0000-0000-000000000017',
  '00000000-0000-0000-0000-000000000018',
  '00000000-0000-0000-0000-000000000019',
  '00000000-0000-0000-0000-000000000020'
); 