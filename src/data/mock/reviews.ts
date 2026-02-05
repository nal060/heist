import type { Review } from '../../types';

export const MOCK_REVIEWS: Review[] = [
  // Panaderia Don Pan (biz-001) - 5 reviews
  { id: 'rev-001', user_id: 'user-010', business_id: 'biz-001', rating: 5, created_at: '2025-10-05T14:20:00Z', updated_at: '2025-10-05T14:20:00Z' },
  { id: 'rev-002', user_id: 'user-011', business_id: 'biz-001', rating: 5, created_at: '2025-09-18T09:15:00Z', updated_at: '2025-09-18T09:15:00Z' },
  { id: 'rev-003', user_id: 'user-012', business_id: 'biz-001', rating: 4, created_at: '2025-08-22T16:40:00Z', updated_at: '2025-08-22T16:40:00Z' },
  { id: 'rev-004', user_id: 'user-013', business_id: 'biz-001', rating: 5, created_at: '2025-07-30T11:00:00Z', updated_at: '2025-07-30T11:00:00Z' },
  { id: 'rev-005', user_id: 'user-014', business_id: 'biz-001', rating: 4, created_at: '2025-11-12T08:50:00Z', updated_at: '2025-11-12T08:50:00Z' },

  // Cafe Unido (biz-002) - 4 reviews
  { id: 'rev-006', user_id: 'user-015', business_id: 'biz-002', rating: 5, created_at: '2025-10-10T07:30:00Z', updated_at: '2025-10-10T07:30:00Z' },
  { id: 'rev-007', user_id: 'user-016', business_id: 'biz-002', rating: 4, created_at: '2025-09-25T10:20:00Z', updated_at: '2025-09-25T10:20:00Z' },
  { id: 'rev-008', user_id: 'user-017', business_id: 'biz-002', rating: 5, created_at: '2025-08-14T15:10:00Z', updated_at: '2025-08-14T15:10:00Z' },
  { id: 'rev-009', user_id: 'user-018', business_id: 'biz-002', rating: 4, created_at: '2025-11-01T09:45:00Z', updated_at: '2025-11-01T09:45:00Z' },

  // Super 99 (biz-003) - 4 reviews
  { id: 'rev-010', user_id: 'user-019', business_id: 'biz-003', rating: 4, created_at: '2025-10-20T12:00:00Z', updated_at: '2025-10-20T12:00:00Z' },
  { id: 'rev-011', user_id: 'user-020', business_id: 'biz-003', rating: 3, created_at: '2025-09-15T17:30:00Z', updated_at: '2025-09-15T17:30:00Z' },
  { id: 'rev-012', user_id: 'user-021', business_id: 'biz-003', rating: 4, created_at: '2025-08-28T13:20:00Z', updated_at: '2025-08-28T13:20:00Z' },
  { id: 'rev-013', user_id: 'user-022', business_id: 'biz-003', rating: 5, created_at: '2025-11-05T10:10:00Z', updated_at: '2025-11-05T10:10:00Z' },

  // Athanasiou (biz-004) - 4 reviews
  { id: 'rev-014', user_id: 'user-023', business_id: 'biz-004', rating: 5, created_at: '2025-10-08T19:40:00Z', updated_at: '2025-10-08T19:40:00Z' },
  { id: 'rev-015', user_id: 'user-024', business_id: 'biz-004', rating: 5, created_at: '2025-09-22T20:15:00Z', updated_at: '2025-09-22T20:15:00Z' },
  { id: 'rev-016', user_id: 'user-025', business_id: 'biz-004', rating: 4, created_at: '2025-08-10T14:00:00Z', updated_at: '2025-08-10T14:00:00Z' },
  { id: 'rev-017', user_id: 'user-026', business_id: 'biz-004', rating: 5, created_at: '2025-11-18T21:30:00Z', updated_at: '2025-11-18T21:30:00Z' },

  // New York Bagel Cafe (biz-005) - 3 reviews
  { id: 'rev-018', user_id: 'user-027', business_id: 'biz-005', rating: 4, created_at: '2025-10-15T08:00:00Z', updated_at: '2025-10-15T08:00:00Z' },
  { id: 'rev-019', user_id: 'user-028', business_id: 'biz-005', rating: 5, created_at: '2025-09-30T09:30:00Z', updated_at: '2025-09-30T09:30:00Z' },
  { id: 'rev-020', user_id: 'user-029', business_id: 'biz-005', rating: 4, created_at: '2025-11-08T07:45:00Z', updated_at: '2025-11-08T07:45:00Z' },

  // Mercado de Mariscos (biz-006) - 4 reviews
  { id: 'rev-021', user_id: 'user-030', business_id: 'biz-006', rating: 4, created_at: '2025-10-12T12:30:00Z', updated_at: '2025-10-12T12:30:00Z' },
  { id: 'rev-022', user_id: 'user-031', business_id: 'biz-006', rating: 5, created_at: '2025-09-28T13:00:00Z', updated_at: '2025-09-28T13:00:00Z' },
  { id: 'rev-023', user_id: 'user-032', business_id: 'biz-006', rating: 3, created_at: '2025-08-05T14:15:00Z', updated_at: '2025-08-05T14:15:00Z' },
  { id: 'rev-024', user_id: 'user-033', business_id: 'biz-006', rating: 4, created_at: '2025-11-14T11:50:00Z', updated_at: '2025-11-14T11:50:00Z' },

  // Tantalo Kitchen (biz-007) - 4 reviews
  { id: 'rev-025', user_id: 'user-034', business_id: 'biz-007', rating: 5, created_at: '2025-10-25T20:00:00Z', updated_at: '2025-10-25T20:00:00Z' },
  { id: 'rev-026', user_id: 'user-035', business_id: 'biz-007', rating: 5, created_at: '2025-09-10T21:30:00Z', updated_at: '2025-09-10T21:30:00Z' },
  { id: 'rev-027', user_id: 'user-036', business_id: 'biz-007', rating: 4, created_at: '2025-08-18T19:45:00Z', updated_at: '2025-08-18T19:45:00Z' },
  { id: 'rev-028', user_id: 'user-037', business_id: 'biz-007', rating: 5, created_at: '2025-11-20T22:00:00Z', updated_at: '2025-11-20T22:00:00Z' },

  // Gran Morrison (biz-008) - 3 reviews
  { id: 'rev-029', user_id: 'user-038', business_id: 'biz-008', rating: 4, created_at: '2025-10-03T16:00:00Z', updated_at: '2025-10-03T16:00:00Z' },
  { id: 'rev-030', user_id: 'user-039', business_id: 'biz-008', rating: 3, created_at: '2025-09-20T17:30:00Z', updated_at: '2025-09-20T17:30:00Z' },
  { id: 'rev-031', user_id: 'user-040', business_id: 'biz-008', rating: 4, created_at: '2025-11-02T15:20:00Z', updated_at: '2025-11-02T15:20:00Z' },

  // La Rana Dorada (biz-009) - 2 reviews
  { id: 'rev-032', user_id: 'user-041', business_id: 'biz-009', rating: 5, created_at: '2025-10-18T23:00:00Z', updated_at: '2025-10-18T23:00:00Z' },
  { id: 'rev-033', user_id: 'user-042', business_id: 'biz-009', rating: 4, created_at: '2025-09-05T22:30:00Z', updated_at: '2025-09-05T22:30:00Z' },

  // Crepes & Waffles (biz-010) - 2 reviews
  { id: 'rev-034', user_id: 'user-043', business_id: 'biz-010', rating: 4, created_at: '2025-10-28T13:45:00Z', updated_at: '2025-10-28T13:45:00Z' },
  { id: 'rev-035', user_id: 'user-044', business_id: 'biz-010', rating: 4, created_at: '2025-09-12T14:30:00Z', updated_at: '2025-09-12T14:30:00Z' },
];
