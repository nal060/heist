import { supabase } from '../lib/supabase';
import type { CardBrand, PaymentMethod, TilopayBusinessAccount } from '../types';

const TILOPAY_ACCOUNT_COLUMNS = [
  'id', 'business_id', 'tilopay_affiliate_id', 'account_status',
  'bank_account_last_four', 'bank_name', 'platform_fee_bps',
  'created_at', 'updated_at',
].join(', ');

const PAYMENT_METHOD_COLUMNS = [
  'id',
  'user_id',
  'card_last_four',
  'card_brand',
  'card_holder_name',
  'card_expiry_month',
  'card_expiry_year',
  'is_default',
  'is_active',
  'nickname',
  'created_at',
  'updated_at',
].join(', ');

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select(PAYMENT_METHOD_COLUMNS)
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw new Error('Failed to fetch payment methods: ' + error.message);
  return (data ?? []) as unknown as PaymentMethod[];
}

export async function getDefaultPaymentMethod(): Promise<PaymentMethod | null> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select(PAYMENT_METHOD_COLUMNS)
    .eq('is_active', true)
    .eq('is_default', true)
    .maybeSingle();

  if (error) throw new Error('Failed to fetch default payment method: ' + error.message);
  return data as unknown as PaymentMethod | null;
}

export async function setDefaultPaymentMethod(id: string, userId: string): Promise<void> {
  // Non-atomic by design; DB unique index prevents two defaults, only risk is zero defaults on failure
  const { error: clearError } = await supabase
    .from('payment_methods')
    .update({ is_default: false })
    .eq('is_default', true)
    .eq('user_id', userId);

  if (clearError) throw new Error('Failed to clear default payment method: ' + clearError.message);

  const { error: setError } = await supabase
    .from('payment_methods')
    .update({ is_default: true })
    .eq('id', id)
    .eq('user_id', userId);

  if (setError) throw new Error('Failed to set default payment method: ' + setError.message);
}

export async function saveCard(params: {
  card_token: string;
  card_last_four: string;
  card_brand: CardBrand;
  card_expiry_month: number;
  card_expiry_year: number;
  card_holder_name?: string;
  set_as_default: boolean;
}): Promise<PaymentMethod> {
  const { data, error } = await supabase.functions.invoke('tilopay-save-card', {
    body: params,
  });

  if (error) throw new Error('Failed to save card: ' + error.message);
  if (!data?.id) throw new Error('Card save failed: no data returned');
  return data as PaymentMethod;
}

export async function removePaymentMethod(id: string): Promise<void> {
  const { error } = await supabase.functions.invoke('tilopay-remove-card', {
    body: { payment_method_id: id },
  });

  if (error) throw new Error('Failed to remove payment method: ' + error.message);
}

export async function requestTokenizationUrl(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('tilopay-tokenize');

  if (error) throw new Error('Failed to get tokenization URL: ' + error.message);
  if (!data?.url) throw new Error('No URL returned from server');
  return data.url as string;
}

export async function chargeSavedCard(
  orderId: string,
  paymentMethodId: string,
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke('tilopay-charge-saved', {
    body: { order_id: orderId, payment_method_id: paymentMethodId },
  });

  if (error) throw new Error('Failed to charge card: ' + error.message);
  return data as { success: boolean; error?: string };
}

export async function createHostedPayment(orderId: string, saveCard: boolean): Promise<string> {
  const { data, error } = await supabase.functions.invoke('tilopay-create-payment', {
    body: { order_id: orderId, save_card: saveCard },
  });

  if (error) throw new Error('Failed to create hosted payment: ' + error.message);
  if (!data?.url) throw new Error('No URL returned from server');
  return data.url as string;
}

export async function getBusinessPayoutAccount(businessId: string): Promise<TilopayBusinessAccount | null> {
  const { data, error } = await supabase
    .from('tilopay_business_accounts')
    .select(TILOPAY_ACCOUNT_COLUMNS)
    .eq('business_id', businessId)
    .maybeSingle();

  if (error) throw new Error('Failed to fetch payout account: ' + error.message);
  return data as unknown as TilopayBusinessAccount | null;
}
