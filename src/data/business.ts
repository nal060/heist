import { supabase } from '../lib/supabase';
import { formatPickupWindow, formatTime } from '../utils/formatTime';
import type { OrderStatus, BagStatus } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEMO_BUSINESS_ID = 'b1000000-0000-0000-0000-000000000001';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardOrder {
  id: string;
  pickupCode: string;
  bagTitle: string;
  quantity: number;
  totalPrice: number;
  pickupDate?: string;
  pickupWindow: string;
  status: OrderStatus;
  reservedAt: string;
  isOutsideWindow?: boolean;
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

function outsidePickupWindow(pickupDate: string, startTime: string, endTime: string): boolean {
  const now = new Date();
  const start = new Date(`${pickupDate}T${startTime}`);
  const end = new Date(`${pickupDate}T${endTime}`);
  return now < start || now > end;
}

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

  // Round-trip 2: today's stats + recent orders (reuses getBusinessOrders for consistent bag title logic)
  const [todayRes, recentOrders] = await Promise.all([
    supabase
      .from('orders')
      .select('total_price, status, surplus_bags!inner(business_id)')
      .eq('surplus_bags.business_id', businessId)
      .eq('pickup_date', today)
      .neq('status', 'cancelled'),
    getBusinessOrders(businessId, 'all'),
  ]);

  if (todayRes.error) throw new Error('No se pudieron cargar los pedidos: ' + todayRes.error.message);

  const todayOrders = todayRes.data ?? [];

  return {
    businessName: business?.name ?? 'Mi Negocio',
    stats: {
      activeBags: (activeBagsData ?? []).length,
      ordersToday: todayOrders.length,
      revenueToday: todayOrders
        .filter((o) => o.status === 'collected')
        .reduce((sum, o) => sum + Number(o.total_price), 0),
    },
    recentOrders: recentOrders.slice(0, 10),
    activeBags: (activeBagsData ?? []).map((b) => ({
      id: b.id,
      title: b.title,
      available: b.quantity_available,
      total: b.quantity_total,
      price: Number(b.discounted_price),
    })),
  };
}

// ─── Bags tab ─────────────────────────────────────────────────────────────────

export interface BusinessBag {
  id: string;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  quantityTotal: number;
  quantityAvailable: number;
  pickupStart: string;
  pickupEnd: string;
  date: string;
  status: BagStatus;
}

function formatBagDate(dateStr: string): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (dateStr === today.toISOString().split('T')[0]) return 'Hoy';
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Ayer';
  if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Mañana';
  return dateStr;
}

/**
 * Fetches bags for a business, ordered by date DESC.
 * Pass a status to query server-side using the (date, status) index.
 * Pass nothing to retrieve all bags.
 */
export async function getBusinessBags(
  businessId: string,
  status?: BagStatus
): Promise<BusinessBag[]> {
  let query = supabase
    .from('surplus_bags')
    .select(
      'id, title, original_price, discounted_price, quantity_total, quantity_available, pickup_start_time, pickup_end_time, date, status'
    )
    .eq('business_id', businessId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw new Error('No se pudieron cargar las bolsas: ' + error.message);

  return (data ?? []).map((b) => ({
    id: b.id,
    title: b.title,
    originalPrice: Number(b.original_price),
    discountedPrice: Number(b.discounted_price),
    quantityTotal: b.quantity_total,
    quantityAvailable: b.quantity_available,
    pickupStart: formatTime(b.pickup_start_time),
    pickupEnd: formatTime(b.pickup_end_time),
    date: formatBagDate(b.date),
    status: b.status as BagStatus,
  }));
}

// ─── Create bag ───────────────────────────────────────────────────────────────

export interface CreateBagPayload {
  title: string;
  description: string | null;
  originalPrice: number;
  discountedPrice: number;
  date: string;
  pickupStartTime: string;
  pickupEndTime: string;
  quantityTotal: number;
}

/**
 * Inserts a new active surplus bag for the given business.
 * Returns the created bag's id.
 */
export async function createBag(
  businessId: string,
  payload: CreateBagPayload
): Promise<string> {
  const { data, error } = await supabase
    .from('surplus_bags')
    .insert({
      business_id: businessId,
      title: payload.title,
      description: payload.description,
      original_price: payload.originalPrice,
      discounted_price: payload.discountedPrice,
      date: payload.date,
      pickup_start_time: payload.pickupStartTime,
      pickup_end_time: payload.pickupEndTime,
      quantity_total: payload.quantityTotal,
      quantity_available: payload.quantityTotal,
      status: 'active',
    })
    .select('id')
    .single();
  if (error) throw new Error('No se pudo crear la bolsa: ' + error.message);
  return data.id;
}

// ─── Orders tab ───────────────────────────────────────────────────────────────

/**
 * Looks up a single order by pickup code for a given business.
 * Returns null if the code doesn't exist for this business.
 */
export async function getOrderByCode(
  businessId: string,
  pickupCode: string
): Promise<DashboardOrder | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, pickup_code, quantity, total_price, pickup_date, pickup_start_time, pickup_end_time, status, reserved_at, surplus_bags!inner(title, business_id)'
    )
    .eq('surplus_bags.business_id', businessId)
    .eq('pickup_code', pickupCode)
    .maybeSingle();

  if (error) throw new Error('Error al buscar el pedido: ' + error.message);
  if (!data) return null;

  const pickupDate = (data as any).pickup_date ?? '';
  return {
    id: data.id,
    pickupCode: data.pickup_code,
    bagTitle: (data.surplus_bags as unknown as { title: string } | null)?.title ?? '—',
    quantity: data.quantity,
    totalPrice: Number(data.total_price),
    pickupDate: formatBagDate(pickupDate),
    pickupWindow: formatPickupWindow(data.pickup_start_time, data.pickup_end_time),
    status: data.status as OrderStatus,
    reservedAt: relativeTime(data.reserved_at),
    isOutsideWindow: outsidePickupWindow(pickupDate, data.pickup_start_time, data.pickup_end_time),
  };
}

/**
 * Fetches orders for a business, ordered by reserved_at DESC.
 * Pass dateFilter='today' to scope to today only, 'all' for all orders.
 */
export async function getBusinessOrders(
  businessId: string,
  dateFilter: 'today' | 'all' = 'today'
): Promise<DashboardOrder[]> {
  let query = supabase
    .from('orders')
    .select(
      'id, pickup_code, quantity, total_price, pickup_date, pickup_start_time, pickup_end_time, status, reserved_at, surplus_bags!inner(title, business_id)'
    )
    .eq('surplus_bags.business_id', businessId)
    .order('reserved_at', { ascending: false });

  if (dateFilter === 'today') {
    const today = new Date().toISOString().split('T')[0];
    query = query.eq('pickup_date', today);
  }

  const { data, error } = await query;
  if (error) throw new Error('No se pudieron cargar los pedidos: ' + error.message);

  return (data ?? []).map((o) => ({
    id: o.id,
    pickupCode: o.pickup_code,
    bagTitle: (o.surplus_bags as unknown as { title: string } | null)?.title ?? '—',
    quantity: o.quantity,
    totalPrice: Number(o.total_price),
    pickupDate: formatBagDate(o.pickup_date ?? ''),
    pickupWindow: formatPickupWindow(o.pickup_start_time, o.pickup_end_time),
    status: o.status as OrderStatus,
    reservedAt: relativeTime(o.reserved_at),
  }));
}

export async function cancelOrder(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId);
  if (error) throw new Error('No se pudo cancelar el pedido: ' + error.message);
}

export async function collectOrder(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'collected', collected_at: new Date().toISOString().split('T')[0] })
    .eq('id', orderId);
  if (error) throw new Error('No se pudo marcar el pedido como recogido: ' + error.message);
}

// ─── Cancel bag ───────────────────────────────────────────────────────────────

/**
 * Cancels a surplus bag and all of its reserved orders in parallel.
 */
export async function cancelBag(bagId: string): Promise<void> {
  const [bagRes, ordersRes] = await Promise.all([
    supabase
      .from('surplus_bags')
      .update({ status: 'cancelled' })
      .eq('id', bagId),
    supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('surplus_bag_id', bagId)
      .eq('status', 'reserved'),
  ]);
  if (bagRes.error) throw new Error('No se pudo cancelar la bolsa: ' + bagRes.error.message);
  if (ordersRes.error) throw new Error('No se pudieron cancelar los pedidos: ' + ordersRes.error.message);
}
