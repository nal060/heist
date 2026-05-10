import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { TILOPAY_BASE, IS_MOCK, getTilopayToken, generateOrderNumber } from '../_shared/tilopay.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreatePaymentBody {
  order_id: string
  save_card: boolean
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

    const { order_id, save_card }: CreatePaymentBody = await req.json()

    if (!order_id) {
      return new Response(JSON.stringify({ error: 'order_id is required' }), {
        status: 400,
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
      return new Response(
        JSON.stringify({ url: 'mock://payment' }),
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
          subscription: save_card ? 1 : 0,
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
        updated_at: new Date().toISOString(),
      }).eq('order_id', order_id)

      const { error: eventInsertError } = await supabase.from('tilopay_payment_events').insert({
        payment_id: payment.id,
        tilopay_order_id: tilopayOrderId ?? null,
        event_type: 'order_created',
        parsed_status: 'approved',
        http_endpoint: '/api/v1/processPayment',
        raw_payload: tilopayResponse,
        source: 'edge_function',
      })
      if (eventInsertError) console.error('Failed to insert tilopay_payment_events (success):', eventInsertError.message)

      return new Response(
        JSON.stringify({ url: redirectUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      await supabase.from('payments').update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      }).eq('order_id', order_id)

      const { error: eventInsertError } = await supabase.from('tilopay_payment_events').insert({
        payment_id: payment.id,
        tilopay_order_id: tilopayOrderId ?? null,
        event_type: 'order_created',
        parsed_status: 'declined',
        http_endpoint: '/api/v1/processPayment',
        raw_payload: tilopayResponse,
        source: 'edge_function',
      })
      if (eventInsertError) console.error('Failed to insert tilopay_payment_events (failed):', eventInsertError.message)

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
