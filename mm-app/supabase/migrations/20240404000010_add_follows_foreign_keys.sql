-- Add foreign key constraints for follows table
ALTER TABLE public.follows
  ADD CONSTRAINT follows_follower_id_fkey 
  FOREIGN KEY (follower_id) 
  REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT follows_following_id_fkey 
  FOREIGN KEY (following_id) 
  REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id); 