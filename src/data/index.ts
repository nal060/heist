import type {
  BagWithBusiness,
  Business,
  ConsumerProfile,
  OrderWithDetails,
} from '../types';
import { CATEGORIES } from './mock/categories';
import { MOCK_BUSINESSES } from './mock/businesses';
import { getMockBags } from './mock/bags';
import { MOCK_BAG_PHOTOS } from './mock/photos';
import { getMockOrders, getMockPayments } from './mock/orders';
import { MOCK_USER } from './mock/user';

/**
 * Maps a business_id to its category_id.
 * This simulates the business_categories join table.
 */
const BUSINESS_CATEGORY_MAP: Record<string, string> = {
  'biz-001': 'cat-2', // Panaderia Don Pan -> Panaderia
  'biz-002': 'cat-4', // Cafe Unido -> Cafe
  'biz-003': 'cat-3', // Super 99 -> Supermercado
  'biz-004': 'cat-5', // Athanasiou -> Restaurante
  'biz-005': 'cat-4', // New York Bagel Cafe -> Cafe
  'biz-006': 'cat-1', // Mercado de Mariscos -> Comidas
  'biz-007': 'cat-5', // Tantalo Kitchen -> Restaurante
  'biz-008': 'cat-3', // Gran Morrison -> Supermercado
  'biz-009': 'cat-5', // La Rana Dorada -> Restaurante
  'biz-010': 'cat-5', // Crepes & Waffles -> Restaurante
};

/**
 * Builds a BagWithBusiness by joining a bag with its business, photos, and category.
 */
function buildBagWithBusiness(
  bag: ReturnType<typeof getMockBags>[number],
  favoriteBusinessIds?: Set<string>,
): BagWithBusiness | null {
  const business = MOCK_BUSINESSES.find((b) => b.id === bag.business_id);
  if (!business) return null;

  const photos = MOCK_BAG_PHOTOS.filter((p) => p.surplus_bag_id === bag.id);
  const categoryId = BUSINESS_CATEGORY_MAP[business.id];
  const category = categoryId
    ? CATEGORIES.find((c) => c.id === categoryId) ?? null
    : null;

  return {
    ...bag,
    business,
    photos,
    category,
    isFavorite: favoriteBusinessIds?.has(business.id) ?? false,
  };
}

/**
 * Returns all surplus bags joined with their business, photos, and category info.
 */
export function getAllBags(): BagWithBusiness[] {
  const bags = getMockBags();
  return bags
    .map((bag) => buildBagWithBusiness(bag))
    .filter((b): b is BagWithBusiness => b !== null);
}

/**
 * Returns bags filtered by category ID.
 */
export function getBagsByCategory(categoryId: string): BagWithBusiness[] {
  const allBags = getAllBags();
  return allBags.filter((bag) => bag.category?.id === categoryId);
}

/**
 * Returns a single bag by ID, or undefined if not found.
 */
export function getBagById(id: string): BagWithBusiness | undefined {
  const bags = getMockBags();
  const bag = bags.find((b) => b.id === id);
  if (!bag) return undefined;
  return buildBagWithBusiness(bag) ?? undefined;
}

/**
 * Returns bags from businesses that are in the user's favorites.
 */
export function getFavoriteBags(
  favoriteBusinessIds: Set<string>,
): BagWithBusiness[] {
  const bags = getMockBags();
  return bags
    .filter((bag) => favoriteBusinessIds.has(bag.business_id))
    .map((bag) => buildBagWithBusiness(bag, favoriteBusinessIds))
    .filter((b): b is BagWithBusiness => b !== null);
}

/**
 * Searches bags by query string, matching against bag title, description,
 * business name, or category name.
 */
export function searchBags(query: string): BagWithBusiness[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return getAllBags();

  return getAllBags().filter((bag) => {
    const searchableText = [
      bag.title,
      bag.description,
      bag.business.name,
      bag.business.address,
      bag.category?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

/**
 * Returns a business by ID.
 */
export function getBusinessById(id: string): Business | undefined {
  return MOCK_BUSINESSES.find((b) => b.id === id);
}

/**
 * Returns the mock user's order history with full details (business, bag, payment).
 */
export function getOrderHistory(): OrderWithDetails[] {
  const orders = getMockOrders();
  const payments = getMockPayments();
  const bags = getMockBags();

  return orders
    .map((order) => {
      const bag = bags.find((b) => b.id === order.surplus_bag_id);
      if (!bag) return null;

      const business = MOCK_BUSINESSES.find((b) => b.id === bag.business_id);
      if (!business) return null;

      const payment = payments.find((p) => p.order_id === order.id) ?? null;

      return {
        ...order,
        business,
        bag,
        payment,
      };
    })
    .filter((o): o is OrderWithDetails => o !== null);
}

/**
 * Returns the current mock user profile.
 */
export function getUser(): ConsumerProfile {
  return MOCK_USER;
}
