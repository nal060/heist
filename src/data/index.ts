import { supabase } from '../lib/supabase';
import type {
  BagWithBusiness,
  Business,
  ConsumerProfile,
  OrderWithDetails,
  SurplusBag,
  BagPhoto,
  Category,
} from '../types';

interface BagRow extends SurplusBag {
  business: Business;
  photos: BagPhoto[];
}

interface BusinessCategoryRow {
  business_id: string;
  category: Category | null;
}

interface OrderRow {
  bag: (SurplusBag & { business: Business }) | null;
  payment: unknown[] | unknown;
  [key: string]: unknown;
}

/**
 * Returns all surplus bags joined with their business, photos, and category info.
 */
export async function getAllBags(): Promise<BagWithBusiness[]> {
  const { data, error } = await supabase
    .from('surplus_bags')
    .select(`
      *,
      business:businesses(*),
      photos:bag_photos(*)
    `)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  const bags = data as unknown as BagRow[];

  // Get all business categories in one query
  const businessIds = [...new Set(bags.map((b) => b.business_id))];
  const { data: bcData } = await supabase
    .from('business_categories')
    .select('business_id, category:categories(*)')
    .in('business_id', businessIds);

  const categoryMap: Record<string, Category | null> = {};
  for (const bc of (bcData as unknown as BusinessCategoryRow[]) ?? []) {
    categoryMap[bc.business_id] = bc.category;
  }

  return bags.map((bag) => ({
    ...bag,
    business: bag.business,
    photos: bag.photos ?? [],
    category: categoryMap[bag.business_id] ?? null,
    isFavorite: false,
  }));
}

/**
 * Returns a single bag by ID, or undefined if not found.
 */
export async function getBagById(id: string): Promise<BagWithBusiness | undefined> {
  const { data, error } = await supabase
    .from('surplus_bags')
    .select(`
      *,
      business:businesses(*),
      photos:bag_photos(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return undefined;
  }

  const bag = data as unknown as BagRow;

  const { data: catData } = await supabase
    .from('business_categories')
    .select('category:categories(*)')
    .eq('business_id', bag.business_id)
    .limit(1)
    .single();

  const catRow = catData as unknown as { category: Category | null } | null;

  return {
    ...bag,
    business: bag.business,
    photos: bag.photos ?? [],
    category: catRow?.category ?? null,
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

  const ids = (businessIds as unknown as { business_id: string }[]).map((b) => b.business_id);

  const { data, error } = await supabase
    .from('surplus_bags')
    .select(`
      *,
      business:businesses(*),
      photos:bag_photos(*)
    `)
    .in('business_id', ids)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as BagRow[]).map((bag) => ({
    ...bag,
    business: bag.business,
    photos: bag.photos ?? [],
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
      business:businesses(*),
      photos:bag_photos(*)
    `)
    .in('business_id', ids)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as BagRow[]).map((bag) => ({
    ...bag,
    business: bag.business,
    photos: bag.photos ?? [],
    category: null,
    isFavorite: true,
  }));
}

/**
 * Searches bags by query string.
 */
export async function searchBags(query: string): Promise<BagWithBusiness[]> {
  if (!query.trim()) return getAllBags();

  const { data, error } = await supabase
    .from('surplus_bags')
    .select(`
      *,
      business:businesses(*),
      photos:bag_photos(*)
    `)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as BagRow[]).map((bag) => ({
    ...bag,
    business: bag.business,
    photos: bag.photos ?? [],
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

  if (error || !data) {
    return undefined;
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