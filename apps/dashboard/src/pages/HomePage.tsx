import { App, Button, Card, Form, Input, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearSessionUser, selectCurrentUser } from '../features/auth/authSlice';
import { useGetAdminApartmentsQuery } from '../services/apartmentsApi';
import { apiSlice } from '../services/apiSlice';
import {
  useChangePasswordMutation,
  useLogoutMutation,
  useMeQuery,
} from '../services/authApi';
import { useGetAdminBuildingsQuery } from '../services/buildingsApi';

const { Title, Text } = Typography;

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="border-brand-border">
      <Text type="secondary">{label}</Text>
      <div className="mt-1 text-3xl font-bold text-brand-primary">{value}</div>
    </Card>
  );
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const storeUser = useAppSelector(selectCurrentUser);
  const { data } = useMeQuery();
  const [logout, { isLoading }] = useLogoutMutation();
  const [changePassword, { isLoading: changing }] = useChangePasswordMutation();
  const { data: buildings } = useGetAdminBuildingsQuery();
  const { data: apartments } = useGetAdminApartmentsQuery();
  const { message } = App.useApp();
  const [form] = Form.useForm<PasswordForm>();

  const user = storeUser ?? data?.data.user ?? null;

  async function leave(text: string) {
    dispatch(clearSessionUser());
    dispatch(apiSlice.util.resetApiState());
    message.success(text);
    navigate('/login', { replace: true });
  }

  async function onLogout() {
    try {
      await logout().unwrap();
    } finally {
      await leave('Logged out.');
    }
  }

  async function onChangePassword(values: PasswordForm) {
    try {
      await changePassword(values).unwrap();
      await leave('Password changed. Please sign in again.');
    } catch (error) {
      message.error(
        (error as { data?: { message?: string } })?.data?.message ?? 'Could not change password.',
      );
    }
  }

  const activeBuildings = buildings?.filter((b) => b.isActive && !b.isArchived).length ?? 0;
  const archivedBuildings = buildings?.filter((b) => b.isArchived).length ?? 0;

  return (
    <main className="min-h-screen bg-brand-canvas">
      <header className="border-b border-brand-border bg-white">
        <div className="mx-auto flex w-[92%] max-w-container items-center justify-between py-4">
          <span className="text-xl font-bold text-brand-primary">SUKNA Admin</span>
          <Button danger onClick={onLogout} loading={isLoading}>
            Log out
          </Button>
        </div>
      </header>

      <div className="mx-auto w-[92%] max-w-container py-8">
        <Title level={3} className="!mb-1 !text-brand-primary">
          Welcome back{user ? `, ${user.fullName.split(' ')[0]}` : ''}
        </Title>
        <Text type="secondary">{user?.email}</Text>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Buildings" value={buildings?.length ?? '–'} />
          <Stat label="Active buildings" value={buildings ? activeBuildings : '–'} />
          <Stat label="Archived buildings" value={buildings ? archivedBuildings : '–'} />
          <Stat label="Apartments" value={apartments?.length ?? '–'} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="Manage" className="border-brand-border">
            <div className="flex flex-wrap gap-2">
              <Button type="primary" href="/buildings">Buildings</Button>
              <Button type="primary" href="/apartments">Apartments</Button>
              <Button type="primary" href="/locations">Locations</Button>
            </div>
          </Card>

          <Card title="Change password" className="border-brand-border">
            <Form<PasswordForm> form={form} layout="vertical" onFinish={onChangePassword} requiredMark={false}>
              <Form.Item name="currentPassword" label="Current password" rules={[{ required: true }]}>
                <Input.Password autoComplete="current-password" />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="New password"
                extra="At least 8 characters with upper case, lower case and a number."
                rules={[
                  { required: true },
                  { min: 8 },
                  { pattern: /[a-z]/, message: 'Needs a lowercase letter.' },
                  { pattern: /[A-Z]/, message: 'Needs an uppercase letter.' },
                  { pattern: /[0-9]/, message: 'Needs a number.' },
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Form.Item
                name="confirmNewPassword"
                label="Confirm new password"
                dependencies={['newPassword']}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator: (_, v) =>
                      !v || getFieldValue('newPassword') === v
                        ? Promise.resolve()
                        : Promise.reject(new Error('Passwords do not match.')),
                  }),
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={changing}>
                Update password
              </Button>
            </Form>
          </Card>
        </div>
      </div>
    </main>
  );
}
