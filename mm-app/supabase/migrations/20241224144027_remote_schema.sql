drop policy "Artists can create artworks" on "public"."artworks";

drop policy "Artists can delete own artworks" on "public"."artworks";

drop policy "Artists can update own artworks" on "public"."artworks";

drop policy "Artists can view own artworks" on "public"."artworks";

alter table "public"."artworks" drop constraint "artworks_artist_id_fkey";

alter table "public"."artworks" alter column "created_at" set default now();

alter table "public"."artworks" alter column "created_at" set not null;

alter table "public"."artworks" alter column "price" set not null;

alter table "public"."artworks" alter column "price" set data type integer using "price"::integer;

alter table "public"."artworks" alter column "updated_at" set default now();

alter table "public"."artworks" alter column "updated_at" set not null;

alter table "public"."artworks" add constraint "artworks_price_check" CHECK ((price >= 0)) not valid;

alter table "public"."artworks" validate constraint "artworks_price_check";

alter table "public"."artworks" add constraint "artworks_artist_id_fkey" FOREIGN KEY (artist_id) REFERENCES auth.users(id) not valid;

alter table "public"."artworks" validate constraint "artworks_artist_id_fkey";

create policy "Artists can create artworks"
on "public"."artworks"
as permissive
for insert
to public
with check (((artist_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'artist'::user_role))))));


create policy "Artists can delete own artworks"
on "public"."artworks"
as permissive
for delete
to public
using ((artist_id = auth.uid()));


create policy "Artists can update own artworks"
on "public"."artworks"
as permissive
for update
to public
using ((artist_id = auth.uid()))
with check ((artist_id = auth.uid()));


create policy "Artists can view own artworks"
on "public"."artworks"
as permissive
for select
to public
using ((artist_id = auth.uid()));



