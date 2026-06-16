-- ─── tilopay_business_accounts: affiliate model → payout-email model ─────────
-- The original table (20260510120000) is already deployed to prod, so this ships
-- as a forward migration instead of an edit to that file.
--
-- Money-routing moves from a Tilopay affiliate_id to a payout email. The KYC /
-- registration / banking columns are dropped — that data lives in Tilopay's system,
-- and onboarding now fills the payout identity manually via service role.
--
-- NOTE: dropping tilopay_affiliate_id discards any existing affiliate ids in prod.
-- That is intended — those values are superseded by tilopay_payout_email.

-- Old affiliate identifier (its UNIQUE constraint drops automatically with the column)
ALTER TABLE public.tilopay_business_accounts
  DROP COLUMN IF EXISTS tilopay_affiliate_id;

-- Display-only banking + registration fields (now owned entirely by Tilopay)
ALTER TABLE public.tilopay_business_accounts
  DROP COLUMN IF EXISTS bank_account_last_four,
  DROP COLUMN IF EXISTS bank_name,
  DROP COLUMN IF EXISTS legal_name,
  DROP COLUMN IF EXISTS tax_id,
  DROP COLUMN IF EXISTS registered_email,
  DROP COLUMN IF EXISTS submitted_at;

-- New payout identity. Both nullable — filled by onboarding via service role after a
-- human verifies the business's Tilopay account. tilopay_user_id (from Tilopay's Users
-- tab) is kept for support reference; tilopay_payout_email is what split payouts route to.
ALTER TABLE public.tilopay_business_accounts
  ADD COLUMN IF NOT EXISTS tilopay_user_id      text,
  ADD COLUMN IF NOT EXISTS tilopay_payout_email text;

-- Enforce 1-1 business↔Tilopay user (matches the original UNIQUE intent on the identifier).
-- Nullable column: Postgres permits multiple NULLs, so 'pending' accounts coexist fine.
ALTER TABLE public.tilopay_business_accounts
  ADD CONSTRAINT tilopay_business_accounts_tilopay_user_id_key UNIQUE (tilopay_user_id);
