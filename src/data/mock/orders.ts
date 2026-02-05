import type { Order, Payment } from '../../types';

/** Returns a date string N days ago */
const daysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

export const getMockOrders = (): Order[] => {
  return [
    // Order 1: picked_up - Panaderia Don Pan
    {
      id: 'order-001',
      user_id: 'user-001',
      surplus_bag_id: 'bag-001',
      quantity: 1,
      total_price: 3.99,
      pickup_code: 'HE-4829',
      pickup_start_time: '17:00',
      pickup_end_time: '19:00',
      pickup_date: daysAgo(3),
      status: 'picked_up',
      reserved_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      collected_at: new Date(Date.now() - 3 * 86400000 + 7200000).toISOString(),
      cancelled_at: null,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000 + 7200000).toISOString(),
    },

    // Order 2: confirmed - Tantalo Kitchen (upcoming pickup today)
    {
      id: 'order-002',
      user_id: 'user-001',
      surplus_bag_id: 'bag-013',
      quantity: 1,
      total_price: 10.99,
      pickup_code: 'HE-7156',
      pickup_start_time: '14:30',
      pickup_end_time: '16:00',
      pickup_date: daysAgo(0),
      status: 'confirmed',
      reserved_at: new Date(Date.now() - 3600000).toISOString(),
      collected_at: null,
      cancelled_at: null,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
    },

    // Order 3: cancelled - Mercado de Mariscos
    {
      id: 'order-003',
      user_id: 'user-001',
      surplus_bag_id: 'bag-011',
      quantity: 1,
      total_price: 6.49,
      pickup_code: 'HE-3041',
      pickup_start_time: '13:00',
      pickup_end_time: '15:00',
      pickup_date: daysAgo(5),
      status: 'cancelled',
      reserved_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      collected_at: null,
      cancelled_at: new Date(Date.now() - 5 * 86400000 + 3600000).toISOString(),
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000 + 3600000).toISOString(),
    },

    // Order 4: pending - Cafe Unido (just placed)
    {
      id: 'order-004',
      user_id: 'user-001',
      surplus_bag_id: 'bag-003',
      quantity: 2,
      total_price: 11.98,
      pickup_code: 'HE-9283',
      pickup_start_time: '16:00',
      pickup_end_time: '18:00',
      pickup_date: daysAgo(0),
      status: 'pending',
      reserved_at: new Date(Date.now() - 600000).toISOString(),
      collected_at: null,
      cancelled_at: null,
      created_at: new Date(Date.now() - 600000).toISOString(),
      updated_at: new Date(Date.now() - 600000).toISOString(),
    },
  ];
};

export const getMockPayments = (): Payment[] => {
  return [
    {
      id: 'pay-001',
      order_id: 'order-001',
      total: 3.99,
      subtotal: 3.56,
      payment_method: 'credit_card',
      payment_status: 'completed',
      payment_id: 'pi_3PxRz1ABC123def456',
      paid_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      breakdown: { subtotal: 3.56, tax: 0.43, discount: 0 },
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'pay-002',
      order_id: 'order-002',
      total: 10.99,
      subtotal: 9.81,
      payment_method: 'credit_card',
      payment_status: 'completed',
      payment_id: 'pi_3PxSa2DEF789ghi012',
      paid_at: new Date(Date.now() - 3600000).toISOString(),
      breakdown: { subtotal: 9.81, tax: 1.18, discount: 0 },
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'pay-003',
      order_id: 'order-003',
      total: 6.49,
      subtotal: 5.79,
      payment_method: 'debit_card',
      payment_status: 'refunded',
      payment_id: 'pi_3PxTb3GHI345jkl678',
      paid_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      breakdown: { subtotal: 5.79, tax: 0.70, discount: 0 },
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'pay-004',
      order_id: 'order-004',
      total: 11.98,
      subtotal: 10.70,
      payment_method: 'credit_card',
      payment_status: 'completed',
      payment_id: 'pi_3PxUc4JKL901mno234',
      paid_at: new Date(Date.now() - 600000).toISOString(),
      breakdown: { subtotal: 10.70, tax: 1.28, discount: 0 },
      created_at: new Date(Date.now() - 600000).toISOString(),
    },
  ];
};

export const MOCK_ORDERS: Order[] = getMockOrders();
export const MOCK_PAYMENTS: Payment[] = getMockPayments();
