drop policy "Artists can delete own artwork images" on "storage"."objects";

drop policy "Artists can update own artwork images" on "storage"."objects";

drop policy "Artists can upload artwork images" on "storage"."objects";

create policy "Allow public read access"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'artwork-images'::text));



