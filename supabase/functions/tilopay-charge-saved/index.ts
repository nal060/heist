import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { TILOPAY_BASE, IS_MOCK, getTilopayToken, generateOrderNumber } from '../_shared/tilopay.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChargeSavedBody {
  order_id: string
  payment_method_id: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const tilopayKey = Deno.env.get('TILOPAY_KEY')!

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

    const { order_id, payment_method_id }: ChargeSavedBody = await req.json()

    // ─── Mock fast-path ────────────────────────────────────────────────────────
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const mockTilopayOrderId = `MOCK-${crypto.randomUUID().slice(0, 8)}`
      await supabase.from('payments').update({
        payment_status: 'completed',
        tilopay_order_id: mockTilopayOrderId,
        updated_at: new Date().toISOString(),
      }).eq('order_id', order_id)
      return new Response(JSON.stringify({ success: true, tilopay_order_id: mockTilopayOrderId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch payment method server-side to get the card_token (never exposed to client)
    const { data: paymentMethod, error: pmError } = await supabase
      .from('payment_methods')
      .select('id, user_id, card_token, is_active')
      .eq('id', payment_method_id)
      .eq('is_active', true)
      .single()

    if (pmError || !paymentMethod) {
      return new Response(JSON.stringify({ error: 'Payment method not found or inactive' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (paymentMethod.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch payment row → total + status for double-charge guard
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, total, payment_status, tilopay_business_account_id')
      .eq('order_id', order_id)
      .single()

    if (paymentError || !payment) {
      return new Response(JSON.stringify({ error: 'Payment record not found for this order' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Guard against double-charge
    if (payment.payment_status === 'completed') {
      return new Response(JSON.stringify({ error: 'This order has already been paid' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch Tilopay business account via the order → bag → business chain
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

    // Fix 2: Ensure the authenticated user owns this order
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

    const total = payment.total as number
    const orderNumber = generateOrderNumber(order_id)

    // Real mode: call Tilopay process_cof with split payout
    const bearerToken = await getTilopayToken()
    const feeBps = tilopayAccount.platform_fee_bps as number
    // platform_fee_bps: 500 = 5%. Tilopay expects a percentage (e.g. 5.00)
    const platformFeePercent = (feeBps / 100).toFixed(2)

    let tilopayResponse: Record<string, unknown>
    let chargeSucceeded = false

    try {
      const res = await fetch(`${TILOPAY_BASE}/api/v1/process_cof`, {
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
          cardToken: paymentMethod.card_token,
          affiliateId: tilopayAccount.tilopay_affiliate_id,
          platformFeePercent,
          redirect: 'monch://payment-callback',
          language: 'es',
        }),
      })

      tilopayResponse = await res.json()
      chargeSucceeded = res.ok && tilopayResponse.status !== 'declined'
    } catch (networkErr) {
      tilopayResponse = { error: (networkErr as Error).message }
      chargeSucceeded = false
    }

    const tilopayOrderId = tilopayResponse.orderId as string | undefined

    if (chargeSucceeded) {
      await supabase.from('payments').update({
        payment_status: 'completed',
        tilopay_order_id: tilopayOrderId ?? null,
        updated_at: new Date().toISOString(),
      }).eq('order_id', order_id)

      const { error: eventInsertError } = await supabase.from('tilopay_payment_events').insert({
        payment_id: payment.id,
        tilopay_order_id: tilopayOrderId ?? null,
        event_type: 'process_cof',
        parsed_status: 'approved',
        http_endpoint: '/api/v1/process_cof',
        raw_payload: tilopayResponse,
        source: 'edge_function',
      })
      if (eventInsertError) console.error('Failed to insert tilopay_payment_events (success):', eventInsertError.message)

      return new Response(JSON.stringify({ success: true, tilopay_order_id: tilopayOrderId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      await supabase.from('payments').update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      }).eq('order_id', order_id)

      const { error: eventInsertError } = await supabase.from('tilopay_payment_events').insert({
        payment_id: payment.id,
        tilopay_order_id: tilopayOrderId ?? null,
        event_type: 'process_cof',
        parsed_status: 'declined',
        http_endpoint: '/api/v1/process_cof',
        raw_payload: tilopayResponse,
        source: 'edge_function',
      })
      if (eventInsertError) console.error('Failed to insert tilopay_payment_events (failed):', eventInsertError.message)

      const errorMsg = (tilopayResponse.message ?? tilopayResponse.error ?? 'Charge failed') as string

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
