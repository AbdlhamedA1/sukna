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
    forgotPassword: build.mutation<Envelope<never>, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    verifyResetCode: build.mutation<
      Envelope<{ resetToken: string }>,
      { email: string; code: string }
    >({
      query: (body) => ({ url: '/auth/verify-reset-code', method: 'POST', body }),
    }),
    resetPassword: build.mutation<
      Envelope<never>,
      { email: string; resetToken: string; newPassword: string; confirmNewPassword: string }
    >({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
  }),
});

export const {
  useForgotPasswordMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
  useLoginMutation, useLogoutMutation, useMeQuery, useChangePasswordMutation } =
  authApi;
