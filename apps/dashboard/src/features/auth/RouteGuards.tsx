import { Spin } from 'antd';
import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useMeQuery } from '../../services/authApi';

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spin size="large" />
    </div>
  );
}

/** Requires an authenticated session (any role). */
export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const { data, isLoading, isError } = useMeQuery();

  if (isLoading) return <FullPageSpinner />;
  if (isError || !data?.data.user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

/** Requires an authenticated administrator session (HTTP 403 semantics). */
export function AdminRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const { data, isLoading, isError } = useMeQuery();

  if (isLoading) return <FullPageSpinner />;
  const user = data?.data.user;
  if (isError || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}
