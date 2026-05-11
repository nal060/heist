// Enums matching DB schema
export type BagStatus = 'draft' | 'active' | 'sold_out' | 'expired' | 'cancelled';
export type BagSizeType = 'small' | 'medium' | 'large';
export type OrderStatus = 'reserved' | 'collected' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethodType = 'credit_card' | 'debit_card' | 'apple_pay' | 'cash';
export type DiscountType = 'percentage' | 'fixed';
export type PreferenceType = 'what_brings_you' | 'pickup_times';

// Core entities
export interface Business {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  photo_url: string | null;
  phone: string | null;
  rating: number;
  total_reviews: number;
  is_active: boolean;
  country_id: string | null;
  google_place_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SurplusBag {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  original_price: number;
  discounted_price: number;
  value: number | null;
  bag_size: BagSizeType;
  date: string;
  quantity_total: number;
  quantity_available: number;
  pickup_start_time: string;
  pickup_end_time: string;
  status: BagStatus;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

export interface BusinessCategory {
  business_id: string;
  category_id: string;
}

export interface BusinessHours {
  id: string;
  business_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  flag_emoji: string;
  is_active: boolean;
  created_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  preference_type: PreferenceType;
  preference_values: string[];
  created_at: string;
  updated_at: string;
}

export interface BagPickupSchedule {
  id: string;
  bag_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface BusinessPhoto {
  id: string;
  business_id: string;
  photo_url: string;
  source: string;
  is_selected: boolean;
  display_order: number;
  created_at: string;
}

export interface BagPhoto {
  id: string;
  bag_id: string;
  photo_url: string;
  display_order: number;
  created_at: string;
}

export interface ConsumerProfile {
  id: string;
  user_id: string;
  name: string;
  country_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  business_id: string;
  created_at: string;
}

export interface FavoriteBag {
  id: string;
  user_id: string;
  bag_id: string;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  target_type: 'bag' | 'business';
  target_id: string;
  enabled: boolean;
  created_at: string;
}

export interface BusinessWithBags extends Business {
  activeBagCount: number;
}

export interface Order {
  id: string;
  user_id: string;
  surplus_bag_id: string;
  quantity: number;
  total_price: number;
  pickup_code: string;
  pickup_start_time: string;
  pickup_end_time: string;
  pickup_date: string;
  status: OrderStatus;
  reserved_at: string;
  collected_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  total: number;
  subtotal: number | null;
  payment_method: PaymentMethodType;
  payment_status: string;
  payment_id: string | null;
  paid_at: string | null;
  breakdown: Record<string, unknown> | null;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  // card_token is intentionally OMITTED — never exposed to client, only used server-side
  card_last_four: string;
  card_brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'other';
  card_holder_name: string | null;
  card_expiry_month: number;
  card_expiry_year: number;
  is_default: boolean;
  is_active: boolean;
  nickname: string | null;
  created_at: string;
  updated_at: string;
}

export type CardBrand = PaymentMethod['card_brand'];

export interface TilopayBusinessAccount {
  id: string;
  business_id: string;
  tilopay_affiliate_id: string;
  account_status: 'pending' | 'active' | 'suspended' | 'offboarded';
  bank_account_last_four: string | null;
  bank_name: string | null;
  platform_fee_bps: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  business_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_order_id: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_purchase: number | null;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

// Composed types for UI
export interface BagWithBusiness extends SurplusBag {
  business: Business;
  category: Category | null;
  isFavorite: boolean;
  photos?: BagPhoto[];
}

export interface OrderWithDetails extends Order {
  business: Business;
  bag: SurplusBag;
  payment: Payment | null;
}

export interface BusinessBagDetail extends SurplusBag {
  schedule: BagPickupSchedule[];
  photos: BagPhoto[];
}
