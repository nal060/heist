  import { supabase } from '../lib/supabase';
  import type {
    BagWithBusiness,
    Business,
    BusinessWithBags,
    Category,

    Order,
    OrderWithDetails,
    SurplusBag,
  } from '../types';

  export const FIFTY_MILES_IN_METERS = 80467.2;

/**
 * Returns all categories from the database.
 */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    throw new Error('Failed to fetch categories: ' + error.message);
  }

  return data ?? [];
}

/**
 * Returns all active surplus bags.
 */
export async function getAllActiveBags(): Promise<BagWithBusiness[]> {
  const { data, error } = await supabase
    .from('surplus_bags')
    .select(`
      *,
      business:businesses(
        *,
        business_categories(
          category:categories(*)
        )
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch active bags: ' + error.message);
  }

  return (data ?? []).map((bag) => {
    const biz = bag.business as Business & { business_categories: { category: Category }[] };
    return {
      ...bag,
      business: biz,
      category: biz?.business_categories?.[0]?.category ?? null,
      isFavorite: false,
    };
  });
}

  /**
   * Returns surplus bags from businesses within 50 miles of the given coordinates.
   */
  export async function getNearbyBags(
    latitude: number,
    longitude: number
  ): Promise<BagWithBusiness[]> {
    const { data: nearbyBusinesses, error: bizError } = await supabase.rpc(
      'get_nearby_business_ids',
      {
        user_lat: latitude,
        user_lon: longitude,
        radius_meters: FIFTY_MILES_IN_METERS,
      },
    );

    if (bizError) {
      throw new Error('Failed to fetch nearby businesses: ' + bizError.message);
    }
    if (!nearbyBusinesses || nearbyBusinesses.length === 0) return [];

    const businessIds = nearbyBusinesses.map((b: { id: string }) => b.id);

    const { data, error } = await supabase
      .from('surplus_bags')
      .select(`
        *,
        business:businesses(
          *,
          business_categories(
            category:categories(*)
          )
        )
      `)
      .in('business_id', businessIds)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch nearby bags: ' + error.message);
    }
    return (data ?? []).map((bag) => {
      const biz = bag.business as Business & { business_categories: { category: Category }[] };
      return {
        ...bag,
        business: biz,
        category: biz?.business_categories?.[0]?.category ?? null,
        isFavorite: false,
      };
    });
  }

  /**
   * Returns recommended bags (not location-dependent).
   */
  export async function getRecommendedBags(): Promise<BagWithBusiness[]> {
    const { data, error } = await supabase
      .from('surplus_bags')
      .select(`
        *,
        business:businesses(
          *,
          business_categories(
            category:categories(*)
          )
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) {
      throw new Error('Failed to fetch recommended bags: ' + error.message);
    }
    return (data ?? []).map((bag) => {
      const biz = bag.business as Business & { business_categories: { category: Category }[] };
      return {
        ...bag,
        business: biz,
        category: biz?.business_categories?.[0]?.category ?? null,
        isFavorite: false,
      };
    });
  }

  /**
   * Returns a single bag by ID, or undefined if not found.
   */
  export async function getBagById(id: string): Promise<BagWithBusiness | undefined> {
    const { data, error } = await supabase
      .from('surplus_bags')
      .select(`
        *,
        business:businesses(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    const [{ data: catData }, { data: photosData }] = await Promise.all([
      supabase
        .from('business_categories')
        .select('category:categories(*)')
        .eq('business_id', data.business_id)
        .limit(1)
        .single(),
      supabase
        .from('bag_photos')
        .select('*')
        .eq('bag_id', id)
        .order('display_order'),
    ]);

    return {
      ...data,
      business: data.business as Business,
      category: (catData?.category as Category[] | undefined)?.[0] ?? null,
      isFavorite: false,
      photos: (photosData ?? []) as import('../types').BagPhoto[],
    };
  }

  /**
   * Returns bags filtered by category ID.
   */
  export async function getBagsByCategory(categoryId: string): Promise<BagWithBusiness[]> {
    const { data: businessIds } = await supabase
      .from('business_categories')
      .select('business_id')
      .eq('category_id', categoryId);

    if (!businessIds || businessIds.length === 0) return [];

    const ids = businessIds.map((b) => b.business_id);

    const { data, error } = await supabase
      .from('surplus_bags')
      .select(`
        *,
        business:businesses(
          *,
          business_categories(
            category:categories(*)
          )
        )
      `)
      .in('business_id', ids)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch bags by category: ' + error.message);
    }

    return (data ?? []).map((bag) => {
      const biz = bag.business as Business & { business_categories: { category: Category }[] };
      return {
        ...bag,
        business: biz,
        category: biz?.business_categories?.[0]?.category ?? null,
        isFavorite: false,
      };
    });
  }

  /**
   * Returns bags from businesses that are in the user's favorites.
   */
  export async function getFavoriteBags(
    favoriteBusinessIds: Set<string>,
  ): Promise<BagWithBusiness[]> {
    const ids = Array.from(favoriteBusinessIds);
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from('surplus_bags')
      .select(`
        *,
        business:businesses(*)
      `)
      .in('business_id', ids)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch favorite bags: ' + error.message);
    }

    return (data ?? []).map((bag) => ({
      ...bag,
      business: bag.business as Business,
      category: null,
      isFavorite: true,
    }));
  }

  /**
   * Searches bags by query string.
   */
  export async function searchBags(query: string): Promise<BagWithBusiness[]> {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('surplus_bags')
      .select(`
        *,
        business:businesses(
          *,
          business_categories(
            category:categories(*)
          )
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to search bags: ' + error.message);
    }

    return (data ?? []).map((bag) => {
      const biz = bag.business as Business & { business_categories: { category: Category }[] };
      return {
        ...bag,
        business: biz,
        category: biz?.business_categories?.[0]?.category ?? null,
        isFavorite: false,
      };
    });
  }

  /**
   * Returns a business by ID.
   */
  export async function getBusinessById(id: string): Promise<Business | undefined> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;

    return data;
  }

  // ─── Order creation ─────────────────────────────────────────────────────────

  function generatePickupCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  export interface CreateOrderInput {
    bagId: string;
    quantity: number;
    subtotal: number;
    tax: number;
    total: number;
  }

  export async function createOrder(input: CreateOrderInput): Promise<Order> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No se encontro la sesion del usuario.');

    // Fetch bag to get pickup times
    const { data: bag, error: bagError } = await supabase
      .from('surplus_bags')
      .select('pickup_start_time, pickup_end_time, date, quantity_available')
      .eq('id', input.bagId)
      .single();

    if (bagError || !bag) throw new Error('No se pudo obtener la bolsa.');
    if (bag.quantity_available < input.quantity) throw new Error('No hay suficientes bolsas disponibles.');

    const pickupCode = generatePickupCode();
    const today = new Date().toISOString().split('T')[0];

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        surplus_bag_id: input.bagId,
        quantity: input.quantity,
        total_price: input.total,
        pickup_code: pickupCode,
        pickup_start_time: bag.pickup_start_time,
        pickup_end_time: bag.pickup_end_time,
        pickup_date: bag.date || today,
        status: 'reserved',
        reserved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) throw new Error('No se pudo crear el pedido: ' + orderError.message);

    // Create payment record (bypassed — marked as completed)
    await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        total: input.total,
        subtotal: input.subtotal,
        payment_method: 'card',
        payment_status: 'completed',
        paid_at: new Date().toISOString(),
        breakdown: { subtotal: input.subtotal, tax: input.tax },
      });

    // Decrement quantity_available
    await supabase.rpc('decrement_bag_quantity', {
      bag_id: input.bagId,
      amount: input.quantity,
    });

    return order as Order;
  }

  export async function getOrderById(orderId: string): Promise<OrderWithDetails | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        bag:surplus_bags(*, business:businesses(*)),
        payment:payments(*)
      `)
      .eq('id', orderId)
      .single();

    if (error || !data) return null;

    const bag = data.bag as (SurplusBag & { business: Business }) | null;
    return {
      ...data,
      business: bag?.business ?? null,
      bag: bag as SurplusBag,
      payment: Array.isArray(data.payment) ? data.payment[0] ?? null : data.payment,
    } as OrderWithDetails;
  }

  /**
   * Returns order history with full details.
   */
  export async function getOrderHistory(): Promise<OrderWithDetails[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        bag:surplus_bags(*, business:businesses(*)),
        payment:payments(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch order history: ' + error.message);
    }

    return (data ?? []).map((order) => {
      const bag = order.bag as (SurplusBag & { business: Business }) | null;
      return {
        ...order,
        business: bag?.business ?? null,
        bag: bag as SurplusBag,
        payment: Array.isArray(order.payment) ? order.payment[0] ?? null : order.payment,
      };
    });
  }

  // ─── Favorites ──────────────────────────────────────────────────────────────

  export async function getFavoriteBagIds(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('favorite_bags')
      .select('bag_id')
      .eq('user_id', user.id);
    return (data ?? []).map((r) => r.bag_id);
  }

  export async function getFavoriteBusinessIds(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('favorites')
      .select('business_id')
      .eq('user_id', user.id);
    return (data ?? []).map((r) => r.business_id);
  }

  export async function addFavoriteBag(bagId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    await supabase
      .from('favorite_bags')
      .upsert({ user_id: user.id, bag_id: bagId }, { onConflict: 'user_id,bag_id' });
  }

  export async function removeFavoriteBag(bagId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('favorite_bags')
      .delete()
      .eq('user_id', user.id)
      .eq('bag_id', bagId);
  }

  export async function addFavoriteBusiness(businessId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    await supabase
      .from('favorites')
      .upsert({ user_id: user.id, business_id: businessId }, { onConflict: 'user_id,business_id' });
  }

  export async function removeFavoriteBusiness(businessId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('business_id', businessId);
  }

  export async function getFavoriteBagsList(bagIds: Set<string>): Promise<BagWithBusiness[]> {
    const ids = Array.from(bagIds);
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from('surplus_bags')
      .select(`*, business:businesses(*)`)
      .in('id', ids)
      .order('created_at', { ascending: false });
    if (error) throw new Error('Failed to fetch favorite bags: ' + error.message);
    return (data ?? []).map((bag) => ({
      ...bag,
      business: bag.business as Business,
      category: null,
      isFavorite: true,
    }));
  }

  export async function getFavoriteBusinessesList(businessIds: Set<string>): Promise<BusinessWithBags[]> {
    const ids = Array.from(businessIds);
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .in('id', ids);
    if (error) throw new Error('Failed to fetch favorite businesses: ' + error.message);

    // Get active bag counts
    const { data: countData } = await supabase
      .from('surplus_bags')
      .select('business_id')
      .in('business_id', ids)
      .eq('status', 'active');

    const counts: Record<string, number> = {};
    (countData ?? []).forEach((row) => {
      counts[row.business_id] = (counts[row.business_id] || 0) + 1;
    });

    return (data ?? []).map((biz) => ({
      ...biz,
      activeBagCount: counts[biz.id] || 0,
    }));
  }

  export async function getBusinessActiveBags(businessId: string): Promise<BagWithBusiness[]> {
    const { data: bizData } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    const { data, error } = await supabase
      .from('surplus_bags')
      .select('*')
      .eq('business_id', businessId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch business bags: ' + error.message);
    return (data ?? []).map((bag) => ({
      ...bag,
      business: bizData as Business,
      category: null,
      isFavorite: false,
    }));
  }

  // ─── Notification Preferences ───────────────────────────────────────────────

  export async function setNotificationPreference(
    targetType: 'bag' | 'business',
    targetId: string,
    enabled: boolean,
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (enabled) {
      await supabase
        .from('notification_preferences')
        .upsert(
          { user_id: user.id, target_type: targetType, target_id: targetId, enabled: true },
          { onConflict: 'user_id,target_type,target_id' },
        );
    } else {
      await supabase
        .from('notification_preferences')
        .delete()
        .eq('user_id', user.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId);
    }
  }

  export async function getNotificationPreferences(): Promise<Map<string, boolean>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Map();
    const { data } = await supabase
      .from('notification_preferences')
      .select('target_type, target_id, enabled')
      .eq('user_id', user.id);
    const map = new Map<string, boolean>();
    (data ?? []).forEach((row) => {
      map.set(`${row.target_type}:${row.target_id}`, row.enabled);
    });
    return map;
  }

