-- Photo and document buckets. Paths start with the uploader's user id: <uid>/<file>.
-- coach-photos and court-photos are public (pages and OG images link to them); credentials are private scans.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('coach-photos', 'coach-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('court-photos', 'court-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('credentials', 'credentials', false, 10485760, array['image/jpeg', 'image/png', 'application/pdf']);

create policy "coach photos: upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'coach-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "coach photos: change own" on storage.objects for update to authenticated
  using (bucket_id = 'coach-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "coach photos: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'coach-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "court photos: admin" on storage.objects for all to authenticated
  using (bucket_id = 'court-photos' and public.is_admin()) with check (bucket_id = 'court-photos' and public.is_admin());

create policy "credentials: upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'credentials' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "credentials: read own" on storage.objects for select to authenticated
  using (bucket_id = 'credentials' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin()));
