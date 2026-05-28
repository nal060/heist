import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { strings } from '../constants/strings';

const isLocal = process.env.EXPO_PUBLIC_SUPABASE_ENV === 'local';

const ADMIN_URL = isLocal
  ? process.env.EXPO_PUBLIC_SUPABASE_LOCAL_URL!
  : process.env.EXPO_PUBLIC_SUPABASE_URL!;

const ADMIN_SERVICE_KEY = isLocal
  ? process.env.EXPO_PUBLIC_SUPABASE_LOCAL_SERVICE_KEY!
  : process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY!;

function createAdminClient() {
  return createClient(ADMIN_URL, ADMIN_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function signInAsUserId(userId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId);
  if (userError || !userData.user?.email) {
    throw new Error('No se pudo obtener el usuario de autenticación');
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: userData.user.email,
  });
  if (linkError || !linkData?.properties?.hashed_token) {
    throw new Error(`Error al generar enlace: ${linkError?.message ?? 'token vacío'}`);
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  });
  if (verifyError) throw new Error(`Error al iniciar sesión: ${verifyError.message}`);
}

export async function simulateConsumerLogin(): Promise<void> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('consumer_profiles')
    .select('user_id')
    .limit(1)
    .single();
  if (error || !data) throw new Error(strings.simulate.noConsumer);
  await signInAsUserId(data.user_id);
}

export async function simulateBusinessLogin(): Promise<void> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('businesses')
    .select('user_id')
    .limit(1)
    .single();

  if (error || !data) throw new Error(strings.simulate.noBusiness);
  await signInAsUserId(data.user_id);
}
