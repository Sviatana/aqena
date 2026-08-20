-- Knowledge files are handled only by trusted Anvera
-- server routes after user, assistant and plan checks.
--
-- The Supabase server secret bypasses Storage RLS.
-- Authenticated browser clients receive no direct
-- INSERT, SELECT or DELETE access to knowledge files.

drop policy if exists
  "knowledge_documents_insert"
on storage.objects;

drop policy if exists
  "knowledge_documents_select"
on storage.objects;

drop policy if exists
  "knowledge_documents_delete"
on storage.objects;
