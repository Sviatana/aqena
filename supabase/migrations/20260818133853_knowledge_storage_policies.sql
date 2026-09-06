-- AQENA private knowledge-document storage policies.
--
-- Object paths use:
--   user_id/assistant_id/source_id/file.ext
--
-- The bucket itself is created as PRIVATE in the Supabase
-- Storage dashboard. File operations continue to use the
-- Storage API rather than modifying storage.objects rows
-- directly.

drop policy if exists
  "knowledge_documents_insert"
on storage.objects;

drop policy if exists
  "knowledge_documents_select"
on storage.objects;

drop policy if exists
  "knowledge_documents_delete"
on storage.objects;


create policy "knowledge_documents_insert"
on storage.objects
for insert
to authenticated
with check (
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


create policy "knowledge_documents_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'knowledge-documents'

  and owner_id =
    (select auth.uid()::text)

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

  and owner_id =
    (select auth.uid()::text)

  and exists (
    select 1
    from public.assistants
    where assistants.owner_id =
      (select auth.uid())

      and assistants.id::text =
        (storage.foldername(name))[2]
  )
);
