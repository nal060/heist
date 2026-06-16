-- Drop plain indexes made redundant by a UNIQUE constraint on the same column(s).
-- A UNIQUE constraint is backed by its own btree index, so a separate plain index on
-- the identical column adds nothing but write overhead and storage. FK lookups on the
-- column continue to use the unique index.
--
-- tilopay_business_accounts.business_id: the plain *_business_id_idx duplicates the
-- UNIQUE *_business_id_key. This is the only such duplicate in the public schema,
-- verified by scanning pg_index for non-unique indexes whose column set matches a
-- unique index on the same table.

DROP INDEX IF EXISTS public.tilopay_business_accounts_business_id_idx;
