import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { TILOPAY_BASE, IS_MOCK, getTilopayToken } from '../_shared/tilopay.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    if (IS_MOCK) {
      return new Response(JSON.stringify({ url: 'mock://tokenize' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const key = Deno.env.get('TILOPAY_KEY')!
    const userEmail = user.email!

    const res = await fetch(`${TILOPAY_BASE}/api/v1/processTokenize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        email: userEmail,
        redirect: 'monch://payment-callback',
        language: 'es',
      }),
    })

    if (!res.ok) {
      throw new Error(`Tilopay processTokenize failed: ${res.status} ${res.statusText}`)
    }

    const json = await res.json()

    return new Response(JSON.stringify({ url: json.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
