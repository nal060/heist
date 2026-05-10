import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { TILOPAY_BASE, IS_MOCK, getTilopayToken, generateOrderNumber } from '../_shared/tilopay.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreatePaymentBody {
  order_id: string
  idempotency_key: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const tilopayKey = Deno.env.get('TILOPAY_KEY')!

    // ─── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { order_id, idempotency_key }: CreatePaymentBody = await req.json()

    if (!order_id || !idempotency_key) {
      return new Response(JSON.stringify({ error: 'order_id and idempotency_key are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Idempotency check ─────────────────────────────────────────────────────
    // Attempt an atomic INSERT; ON CONFLICT returns the existing row so we can
    // detect duplicates without a race condition.
    const { data: idempKey, error: idempError } = await supabase
      .from('payment_idempotency_keys')
      .upsert(
        { idempotency_key, order_id, user_id: user.id },
        { onConflict: 'idempotency_key', ignoreDuplicates: false }
      )
      .select('id, attempt_status, payment_id, tilopay_order_id, locked_until')
      .single()

    if (idempError) throw new Error(idempError.message)

    // If this key was already resolved successfully, return the cached result.
    if (idempKey.attempt_status === 'succeeded') {
      return new Response(
        JSON.stringify({ success: true, tilopay_order_id: idempKey.tilopay_order_id, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // A concurrent request is still in-flight; tell the client to back off.
    if (
      idempKey.attempt_status === 'in_flight' &&
      new Date(idempKey.locked_until) > new Date()
    ) {
      return new Response(JSON.stringify({ error: 'Payment already in progress — please wait' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // A previous attempt using this key failed — force the client to generate a fresh key.
    if (idempKey.attempt_status === 'failed') {
      return new Response(JSON.stringify({ error: 'This idempotency key belongs to a failed attempt — generate a new key and retry' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Fetch payment row ─────────────────────────────────────────────────────
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, amount, payment_status, tilopay_business_account_id')
      .eq('order_id', order_id)
      .single()

    if (paymentError || !payment) {
      return new Response(JSON.stringify({ error: 'Payment record not found for this order' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (payment.payment_status === 'completed') {
      return new Response(JSON.stringify({ error: 'This order has already been paid' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Resolve business Tilopay account via order → bag → business chain ─────
    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .select('surplus_bag_id, user_id')
      .eq('id', order_id)
      .single()

    if (orderError || !orderRow) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Ensure the authenticated user owns this order
    if (orderRow.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: bagRow, error: bagError } = await supabase
      .from('surplus_bags')
      .select('business_id')
      .eq('id', orderRow.surplus_bag_id)
      .single()

    if (bagError || !bagRow) {
      return new Response(JSON.stringify({ error: 'Bag not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: tilopayAccount, error: accountError } = await supabase
      .from('tilopay_business_accounts')
      .select('id, tilopay_affiliate_id, platform_fee_bps')
      .eq('business_id', bagRow.business_id)
      .eq('account_status', 'active')
      .single()

    if (accountError || !tilopayAccount) {
      return new Response(JSON.stringify({ error: 'Business Tilopay account not active' }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const total = payment.amount as number
    const orderNumber = generateOrderNumber(order_id)
    const feeBps = tilopayAccount.platform_fee_bps as number
    // platform_fee_bps: 500 = 5%. Tilopay expects a decimal percentage (e.g. 5.00)
    const platformFeePercent = (feeBps / 100).toFixed(2)

    // ─── Mock fast-path ────────────────────────────────────────────────────────
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const mockTilopayOrderId = `MOCK-${crypto.randomUUID().slice(0, 8)}`

      await supabase.from('payments').update({
        payment_status: 'processing',
        tilopay_order_id: mockTilopayOrderId,
        tilopay_business_account_id: tilopayAccount.id,
        idempotency_key,
        updated_at: new Date().toISOString(),
      }).eq('order_id', order_id)

      await supabase.from('tilopay_payment_events').insert({
        payment_id: payment.id,
        tilopay_order_id: mockTilopayOrderId,
        event_type: 'order_created',
        event_status: 'success',
        http_endpoint: '/api/v1/processPayment',
        raw_payload: { mock: true, order_id, tilopay_order_id: mockTilopayOrderId },
        response_body: { mock: true },
        source: 'edge_function',
      })

      await supabase.from('payment_idempotency_keys').update({
        attempt_status: 'succeeded',
        tilopay_order_id: mockTilopayOrderId,
        payment_id: payment.id,
        resolved_at: new Date().toISOString(),
      }).eq('idempotency_key', idempotency_key)

      return new Response(
        JSON.stringify({ success: true, tilopay_order_id: mockTilopayOrderId, redirect_url: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ─── Real mode: call Tilopay processPayment ────────────────────────────────
    const bearerToken = await getTilopayToken()

    let tilopayResponse: Record<string, unknown>
    let callSucceeded = false

    try {
      const res = await fetch(`${TILOPAY_BASE}/api/v1/processPayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          key: tilopayKey,
          orderNumber,
          amount: total,
          currency: 'CRC',
          affiliateId: tilopayAccount.tilopay_affiliate_id,
          platformFeePercent,
          redirect: 'monch://payment-callback',
          language: 'es',
        }),
      })

      tilopayResponse = await res.json()
      // processPayment returns a hosted payment URL — a 200 with a url field is success
      callSucceeded = res.ok && !!tilopayResponse.url
    } catch (networkErr) {
      tilopayResponse = { error: (networkErr as Error).message }
      callSucceeded = false
    }

    const tilopayOrderId = tilopayResponse.orderId as string | undefined
    const redirectUrl = tilopayResponse.url as string | undefined

    if (callSucceeded) {
      await supabase.from('payments').update({
        payment_status: 'processing',
        tilopay_order_id: tilopayOrderId ?? null,
        tilopay_business_account_id: tilopayAccount.id,
        idempotency_key,
        updated_at: new Date().toISOString(),
      }).eq('order_id', order_id)

      await supabase.from('tilopay_payment_events').insert({
        payment_id: payment.id,
        tilopay_order_id: tilopayOrderId ?? null,
        event_type: 'order_created',
        event_status: 'success',
        http_endpoint: '/api/v1/processPayment',
        raw_payload: tilopayResponse,
        response_body: tilopayResponse,
        source: 'edge_function',
      })

      await supabase.from('payment_idempotency_keys').update({
        attempt_status: 'succeeded',
        tilopay_order_id: tilopayOrderId ?? null,
        payment_id: payment.id,
        resolved_at: new Date().toISOString(),
      }).eq('idempotency_key', idempotency_key)

      return new Response(
        JSON.stringify({ success: true, tilopay_order_id: tilopayOrderId, redirect_url: redirectUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      await supabase.from('payments').update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      }).eq('order_id', order_id)

      await supabase.from('tilopay_payment_events').insert({
        payment_id: payment.id,
        tilopay_order_id: tilopayOrderId ?? null,
        event_type: 'order_created',
        event_status: 'failed',
        http_endpoint: '/api/v1/processPayment',
        raw_payload: tilopayResponse,
        response_body: tilopayResponse,
        source: 'edge_function',
      })

      await supabase.from('payment_idempotency_keys').update({
        attempt_status: 'failed',
        resolved_at: new Date().toISOString(),
      }).eq('idempotency_key', idempotency_key)

      const errorMsg = (tilopayResponse.message ?? tilopayResponse.error ?? 'Payment creation failed') as string

      return new Response(JSON.stringify({ success: false, error: errorMsg }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
