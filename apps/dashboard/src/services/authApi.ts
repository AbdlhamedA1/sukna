import { apiSlice } from './apiSlice';

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<Envelope<{ user: SessionUser }>, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
    logout: build.mutation<Envelope<never>, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Auth'],
    }),
    me: build.query<Envelope<{ user: SessionUser }>, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
    changePassword: build.mutation<
      Envelope<never>,
      { currentPassword: string; newPassword: string; confirmNewPassword: string }
    >({
      query: (body) => ({ url: '/auth/change-password', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useMeQuery, useChangePasswordMutation } =
  authApi;
