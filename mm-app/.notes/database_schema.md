# Database Schema

## Tables and Relationships
### ai_settings
- id -> ai_settings.id (PRIMARY KEY)

### artist_features
- user_id -> profiles.id (PRIMARY KEY, FOREIGN KEY)
- feature_name -> artist_features.feature_name (PRIMARY KEY)

### artwork_embeddings
- artwork_id -> artworks.id (FOREIGN KEY)
- id -> artwork_embeddings.id (PRIMARY KEY)

### artwork_embeddings_gemini  
- artwork_id -> artworks.id (FOREIGN KEY)
- id -> artwork_embeddings_gemini.id (PRIMARY KEY)

### artwork_favorites
- user_id -> users.id (PRIMARY KEY, FOREIGN KEY)
- artwork_id -> artworks.id (PRIMARY KEY, FOREIGN KEY)

### artworks
- artist_id -> profiles.id (FOREIGN KEY)
- id -> artworks.id (PRIMARY KEY)

### chat_history
- artwork_id -> artworks.id (FOREIGN KEY)
- id -> chat_history.id (PRIMARY KEY)
- user_id -> users.id (FOREIGN KEY)

### collection_items
- transaction_id -> transactions.id (FOREIGN KEY, UNIQUE)
- collection_id -> collections.id (PRIMARY KEY, FOREIGN KEY, UNIQUE)
- artwork_id -> artworks.id (PRIMARY KEY, FOREIGN KEY, UNIQUE)

### collection_views
- viewer_id -> users.id (FOREIGN KEY)
- id -> collection_views.id (PRIMARY KEY)
- collection_id -> collections.id (FOREIGN KEY)

### collections
- patron_id -> profiles.id (FOREIGN KEY, UNIQUE with name)
- user_id -> users.id (FOREIGN KEY)
- ghost_profile_id -> ghost_profiles.id (FOREIGN KEY)
- id -> collections.id (PRIMARY KEY)
- name -> collections.name (UNIQUE with patron_id)

### feature_usage
- user_id -> profiles.id (FOREIGN KEY, UNIQUE with feature_name)
- id -> feature_usage.id (PRIMARY KEY)
- feature_name -> feature_usage.feature_name (UNIQUE with user_id)

### featured_artist
- artist_id -> profiles.id (FOREIGN KEY)
- created_by -> profiles.id (FOREIGN KEY)
- id -> featured_artist.id (PRIMARY KEY)

### follows
- following_id -> users.id (PRIMARY KEY, FOREIGN KEY)
- follower_id -> users.id (PRIMARY KEY, FOREIGN KEY)

### gallery_visits
- scanned_by -> profiles.id (FOREIGN KEY)
- id -> gallery_visits.id (PRIMARY KEY)
- user_id -> profiles.id (FOREIGN KEY)

### ghost_profiles
- email -> ghost_profiles.email (UNIQUE)
- claimed_profile_id -> profiles.id (FOREIGN KEY)
- id -> ghost_profiles.id (PRIMARY KEY)

### notification_settings
- id -> notification_settings.id (PRIMARY KEY)
- user_id -> users.id (FOREIGN KEY, UNIQUE with notification_type)
- notification_type -> notification_settings.notification_type (UNIQUE with user_id)

### partial_registrations
- id -> partial_registrations.id (PRIMARY KEY)

### profiles
- id -> users.id (PRIMARY KEY, FOREIGN KEY)
- artist_approved_by -> users.id (FOREIGN KEY)
- email -> profiles.email (UNIQUE)

### role_conversions
- id -> role_conversions.id (PRIMARY KEY)
- user_id -> profiles.id (FOREIGN KEY)

### text_embeddings
- id -> text_embeddings.id (PRIMARY KEY)

### transactions
- ghost_profile_id -> ghost_profiles.id (FOREIGN KEY)
- id -> transactions.id (PRIMARY KEY)
- stripe_payment_intent_id -> transactions.stripe_payment_intent_id (UNIQUE)
- artwork_id -> artworks.id (FOREIGN KEY)
- buyer_id -> users.id (FOREIGN KEY)
- artist_id -> users.id (FOREIGN KEY)

### user_events
- session_id -> user_sessions.session_id (FOREIGN KEY)
- id -> user_events.id (PRIMARY KEY)
- user_id -> profiles.id (FOREIGN KEY)

### user_preferences
- user_id -> users.id (FOREIGN KEY, UNIQUE)
- id -> user_preferences.id (PRIMARY KEY)

### user_sessions
- user_id -> profiles.id (FOREIGN KEY)
- session_id -> user_sessions.session_id (UNIQUE)
- id -> user_sessions.id (PRIMARY KEY)

### verification_progress
- user_id -> profiles.id (FOREIGN KEY, UNIQUE)
- id -> verification_progress.id (PRIMARY KEY)
- reviewer_id -> profiles.id (FOREIGN KEY)


## RLS Policies

## RLS Policies by Table

### ai_settings
- **Allow admin users to update settings**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `((auth.jwt() ->> 'role'::text) = 'admin'::text)`

- **Allow read access to all authenticated users**
  - Command: SELECT 
  - Is Permissive: Yes
  - Qualification: `TRUE`

### artist_features
- **Admins can modify features**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `(EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role))))`

- **Users can view their own features**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(auth.uid() = user_id)`

### artwork_embeddings
- **Anyone can view artwork embeddings for published artworks**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(artwork_id IN ( SELECT artworks.id FROM artworks WHERE (artworks.status = 'published'::artwork_status)))`

- **Artists can view own artwork embeddings**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(artwork_id IN ( SELECT artworks.id FROM artworks WHERE (artworks.artist_id = auth.uid())))`

- **System can manage artwork embeddings**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `(auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.role = 'admin'::user_role)))`

### artwork_embeddings_gemini
- **Enable insert for authenticated users only**
  - Command: INSERT
  - Is Permissive: Yes
  - Qualification: None

- **Enable read access for all users**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `TRUE`

- **Enable update for authenticated users only**
  - Command: UPDATE
  - Is Permissive: Yes
  - Qualification: `TRUE`

### artwork_favorites
- **Users can manage their favorites**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `(auth.uid() = user_id)`

- **Users can see artwork favorites**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `((auth.uid() = user_id) OR (EXISTS ( SELECT 1 FROM artworks WHERE ((artworks.id = artwork_favorites.artwork_id) AND (artworks.status = 'published'::artwork_status)))))`

### artworks
- **Anyone can view published artworks**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(status = 'published'::artwork_status)`

- **Artists can create artworks**
  - Command: INSERT
  - Is Permissive: Yes
  - Qualification: None

- **Artists can delete own artworks**
  - Command: DELETE
  - Is Permissive: Yes
  - Qualification: `(auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.id = artworks.artist_id)))`

- **Artists can update own artworks**
  - Command: UPDATE
  - Is Permissive: Yes
  - Qualification: `(auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.id = artworks.artist_id)))`

- **Artists can update their own artworks**
  - Command: UPDATE
  - Is Permissive: Yes
  - Qualification: `((auth.uid() = artist_id) AND (EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND is_artist(profiles.role)))))`

- **Artists can view own artworks**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.id = artworks.artist_id)))`

### collection_items
- **collection_items_access**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `((collection_id IN ( SELECT collections.id FROM collections WHERE ((collections.patron_id = auth.uid()) OR (collections.ghost_profile_id IN ( SELECT ghost_profiles.id FROM ghost_profiles WHERE (ghost_profiles.claimed_profile_id = auth.uid())))))) OR (collection_id IN ( SELECT collections.id FROM collections WHERE ((NOT collections.is_private) AND (collections.patron_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.role = 'patron'::user_role)))))))`

- **collection_items_modify**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `(collection_id IN ( SELECT collections.id FROM collections WHERE (collections.patron_id = auth.uid())))`

### collection_views
- **Anyone can insert collection views**
  - Command: INSERT
  - Is Permissive: Yes
  - Qualification: None

- **Collection owners can view analytics**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(EXISTS ( SELECT 1 FROM collections c WHERE ((c.id = collection_views.collection_id) AND (c.user_id = auth.uid()))))`

### collections
- **Users can delete their own collections**
  - Command: DELETE
  - Is Permissive: Yes
  - Qualification: `(patron_id = auth.uid())`

- **Users can insert their own collections**
  - Command: INSERT
  - Is Permissive: Yes
  - Qualification: None

- **Users can update their own collections**
  - Command: UPDATE
  - Is Permissive: Yes
  - Qualification: `(patron_id = auth.uid())`

- **patron_collection_access**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `((patron_id = auth.uid()) OR ((NOT is_private) AND (patron_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.role = 'patron'::user_role)))) OR (ghost_profile_id IN ( SELECT ghost_profiles.id FROM ghost_profiles WHERE (ghost_profiles.claimed_profile_id = auth.uid()))) OR (id IN ( SELECT DISTINCT c.id FROM ((collections c JOIN collection_items ci ON ((c.id = ci.collection_id))) JOIN transactions t ON ((ci.transaction_id = t.id))) WHERE ((t.buyer_id = auth.uid()) OR (t.ghost_profile_id IN ( SELECT ghost_profiles.id FROM ghost_profiles WHERE (ghost_profiles.claimed_profile_id = auth.uid())))))))`

- **patron_collection_delete**
  - Command: DELETE
  - Is Permissive: Yes
  - Qualification: `(patron_id = auth.uid())`

- **patron_collection_insert**
  - Command: INSERT
  - Is Permissive: Yes
  - Qualification: None

- **patron_collection_update**
  - Command: UPDATE
  - Is Permissive: Yes
  - Qualification: `(patron_id = auth.uid())`

### feature_usage
- **Admins can view all feature usage**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.role = 'admin'::user_role)))`

- **Users can create and update their own feature usage**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `(auth.uid() = user_id)`

- **Users can view their own feature usage**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(auth.uid() = user_id)`

### featured_artist
- **Allow admins to manage featured artists**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `(EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role))))`

- **Allow public to view featured artists**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `TRUE`

### follows
- **Users can follow artists**
  - Command: INSERT
  - Is Permissive: Yes
  - Qualification: None

- **Users can manage their follows**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `(auth.uid() = follower_id)`

- **Users can see their follow relationships**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `((auth.uid() = follower_id) OR (auth.uid() = following_id) OR (EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = follows.following_id) AND is_artist(profiles.role)))))`

- **Users can unfollow artists**
  - Command: DELETE
  - Is Permissive: Yes
  - Qualification: `((auth.uid() = follower_id) AND (EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = follows.following_id) AND is_artist(profiles.role)))))`

### gallery_visits
- **Authenticated users can create visits**
  - Command: INSERT
  - Is Permissive: Yes
  - Qualification: None

- **Users can view their own visits and visits they've scanned**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `((auth.uid() = user_id) OR (auth.uid() = scanned_by))`

### ghost_profiles
- **Admin service role has full access**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `(current_setting('role'::text) = 'service_role'::text)`

- **Admins have full access to ghost profiles**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `(EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role))))`

- **Artists can view purchaser profiles**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(EXISTS ( SELECT 1 FROM (transactions t JOIN artworks a ON ((t.artwork_id = a.id))) WHERE ((t.ghost_profile_id = ghost_profiles.id) AND (a.artist_id = auth.uid()))))`

- **Public can view visible profiles**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(is_visible = true)`

- **Service role has full access**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `(current_setting('role'::text) = 'service_role'::text)`

- **ghost_profile_access**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `((claimed_profile_id = auth.uid()) OR ((auth.jwt() IS NOT NULL) AND (email = (( SELECT users.email FROM auth.users WHERE (users.id = auth.uid()) LIMIT 1))::text)) OR (id IN ( SELECT transactions.ghost_profile_id FROM transactions WHERE (transactions.buyer_id = auth.uid()))) OR ((is_visible = true) AND (EXISTS ( SELECT 1 FROM transactions t WHERE (t.ghost_profile_id = ghost_profiles.id)))))`

- **service_role_full_access**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `(current_setting('role'::text) = 'service_role'::text)`

- **user_view_claimed**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `((auth.jwt() IS NOT NULL) AND (is_claimed = true) AND (claimed_profile_id = auth.uid()))`

- **user_view_own_unclaimed**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `((auth.jwt() IS NOT NULL) AND (is_claimed = false) AND (email = (auth.jwt() ->> 'email'::text)))`

### notification_settings
- **Users can insert own notification settings**
  - Command: INSERT
  - Is Permissive: Yes
  - Qualification: None

- **Users can update own notification settings**
  - Command: UPDATE
  - Is Permissive: Yes
  - Qualification: `(auth.uid() = user_id)`

- **Users can view own notification settings**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(auth.uid() = user_id)`

### partial_registrations
- **Anyone can create partial registrations**
  - Command: INSERT
  - Is Permissive: Yes
  - Qualification: None

- **Users can delete their own partial registrations**
  - Command: DELETE
  - Is Permissive: Yes
  - Qualification: `(email = CURRENT_USER)`

- **Users can update their own partial registrations**
  - Command: UPDATE
  - Is Permissive: Yes
  - Qualification: `(email = CURRENT_USER)`

- **Users can view their own partial registrations**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(email = CURRENT_USER)`

### profiles
- **Only admins can update roles**
  - Command: UPDATE
  - Is Permissive: Yes
  - Qualification: `(auth.uid() IN ( SELECT profiles_1.id FROM profiles profiles_1 WHERE (profiles_1.role = 'admin'::user_role)))`

- **Patrons can update their own profiles**
  - Command: UPDATE
  - Is Permissive: Yes
  - Qualification: `((auth.uid() = id) AND (is_patron((auth.role())::user_role) OR is_artist((auth.role())::user_role)))`

- **Profiles are viewable by everyone**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `TRUE`

- **Public profiles are viewable by everyone**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `TRUE`

- **Users can update own profile**
  - Command: UPDATE
  - Is Permissive: Yes
  - Qualification: `(auth.uid() = id)`

### role_conversions
- **Admins can view all role conversions**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.role = 'admin'::user_role)))`

- **System can manage role conversions**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `(auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.role = 'admin'::user_role)))`

- **Users can view their own role conversions**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(auth.uid() = user_id)`

### text_embeddings
- **Anyone can view public text embeddings**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(content_type = ANY (ARRAY['public_content'::text, 'artwork_description'::text]))`

- **System can manage text embeddings**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `(auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.role = 'admin'::user_role)))`

- **Users can view own text embeddings**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(((content_id)::text = (auth.uid())::text) OR (content_id IN ( SELECT artworks.id FROM artworks WHERE (artworks.artist_id = auth.uid()))))`

### transactions
- **Admins can view all transactions**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.role = 'admin'::user_role)))`

- **Ghost profiles can view their transactions**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(ghost_profile_id IN ( SELECT ghost_profiles.id FROM ghost_profiles WHERE (ghost_profiles.stripe_customer_id = current_setting('stripe.customer_id'::text, true))))`

- **System can insert transactions**
  - Command: INSERT
  - Is Permissive: Yes
  - Qualification: None

- **transaction_access**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `((buyer_id = auth.uid()) OR (artist_id = auth.uid()) OR (ghost_profile_id IN ( SELECT ghost_profiles.id FROM ghost_profiles WHERE (ghost_profiles.claimed_profile_id = auth.uid()))))`

### user_events
- **Admins can view all events**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.role = 'admin'::user_role)))`

- **Users can create their own events**
  - Command: INSERT
  - Is Permissive: Yes
  - Qualification: None

- **Users can view their own events**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(auth.uid() = user_id)`

### user_preferences
- **Users can insert own preferences**
  - Command: INSERT
  - Is Permissive: Yes
  - Qualification: None

- **Users can update own preferences**
  - Command: UPDATE
  - Is Permissive: Yes
  - Qualification: `(auth.uid() = user_id)`

- **Users can view own preferences**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(auth.uid() = user_id)`

### user_sessions
- **Admins can view all sessions**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.role = 'admin'::user_role)))`

- **Users can create their own sessions**
  - Command: INSERT
  - Is Permissive: Yes
  - Qualification: None

- **Users can update their own sessions**
  - Command: UPDATE
  - Is Permissive: Yes
  - Qualification: `(auth.uid() = user_id)`

- **Users can view their own sessions**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `(auth.uid() = user_id)`

### verification_progress
- **Admins and profile owner can view verification progress**
  - Command: SELECT
  - Is Permissive: Yes
  - Qualification: `((auth.uid() = user_id) OR (EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))))`

- **Admins can modify verification progress**
  - Command: ALL
  - Is Permissive: Yes
  - Qualification: `(EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role))))`