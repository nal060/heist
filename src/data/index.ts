  import { supabase } from '../lib/supabase';
  import type {
    BagWithBusiness,
    Business,
    Category,
    ConsumerProfile,
    OrderWithDetails,
    SurplusBag,
  } from '../types';

  const FIFTY_MILES_IN_METERS = 80467.2;

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

    if (bizError) throw bizError;
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
      .order('created_at', { ascending: false });

    if (error) throw error;
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

    const { data: catData } = await supabase
      .from('business_categories')
      .select('category:categories(*)')
      .eq('business_id', data.business_id)
      .limit(1)
      .single();
      
    return {
      ...data,
      business: data.business as Business,
      category: (catData?.category as Category[] | undefined)?.[0] ?? null,
      isFavorite: false,
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
        business:businesses(*)
      `)
      .in('business_id', ids)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((bag) => ({
      ...bag,
      business: bag.business as Business,
      category: null,
      isFavorite: false,
    }));
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

    if (error) throw error;

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
        business:businesses(*)
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((bag) => ({
      ...bag,
      business: bag.business as Business,
      category: null,
      isFavorite: false,
    }));
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

  /**
   * Returns order history with full details.
   */
  export async function getOrderHistory(): Promise<OrderWithDetails[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        bag:surplus_bags(*, business:businesses(*)),
        payment:payments(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

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

  return data as unknown as Business;
}

/**
 * Returns order history with full details.
 */
export async function getOrderHistory(): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      bag:surplus_bags(*, business:businesses(*)),
      payment:payments(*)
    `)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as OrderRow[])
    .filter((order) => order.bag !== null)
    .map((order) => ({
      ...order,
      business: order.bag!.business,
      bag: order.bag!,
      payment: Array.isArray(order.payment) ? (order.payment[0] ?? null) : order.payment,
    })) as unknown as OrderWithDetails[];
}

/**
 * Returns the current user profile.
 * Hardcoded until auth is implemented.
 */
export function getUser(): ConsumerProfile {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000001',
    name: 'Usuario Demo',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };
}