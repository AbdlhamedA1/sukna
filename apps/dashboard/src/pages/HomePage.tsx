import { Button, Card, Typography, App } from 'antd';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearSessionUser, selectCurrentUser } from '../features/auth/authSlice';
import { useLogoutMutation, useMeQuery } from '../services/authApi';

const { Title, Paragraph } = Typography;

export function HomePage() {
  const dispatch = useAppDispatch();
  const storeUser = useAppSelector(selectCurrentUser);
  const { data } = useMeQuery();
  const [logout, { isLoading }] = useLogoutMutation();
  const { message } = App.useApp();

  const user = storeUser ?? data?.data.user ?? null;

  async function onLogout() {
    try {
      await logout().unwrap();
    } finally {
      dispatch(clearSessionUser());
      message.success('Logged out.');
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-[90%] max-w-container flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl border-brand-border">
        <Title level={2} className="!text-brand-primary">
          SUKNA Dashboard
        </Title>
        {user ? (
          <Paragraph className="!text-brand-muted">
            Signed in as {user.fullName} ({user.email}) — role: {user.role}.
          </Paragraph>
        ) : (
          <Paragraph className="!text-brand-muted">
            Feature modules (buildings, apartments, locations, packages, orders, users, audit)
            arrive with their vertical slices per docs/DEVELOPMENT_ROADMAP.md.
          </Paragraph>
        )}
        {user ? (
          <Button danger onClick={onLogout} loading={isLoading}>
            Log out
          </Button>
        ) : (
          <Button type="primary" href="/login">
            Sign in
          </Button>
        )}
      </Card>
    </main>
  );
}
