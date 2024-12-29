-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can view all events" ON public.user_events;
DROP POLICY IF EXISTS "Admins can view all feature usage" ON public.feature_usage;
DROP POLICY IF EXISTS "Admins can view all role conversions" ON public.role_conversions;

-- Add admin policies for analytics tables
CREATE POLICY "Admins can view all sessions"
  ON public.user_sessions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can view all events"
  ON public.user_events FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can view all feature usage"
  ON public.feature_usage FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can view all role conversions"
  ON public.role_conversions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  ); 