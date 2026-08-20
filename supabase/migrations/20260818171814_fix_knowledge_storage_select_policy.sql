-- Allow an authenticated Anvera user to read and remove
-- only knowledge documents stored under:
--
--   user_id/assistant_id/source_id/file
--
-- SELECT mirrors INSERT so Supabase Storage can return
-- metadata for a newly uploaded object after INSERT.

drop policy if exists
  "knowledge_documents_select"
on storage.objects;

drop policy if exists
  "knowledge_documents_delete"
on storage.objects;


create policy "knowledge_documents_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'knowledge-documents'

  and
  (storage.foldername(name))[1]
    = (select auth.uid()::text)

  and exists (
    select 1
    from public.assistants
    where assistants.owner_id =
      (select auth.uid())

      and assistants.id::text =
        (storage.foldername(name))[2]
  )
);


create policy "knowledge_documents_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'knowledge-documents'

  and
  (storage.foldername(name))[1]
    = (select auth.uid()::text)

  and exists (
    select 1
    from public.assistants
    where assistants.owner_id =
      (select auth.uid())

      and assistants.id::text =
        (storage.foldername(name))[2]
  )
);
