import { App, Button, Card, Form, Input, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearSessionUser, selectCurrentUser } from '../features/auth/authSlice';
import { apiSlice } from '../services/apiSlice';
import {
  useChangePasswordMutation,
  useMeQuery,
} from '../services/authApi';

const { Title } = Typography;

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export function AccountPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const storeUser = useAppSelector(selectCurrentUser);
  const { data } = useMeQuery();
  const [changePassword, { isLoading: changing }] = useChangePasswordMutation();
  const { message } = App.useApp();
  const [form] = Form.useForm<PasswordForm>();

  const user = storeUser ?? data?.data.user ?? null;

  async function leave(text: string) {
    dispatch(clearSessionUser());
    dispatch(apiSlice.util.resetApiState());
    message.success(text);
    navigate('/login', { replace: true });
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

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Title level={3} className="!mb-1 !text-brand-primary">Account</Title>
      <p className="mb-6 text-sm text-brand-muted">{user?.fullName} · {user?.email}</p>
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
  );
}
