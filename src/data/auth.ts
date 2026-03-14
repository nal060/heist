import { supabase } from '../lib/supabase';
import type {
  Business,
  ConsumerProfile,
  Category,
  UserPreference,
  PreferenceType,
  BagPickupSchedule,
  BagSizeType,
} from '../types';

export type UserRole = 'consumer' | 'business';

let cachedPanamaId: string | null = null;

async function getPanamaCountryId(): Promise<string> {
  if (cachedPanamaId) return cachedPanamaId;
  const { data, error } = await supabase
    .from('countries')
    .select('id')
    .eq('code', 'PA')
    .single();
  if (error || !data) throw new Error('Could not find Panama country record');
  cachedPanamaId = data.id;
  return data.id;
}

interface UserRoleResult {
  role: UserRole | null;
  profile: ConsumerProfile | Business | null;
}

export async function getUserRole(userId: string): Promise<UserRoleResult> {
  const { data: consumer } = await supabase
    .from('consumer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (consumer) {
    return { role: 'consumer', profile: consumer };
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (business) {
    return { role: 'business', profile: business };
  }

  return { role: null, profile: null };
}

// --- Consumer Profile ---

export async function createConsumerProfile(
  userId: string,
  name: string,
): Promise<ConsumerProfile> {
  const countryId = await getPanamaCountryId();
  const { data, error } = await supabase
    .from('consumer_profiles')
    .insert({ user_id: userId, name, country_id: 'pa' })
    .select()
    .single();

  if (error) throw new Error(`Error al crear perfil: ${error.message}`);
  return data;
}

// --- User Preferences ---

export async function saveUserPreference(
  userId: string,
  preferenceType: PreferenceType,
  values: string[],
): Promise<UserPreference> {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        preference_type: preferenceType,
        preference_values: values,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,preference_type' },
    )
    .select()
    .single();

  if (error) throw new Error(`Error al guardar preferencias: ${error.message}`);
  return data;
}

export async function getUserPreferences(userId: string): Promise<UserPreference[]> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(`Error al obtener preferencias: ${error.message}`);
  return data;
}

// --- Business ---

interface CreateBusinessInput {
  userId: string;
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  photoUrl?: string;
  googlePlaceId?: string;
}

export async function createBusiness(input: CreateBusinessInput): Promise<Business> {
  const { data, error } = await supabase
    .from('businesses')
    .insert({
      user_id: input.userId,
      name: input.name,
      description: input.description || null,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      phone: input.phone || null,
      photo_url: input.photoUrl || null,
      country_id: 'pa',
      google_place_id: input.googlePlaceId || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Error al crear negocio: ${error.message}`);
  return data;
}

export async function updateBusiness(
  businessId: string,
  updates: Partial<Pick<Business, 'name' | 'description' | 'address' | 'phone' | 'latitude' | 'longitude' | 'photo_url'>>,
): Promise<Business> {
  const { data, error } = await supabase
    .from('businesses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', businessId)
    .select()
    .single();

  if (error) throw new Error(`Error al actualizar negocio: ${error.message}`);
  return data;
}

export async function getBusinessForUser(userId: string): Promise<Business | null> {
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data;
}

// --- Categories ---

export async function setBusinessCategory(
  businessId: string,
  categoryId: string,
): Promise<void> {
  const { error } = await supabase
    .from('business_categories')
    .insert({ business_id: businessId, category_id: categoryId });

  if (error) throw new Error(`Error al asignar categoria: ${error.message}`);
}

export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw new Error(`Error al obtener categorias: ${error.message}`);
  return data;
}

// --- Surplus Bags (enhanced) ---

interface CreateBagInput {
  businessId: string;
  title: string;
  description?: string;
  originalPrice: number;
  discountedPrice: number;
  value?: number;
  bagSize?: BagSizeType;
  quantityTotal: number;
  pickupStartTime: string;
  pickupEndTime: string;
  status?: string;
}

export async function createSurplusBag(input: CreateBagInput) {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('surplus_bags')
    .insert({
      business_id: input.businessId,
      title: input.title,
      description: input.description || null,
      original_price: input.originalPrice,
      discounted_price: input.discountedPrice,
      value: input.value || input.originalPrice,
      bag_size: input.bagSize || 'medium',
      quantity_total: input.quantityTotal,
      quantity_available: input.quantityTotal,
      date: today,
      pickup_start_time: input.pickupStartTime,
      pickup_end_time: input.pickupEndTime,
      status: input.status || 'active',
    })
    .select()
    .single();

  if (error) throw new Error(`Error al crear bolsa: ${error.message}`);
  return data;
}

export async function updateSurplusBag(
  bagId: string,
  updates: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from('surplus_bags')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', bagId)
    .select()
    .single();

  if (error) throw new Error(`Error al actualizar bolsa: ${error.message}`);
  return data;
}

// --- Bag Pickup Schedule ---

interface ScheduleEntry {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export async function saveBagSchedule(
  bagId: string,
  schedule: ScheduleEntry[],
): Promise<BagPickupSchedule[]> {
  // Delete existing schedule for this bag first
  await supabase.from('bag_pickup_schedule').delete().eq('bag_id', bagId);

  const rows = schedule
    .filter((s) => s.isActive)
    .map((s) => ({
      bag_id: bagId,
      day_of_week: s.dayOfWeek,
      start_time: s.startTime,
      end_time: s.endTime,
      is_active: true,
    }));

  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from('bag_pickup_schedule')
    .insert(rows)
    .select();

  if (error) throw new Error(`Error al guardar horario: ${error.message}`);
  return data;
}

export async function getBagSchedule(bagId: string): Promise<BagPickupSchedule[]> {
  const { data, error } = await supabase
    .from('bag_pickup_schedule')
    .select('*')
    .eq('bag_id', bagId)
    .order('day_of_week');

  if (error) throw new Error(`Error al obtener horario: ${error.message}`);
  return data;
}

// --- Business Photos ---

export async function saveBusinessPhotos(
  businessId: string,
  photos: { url: string; source: string; isSelected: boolean; order: number }[],
) {
  const rows = photos.map((p) => ({
    business_id: businessId,
    photo_url: p.url,
    source: p.source,
    is_selected: p.isSelected,
    display_order: p.order,
  }));

  const { data, error } = await supabase
    .from('business_photos')
    .insert(rows)
    .select();

  if (error) throw new Error(`Error al guardar fotos: ${error.message}`);
  return data;
}

export async function getBusinessPhotos(businessId: string) {
  const { data, error } = await supabase
    .from('business_photos')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_selected', true)
    .order('display_order');

  if (error) throw new Error(`Error al obtener fotos: ${error.message}`);
  return data;
}

// --- Bag Photos ---

export async function uploadBagPhoto(
  bagId: string,
  uri: string,
  displayOrder: number,
): Promise<string> {
  const ext = uri.split('.').pop() ?? 'jpg';
  const fileName = `${bagId}/${Date.now()}.${ext}`;
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('bag-photos')
    .upload(fileName, blob, { contentType: `image/${ext}`, upsert: false });

  if (uploadError) throw new Error(`Error al subir foto: ${uploadError.message}`);

  const { data: urlData } = supabase.storage
    .from('bag-photos')
    .getPublicUrl(fileName);

  const photoUrl = urlData.publicUrl;

  const { error: dbError } = await supabase
    .from('bag_photos')
    .insert({
      bag_id: bagId,
      photo_url: photoUrl,
      display_order: displayOrder,
    });

  if (dbError) throw new Error(`Error al guardar foto: ${dbError.message}`);
  return photoUrl;
}

export async function deleteBagPhoto(photoId: string, photoUrl: string): Promise<void> {
  // Extract file path from URL
  const match = photoUrl.match(/bag-photos\/(.+)$/);
  if (match) {
    await supabase.storage.from('bag-photos').remove([match[1]]);
  }

  const { error } = await supabase
    .from('bag_photos')
    .delete()
    .eq('id', photoId);

  if (error) throw new Error(`Error al eliminar foto: ${error.message}`);
}

export async function getBagPhotos(bagId: string) {
  const { data, error } = await supabase
    .from('bag_photos')
    .select('*')
    .eq('bag_id', bagId)
    .order('display_order');

  if (error) throw new Error(`Error al obtener fotos: ${error.message}`);
  return data;
}
