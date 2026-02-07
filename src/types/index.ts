// Enums matching DB schema
export type BagStatus = 'draft' | 'active' | 'sold_out' | 'expired' | 'cancelled';
export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'picked_up' | 'cancelled' | 'no_show';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'apple_pay' | 'cash';
export type DiscountType = 'percentage' | 'fixed';

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

export interface ConsumerProfile {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  business_id: string;
  created_at: string;
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
  payment_method: string;
  payment_status: string;
  payment_id: string | null;
  paid_at: string | null;
  breakdown: Record<string, unknown> | null;
  created_at: string;
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
}

export interface OrderWithDetails extends Order {
  business: Business;
  bag: SurplusBag;
  payment: Payment | null;
}
