import { supabase } from '../lib/supabase';
import { formatPickupWindow } from '../utils/formatTime';
import type { OrderStatus } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEMO_BUSINESS_ID = 'b1000000-0000-0000-0000-000000000001';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardOrder {
  id: string;
  pickupCode: string;
  bagTitle: string;
  quantity: number;
  totalPrice: number;
  pickupWindow: string;
  status: OrderStatus;
  reservedAt: string;
}

export interface DashboardBag {
  id: string;
  title: string;
  available: number;
  total: number;
  price: number;
}

export interface BusinessDashboard {
  businessName: string;
  stats: {
    activeBags: number;
    ordersToday: number;
    revenueToday: number;
  };
  recentOrders: DashboardOrder[];
  activeBags: DashboardBag[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(isoString: string): string {
  const diffMin = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diffMin < 1) return 'ahora mismo';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetches all dashboard data for a business in two parallel round-trips.
 *
 * Round-trip 1: business name + active bags (filtered by status, uses index)
 * Round-trip 2: today's order stats + recent orders (joined through surplus_bags)
 */
export async function getBusinessDashboard(businessId: string): Promise<BusinessDashboard> {
  const today = new Date().toISOString().split('T')[0];

  // Round-trip 1: profile + active bags only (surplus_bags_date_status_idx)
  const [{ data: business, error: bizError }, { data: activeBagsData, error: bagsError }] =
    await Promise.all([
      supabase.from('businesses').select('name').eq('id', businessId).single(),
      supabase
        .from('surplus_bags')
        .select('id, title, quantity_available, quantity_total, discounted_price')
        .eq('business_id', businessId)
        .eq('status', 'active'),
    ]);

  if (bizError) throw new Error('No se pudo cargar el negocio: ' + bizError.message);
  if (bagsError) throw new Error('No se pudieron cargar las bolsas: ' + bagsError.message);

  // Round-trip 2: today's stats + recent orders, filtered via join (no bag ID pre-fetch)
  const [todayRes, recentRes] = await Promise.all([
    supabase
      .from('orders')
      .select('total_price, status, surplus_bags!inner(business_id)')
      .eq('surplus_bags.business_id', businessId)
      .eq('pickup_date', today)
      .neq('status', 'cancelled'),
    supabase
      .from('orders')
      .select(
        'id, pickup_code, quantity, total_price, pickup_start_time, pickup_end_time, status, reserved_at, surplus_bags!inner(title, business_id)'
      )
      .eq('surplus_bags.business_id', businessId)
      .order('reserved_at', { ascending: false })
      .limit(10),
  ]);

  if (todayRes.error) throw new Error('No se pudieron cargar los pedidos: ' + todayRes.error.message);
  if (recentRes.error) throw new Error('No se pudieron cargar los pedidos recientes: ' + recentRes.error.message);

  const todayOrders = todayRes.data ?? [];
  const recentOrdersRaw = recentRes.data ?? [];

  return {
    businessName: business?.name ?? 'Mi Negocio',
    stats: {
      activeBags: (activeBagsData ?? []).length,
      ordersToday: todayOrders.length,
      revenueToday: todayOrders
        .filter((o) => o.status === 'collected')
        .reduce((sum, o) => sum + Number(o.total_price), 0),
    },
    recentOrders: recentOrdersRaw.map((o) => ({
      id: o.id,
      pickupCode: o.pickup_code,
      bagTitle: (o.surplus_bags as unknown as { title: string; business_id: string }[] | null)?.[0]?.title ?? '—',
      quantity: o.quantity,
      totalPrice: Number(o.total_price),
      pickupWindow: formatPickupWindow(o.pickup_start_time, o.pickup_end_time),
      status: o.status as OrderStatus,
      reservedAt: relativeTime(o.reserved_at),
    })),
    activeBags: (activeBagsData ?? []).map((b) => ({
      id: b.id,
      title: b.title,
      available: b.quantity_available,
      total: b.quantity_total,
      price: Number(b.discounted_price),
    })),
  };
}
