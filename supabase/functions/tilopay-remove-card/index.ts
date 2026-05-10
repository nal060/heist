import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { TILOPAY_BASE, IS_MOCK, getTilopayToken } from '../_shared/tilopay.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RemoveCardBody {
  payment_method_id: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

    const { payment_method_id }: RemoveCardBody = await req.json()

    // Fetch the payment method server-side — includes card_token for Tilopay API call
    const { data: paymentMethod, error: fetchError } = await supabase
      .from('payment_methods')
      .select('id, user_id, card_token, is_active')
      .eq('id', payment_method_id)
      .single()

    if (fetchError || !paymentMethod) {
      return new Response(JSON.stringify({ error: 'Payment method not found' }), {
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

    if (!IS_MOCK) {
      const token = await getTilopayToken()

      const res = await fetch(`${TILOPAY_BASE}/api/v1/user/card-remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token, card_token: paymentMethod.card_token }),
      })

      // Log but don't hard-fail on Tilopay API errors — we still soft-delete locally
      if (!res.ok) {
        console.error(`Tilopay card-remove failed: ${res.status} ${res.statusText}`)
      }
    }

    const { error: updateError } = await supabase
      .from('payment_methods')
      .update({ is_active: false, is_default: false })
      .eq('id', payment_method_id)

    if (updateError) throw new Error(updateError.message)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
