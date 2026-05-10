import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SaveCardBody {
  card_token: string
  card_last_four: string
  card_brand: string
  card_expiry_month: number
  card_expiry_year: number
  card_holder_name?: string
  set_as_default: boolean
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

    const body: SaveCardBody = await req.json()
    const {
      card_token,
      card_last_four,
      card_brand,
      card_expiry_month,
      card_expiry_year,
      card_holder_name,
      set_as_default,
    } = body

    const userId = user.id

    // Clear existing default before inserting so we don't conflict with the unique index
    if (set_as_default) {
      const { error: clearError } = await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_active', true)

      if (clearError) throw new Error(clearError.message)
    }

    const { data: newRow, error: insertError } = await supabase
      .from('payment_methods')
      .insert({
        user_id: userId,
        card_token,
        card_last_four,
        card_brand,
        card_expiry_month,
        card_expiry_year,
        card_holder_name: card_holder_name ?? null,
        is_default: set_as_default,
        is_active: true,
      })
      // Return all columns except card_token — never expose the token to the client
      .select('id, user_id, card_last_four, card_brand, card_holder_name, card_expiry_month, card_expiry_year, is_default, is_active, nickname, created_at, updated_at')
      .single()

    if (insertError) throw new Error(insertError.message)

    return new Response(JSON.stringify(newRow), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
