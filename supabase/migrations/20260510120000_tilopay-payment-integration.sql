-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 004: Tilopay Payment Integration
-- ═══════════════════════════════════════════════════════════════════════════
--
-- New tables:
--   payment_methods              — user saved card tokens
--   tilopay_business_accounts    — business sub-merchant registry
--   tilopay_payment_events       — immutable audit log (append-only)
--   refund_requests              — manual refund lifecycle tracking
--   payment_idempotency_keys     — double-charge prevention
--
-- Modified tables:
--   payments    — 8 new Tilopay columns + business owner RLS policy
--   orders      — denormalized payment_status column
--   businesses  — tilopay_onboarded flag
--
-- Sync triggers:
--   payments.payment_status  → orders.payment_status
--   tilopay_business_accounts.account_status → businesses.tilopay_onboarded
--
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. payment_methods ─────────────────────────────────────────────────────
-- Stores Tilopay card tokens so returning consumers can pay in one tap.
-- The actual card number never touches Heist servers — only the opaque token
-- Tilopay returns from their hosted tokenization form.

CREATE TABLE public.payment_methods (
  id                   uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tilopay's opaque card token — used with the process_cof endpoint
  -- Written server-side only via Edge Function; client never constructs this row directly
  card_token           text        NOT NULL,

  -- Display-only metadata (returned by Tilopay alongside token)
  card_last_four       char(4)     NOT NULL,
  card_brand           text        NOT NULL,  -- 'visa' | 'mastercard' | 'amex' | etc.
  card_holder_name     text,
  card_expiry_month    smallint    NOT NULL,  -- 1–12
  card_expiry_year     smallint    NOT NULL,  -- full year e.g. 2028

  -- Soft management
  is_default           boolean     NOT NULL DEFAULT false,
  is_active            boolean     NOT NULL DEFAULT true,
  nickname             text,                  -- optional user-set label e.g. "Work card"

  -- Audit
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT payment_methods_card_expiry_month_check
    CHECK (card_expiry_month BETWEEN 1 AND 12),
  CONSTRAINT payment_methods_card_brand_check
    CHECK (card_brand IN ('visa', 'mastercard', 'amex', 'discover', 'diners', 'other'))
);

CREATE INDEX payment_methods_user_id_idx
  ON public.payment_methods (user_id);
CREATE INDEX payment_methods_user_active_idx
  ON public.payment_methods (user_id, is_active)
  WHERE is_active = true;
-- Enforce exactly one default card per user at DB level
CREATE UNIQUE INDEX payment_methods_one_default_per_user
  ON public.payment_methods (user_id)
  WHERE is_default = true AND is_active = true;

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_payment_methods"
  ON public.payment_methods FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_payment_methods"
  ON public.payment_methods FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_payment_methods"
  ON public.payment_methods FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- No DELETE policy — soft delete only via UPDATE is_active = false
-- Hard deletes are admin-only via service role


-- ─── 2. tilopay_business_accounts ───────────────────────────────────────────
-- Tracks which businesses have been onboarded as Tilopay affiliates/sub-merchants.
-- Stores the affiliate_id needed to route split payouts to each business.
-- platform_fee_bps stored here (not hardcoded) to allow per-business fee negotiation.

CREATE TABLE public.tilopay_business_accounts (
  id                      uuid        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- One Tilopay account per business, preserved even if business is deleted
  business_id             uuid        NOT NULL UNIQUE
                            REFERENCES public.businesses(id) ON DELETE RESTRICT,

  -- Tilopay's identifier for this sub-merchant
  -- Returned by POST /api/v1/collect/affiliates — stored as text to handle any format
  tilopay_affiliate_id    text        NOT NULL UNIQUE,

  -- Onboarding lifecycle
  -- pending    → application submitted, waiting Tilopay approval
  -- active     → approved, can receive split payouts at checkout
  -- suspended  → Tilopay suspended payout (compliance/KYC issue)
  -- offboarded → business left platform
  account_status          text        NOT NULL DEFAULT 'pending',

  -- Banking details (display only — actual bank data is in Tilopay's system)
  bank_account_last_four  char(4),
  bank_name               text,

  -- Heist's cut of each transaction in basis points (500 = 5%)
  -- Stored per-account so fee changes don't retroactively affect existing records
  platform_fee_bps        smallint    NOT NULL DEFAULT 500,

  -- Registration details submitted to Tilopay
  legal_name              text        NOT NULL,
  tax_id                  text        NOT NULL,  -- RUC (Panama) or cédula jurídica (CR)
  registered_email        text        NOT NULL,

  -- Timestamps
  submitted_at            timestamptz NOT NULL DEFAULT now(),
  approved_at             timestamptz,
  suspended_at            timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT tilopay_business_accounts_status_check
    CHECK (account_status IN ('pending', 'active', 'suspended', 'offboarded')),
  CONSTRAINT tilopay_business_accounts_fee_bps_check
    CHECK (platform_fee_bps BETWEEN 0 AND 10000)
);

CREATE INDEX tilopay_business_accounts_business_id_idx
  ON public.tilopay_business_accounts (business_id);
-- Partial index: checkout only queries active accounts
CREATE INDEX tilopay_business_accounts_status_active_idx
  ON public.tilopay_business_accounts (account_status)
  WHERE account_status = 'active';

ALTER TABLE public.tilopay_business_accounts ENABLE ROW LEVEL SECURITY;

-- Business owners can read their own account status
CREATE POLICY "business_owners_read_own_tilopay_account"
  ON public.tilopay_business_accounts FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = tilopay_business_accounts.business_id
        AND b.user_id = auth.uid()
    )
  );

-- No INSERT/UPDATE from client — Edge Functions manage this via service role
-- This prevents a business owner from forging their own affiliate_id


-- ─── 3. tilopay_payment_events ──────────────────────────────────────────────
-- Immutable append-only audit log of every Tilopay interaction.
-- Every API call result is written here verbatim before any processing logic runs.
-- This is the forensic record for payment disputes — rows are never modified.

CREATE TABLE public.tilopay_payment_events (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Links to our payment record (nullable — some events arrive before payment row exists)
  payment_id          uuid        REFERENCES public.payments(id) ON DELETE SET NULL,

  -- Tilopay's own order identifier
  tilopay_order_id    text,

  -- Event classification
  -- 'order_created'     → initial POST /api/v1/processPayment response
  -- 'process_cof'       → response from /api/v1/process_cof (saved card charge)
  -- 'callback_received' → redirect/deep link callback from Tilopay after payment
  -- 'status_poll'       → result of POST /api/v1/consult verification call
  -- 'split_liquidation' → response from /api/v1/orders/liquidation/split
  -- 'token_obtained'    → SDK token obtained via /api/v1/loginSdk
  -- 'refund_initiated'  → manual refund action recorded by admin
  event_type          text        NOT NULL,

  -- HTTP metadata for debugging
  http_method         text,        -- 'POST', 'GET'
  http_endpoint       text,        -- '/api/v1/process_cof'
  http_status_code    smallint,

  -- Raw payload exactly as received from Tilopay — written before any parsing
  raw_payload         jsonb       NOT NULL,

  -- Our interpretation after parsing
  parsed_status       text,        -- 'approved' | 'declined' | 'pending' | 'error'
  parsed_amount       numeric(10,2),
  error_code          text,
  error_message       text,

  -- Source of this event
  -- 'callback_url'  → came via deep link redirect from Tilopay hosted form
  -- 'edge_function' → came from our Edge Function calling Tilopay
  -- 'manual_admin'  → recorded by admin action in Supabase dashboard
  source              text        NOT NULL DEFAULT 'edge_function',

  received_at         timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT tilopay_payment_events_event_type_check
    CHECK (event_type IN (
      'order_created', 'process_cof', 'callback_received',
      'status_poll', 'split_liquidation', 'token_obtained', 'refund_initiated'
    )),
  CONSTRAINT tilopay_payment_events_source_check
    CHECK (source IN ('callback_url', 'edge_function', 'manual_admin'))
);

CREATE INDEX tilopay_payment_events_payment_id_idx
  ON public.tilopay_payment_events (payment_id);
CREATE INDEX tilopay_payment_events_tilopay_order_id_idx
  ON public.tilopay_payment_events (tilopay_order_id)
  WHERE tilopay_order_id IS NOT NULL;
CREATE INDEX tilopay_payment_events_received_at_idx
  ON public.tilopay_payment_events (received_at DESC);
CREATE INDEX tilopay_payment_events_event_type_idx
  ON public.tilopay_payment_events (event_type, received_at DESC);

ALTER TABLE public.tilopay_payment_events ENABLE ROW LEVEL SECURITY;
-- No policies: service role only. Consumers and businesses must never read raw processor payloads.

-- Enforce append-only — no row may ever be updated
CREATE OR REPLACE FUNCTION prevent_tilopay_event_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'tilopay_payment_events is append-only — updates are not permitted';
END;
$$;

CREATE TRIGGER tilopay_payment_events_no_update
  BEFORE UPDATE ON public.tilopay_payment_events
  FOR EACH ROW EXECUTE FUNCTION prevent_tilopay_event_update();


-- ─── 4. refund_requests ─────────────────────────────────────────────────────
-- Tilopay has no refund API — refunds are processed manually via their admin dashboard.
-- This table tracks the full lifecycle: consumer requests → admin reviews → admin processes
-- in Tilopay → admin records result here.

CREATE TABLE public.refund_requests (
  id                        uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id                uuid          NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
  order_id                  uuid          NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  requested_by              uuid          NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  -- Financial
  requested_amount          numeric(10,2) NOT NULL,  -- what consumer is asking for
  approved_amount           numeric(10,2),            -- what admin approved (may differ)
  refunded_amount           numeric(10,2),            -- what was actually processed in Tilopay

  -- Reason
  -- 'order_cancelled'        → order cancelled before pickup
  -- 'item_not_as_described'  → bag contents were wrong
  -- 'business_no_show'       → business didn't have the bag ready
  -- 'duplicate_charge'       → charged twice (idempotency failure)
  -- 'technical_error'        → payment processor error
  -- 'other'                  → manual reason in consumer_notes
  refund_reason             text          NOT NULL,
  consumer_notes            text,

  -- Workflow status
  -- requested    → consumer submitted, pending admin review
  -- under_review → admin is investigating
  -- approved     → admin approved, pending Tilopay dashboard action
  -- processing   → admin has initiated refund in Tilopay
  -- completed    → refund confirmed in Tilopay, consumer notified
  -- rejected     → not eligible for refund
  status                    text          NOT NULL DEFAULT 'requested',

  -- Admin fields
  reviewed_by               uuid          REFERENCES auth.users(id),
  reviewed_at               timestamptz,
  admin_notes               text,

  -- Tilopay reference — admin pastes this from Tilopay dashboard after processing
  tilopay_refund_reference  text,
  tilopay_refunded_at       timestamptz,

  created_at                timestamptz   NOT NULL DEFAULT now(),
  updated_at                timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT refund_requests_reason_check
    CHECK (refund_reason IN (
      'order_cancelled', 'item_not_as_described', 'business_no_show',
      'duplicate_charge', 'technical_error', 'other'
    )),
  CONSTRAINT refund_requests_status_check
    CHECK (status IN (
      'requested', 'under_review', 'approved', 'processing', 'completed', 'rejected'
    )),
  CONSTRAINT refund_requests_amount_positive
    CHECK (requested_amount > 0),
  CONSTRAINT refund_requests_approved_lte_requested
    CHECK (approved_amount IS NULL OR approved_amount <= requested_amount)
);

CREATE INDEX refund_requests_payment_id_idx ON public.refund_requests (payment_id);
CREATE INDEX refund_requests_order_id_idx   ON public.refund_requests (order_id);
CREATE INDEX refund_requests_user_id_idx    ON public.refund_requests (requested_by);
-- Partial index on open requests only — completed/rejected are rarely queried
CREATE INDEX refund_requests_open_status_idx
  ON public.refund_requests (status)
  WHERE status NOT IN ('completed', 'rejected');
-- Prevent duplicate open refund requests on the same payment
CREATE UNIQUE INDEX refund_requests_one_active_per_payment
  ON public.refund_requests (payment_id)
  WHERE status NOT IN ('completed', 'rejected');

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

-- Consumers can view their own refund requests
CREATE POLICY "users_read_own_refund_requests"
  ON public.refund_requests FOR SELECT TO authenticated
  USING (requested_by = auth.uid());

-- Consumers can create a refund request only for their own completed payments
CREATE POLICY "users_create_refund_requests"
  ON public.refund_requests FOR INSERT TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.payments p
      JOIN public.orders o ON o.id = p.order_id
      WHERE p.id = refund_requests.payment_id
        AND o.user_id = auth.uid()
        AND p.payment_status = 'completed'
    )
  );

-- No UPDATE policy for authenticated role — status changes are admin-only via service role


-- ─── 5. payment_idempotency_keys ────────────────────────────────────────────
-- Prevents double charges when a consumer retries a failed/timed-out payment.
-- The PostgreSQL UNIQUE constraint on idempotency_key makes the check atomic —
-- two concurrent Edge Function calls cannot both proceed to charge Tilopay.
--
-- Usage:
--   1. Client generates a UUID before calling the Edge Function
--   2. Edge Function: INSERT INTO payment_idempotency_keys (ON CONFLICT → return existing)
--   3. If existing row: status='succeeded' → return cached payment_id (no duplicate charge)
--                       status='in_flight' AND locked_until > now() → 409 "in progress"
--                       status='in_flight' AND locked_until < now() → timed out, safe to retry
--                       status='failed' → 409 "generate a new key and retry"
--   4. If new row: proceed with Tilopay API call
--   5. On success: update attempt_status='succeeded', set payment_id + tilopay_order_id
--   6. On failure: update attempt_status='failed'

CREATE TABLE public.payment_idempotency_keys (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- UUID generated by client before initiating payment
  idempotency_key     text        NOT NULL UNIQUE,

  order_id            uuid        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- The payment created for this attempt (null until Tilopay responds)
  payment_id          uuid        REFERENCES public.payments(id) ON DELETE SET NULL,

  -- Tilopay's order identifier (null until Tilopay responds)
  tilopay_order_id    text,

  -- in_flight  → Edge Function called, waiting for Tilopay response
  -- succeeded  → payment confirmed
  -- failed     → Tilopay returned an error (safe to retry with a NEW key)
  -- timed_out  → Edge Function exceeded locked_until; Tilopay state unknown
  attempt_status      text        NOT NULL DEFAULT 'in_flight',

  -- If still in_flight after this timestamp, treat as timed_out
  locked_until        timestamptz NOT NULL DEFAULT (now() + interval '5 minutes'),

  created_at          timestamptz NOT NULL DEFAULT now(),
  resolved_at         timestamptz,

  CONSTRAINT idempotency_keys_status_check
    CHECK (attempt_status IN ('in_flight', 'succeeded', 'failed', 'timed_out'))
);

CREATE INDEX payment_idempotency_keys_order_id_idx
  ON public.payment_idempotency_keys (order_id);
CREATE INDEX payment_idempotency_keys_user_id_idx
  ON public.payment_idempotency_keys (user_id);
-- Partial index for in-flight lock lookups
CREATE INDEX payment_idempotency_keys_in_flight_idx
  ON public.payment_idempotency_keys (order_id, locked_until)
  WHERE attempt_status = 'in_flight';

ALTER TABLE public.payment_idempotency_keys ENABLE ROW LEVEL SECURITY;
-- No policies: Edge Functions access via service role only


-- ─── 6. Alter existing: payments ────────────────────────────────────────────

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS tilopay_order_id              text UNIQUE,
  ADD COLUMN IF NOT EXISTS payment_method_id             uuid
    REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS platform_fee_amount           numeric(10,2),
  ADD COLUMN IF NOT EXISTS business_net_amount           numeric(10,2),
  ADD COLUMN IF NOT EXISTS tax_amount                    numeric(10,2),
  ADD COLUMN IF NOT EXISTS tilopay_business_account_id   uuid
    REFERENCES public.tilopay_business_accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS idempotency_key               text,
  ADD COLUMN IF NOT EXISTS tilopay_split_response        jsonb;

-- Indexes on new columns
CREATE INDEX IF NOT EXISTS payments_order_id_idx
  ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS payments_tilopay_order_id_idx
  ON public.payments (tilopay_order_id)
  WHERE tilopay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS payments_payment_method_id_idx
  ON public.payments (payment_method_id)
  WHERE payment_method_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS payments_status_idx
  ON public.payments (payment_status);
CREATE INDEX IF NOT EXISTS payments_created_at_idx
  ON public.payments (created_at DESC);

-- Constrain payment_status to valid values
-- Note: existing mocked 'completed' rows are compatible
ALTER TABLE public.payments
  ADD CONSTRAINT payments_status_check
    CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded'));

-- Business owners can see payment totals for orders on their bags (for accounting)
-- They see amount/status but the card_token never appears here
CREATE POLICY "business_owners_read_order_payments"
  ON public.payments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.surplus_bags sb ON sb.id = o.surplus_bag_id
      JOIN public.businesses b    ON b.id  = sb.business_id
      WHERE o.id = payments.order_id
        AND b.user_id = auth.uid()
    )
  );


-- ─── 7. Alter existing: orders ───────────────────────────────────────────────
-- Denormalize payment_status onto orders so the business dashboard can show
-- payment state without joining to the payments table on every query.
-- Kept in sync via trigger below.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_check
    CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded'));

-- Partial index: non-completed statuses are the interesting ones to monitor
CREATE INDEX IF NOT EXISTS orders_payment_status_idx
  ON public.orders (payment_status)
  WHERE payment_status != 'completed';


-- ─── 8. Alter existing: businesses ───────────────────────────────────────────
-- Quick boolean for checkout: "is this business ready to accept payments?"
-- Avoids a JOIN to tilopay_business_accounts on every checkout screen load.
-- Kept in sync via trigger below.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS tilopay_onboarded boolean NOT NULL DEFAULT false;


-- ─── 9. Sync trigger: payments → orders.payment_status ──────────────────────

CREATE OR REPLACE FUNCTION sync_order_payment_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.orders
  SET payment_status = NEW.payment_status,
      updated_at     = now()
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER payments_sync_order_status
  AFTER INSERT OR UPDATE OF payment_status ON public.payments
  FOR EACH ROW EXECUTE FUNCTION sync_order_payment_status();


-- ─── 10. Sync trigger: tilopay_business_accounts → businesses.tilopay_onboarded

CREATE OR REPLACE FUNCTION sync_business_tilopay_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.businesses
  SET tilopay_onboarded = (NEW.account_status = 'active'),
      updated_at        = now()
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tilopay_account_sync_business
  AFTER INSERT OR UPDATE OF account_status ON public.tilopay_business_accounts
  FOR EACH ROW EXECUTE FUNCTION sync_business_tilopay_status();


COMMIT;
