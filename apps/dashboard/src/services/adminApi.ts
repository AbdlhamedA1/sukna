import { apiSlice } from './apiSlice';

export interface AdminStats {
  buildings: number;
  apartments: number;
  published: number;
  pending: number;
  users: number;
  activeOrders: number;
  pendingOrders: number;
  revenue: number;
}

export interface PackageItem {
  _id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  durationDays: number;
  benefits: string[];
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
}
export type PackageBody = Omit<PackageItem, '_id'>;

export interface PaymentItem {
  _id: string;
  amountPaid: number;
  paymentMethod: string;
  externalTransactionRef: string;
  paidAt: string;
}

export interface OrderItem {
  _id: string;
  apartmentId: { _id: string; title: string } | string;
  packageSnapshot: { nameEn: string; price: number; durationDays: number };
  orderStatus: 'pending' | 'active' | 'expired' | 'cancelled';
  paymentStatus: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  payment: PaymentItem | null;
}

export interface UserItem {
  _id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AuditItem {
  _id: string;
  actorId: { fullName: string; email: string } | string | null;
  actorRole: string;
  action: string;
  targetEntity: string;
  ipAddress: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getStats: b.query<AdminStats, void>({
      query: () => '/admin/stats',
      transformResponse: (r: { data: { stats: AdminStats } }) => r.data.stats,
      providesTags: ['Order', 'Apartment', 'User'],
    }),
    getPackages: b.query<PackageItem[], void>({
      query: () => '/monetization/packages/admin/all',
      transformResponse: (r: { data: { packages: PackageItem[] } }) => r.data.packages,
      providesTags: ['Package'],
    }),
    savePackage: b.mutation<void, { id?: string; body: Partial<PackageBody> }>({
      query: ({ id, body }) => ({
        url: id ? `/monetization/packages/${id}` : '/monetization/packages',
        method: id ? 'PUT' : 'POST',
        body,
      }),
      invalidatesTags: ['Package'],
    }),
    getOrders: b.query<OrderItem[], void>({
      query: () => '/monetization/orders',
      transformResponse: (r: { data: { orders: OrderItem[] } }) => r.data.orders,
      providesTags: ['Order'],
    }),
    createOrder: b.mutation<void, { apartmentId: string; packageId: string; adminNotes?: string }>({
      query: (body) => ({ url: '/monetization/orders', method: 'POST', body }),
      invalidatesTags: ['Order'],
    }),
    cancelOrder: b.mutation<void, string>({
      query: (id) => ({ url: `/monetization/orders/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: ['Order'],
    }),
    settleOrder: b.mutation<
      void,
      { id: string; amountPaid: number; paymentMethod: string; externalTransactionRef?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/monetization/orders/${id}/payments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),
    getUsers: b.query<{ users: UserItem[]; pagination: Pagination }, { page: number; search: string }>({
      query: ({ page, search }) => ({ url: '/admin/users', params: { page, search } }),
      transformResponse: (r: { data: { users: UserItem[]; pagination: Pagination } }) => r.data,
      providesTags: ['User'],
    }),
    setUserStatus: b.mutation<void, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/admin/users/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['User'],
    }),
    getAuditLogs: b.query<{ logs: AuditItem[]; pagination: Pagination }, { page: number; action?: string }>({
      query: ({ page, action }) => ({ url: '/admin/audit-logs', params: { page, action } }),
      transformResponse: (r: { data: { logs: AuditItem[]; pagination: Pagination } }) => r.data,
      providesTags: ['Audit'],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetPackagesQuery,
  useSavePackageMutation,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useSettleOrderMutation,
  useGetUsersQuery,
  useSetUserStatusMutation,
  useGetAuditLogsQuery,
} = adminApi;

export function errMsg(e: unknown, fallback: string): string {
  return (e as { data?: { message?: string } })?.data?.message ?? fallback;
}
