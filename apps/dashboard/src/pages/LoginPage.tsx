import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, App } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../app/hooks';
import { setSessionUser } from '../features/auth/authSlice';
import { useLoginMutation } from '../services/authApi';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { message } = App.useApp();

  async function onFinish(values: LoginFormValues) {
    try {
      const result = await login(values).unwrap();
      dispatch(setSessionUser(result.data.user));
      message.success('Logged in successfully.');
      navigate('/', { replace: true });
    } catch (error) {
      const apiMessage =
        (error as { data?: { message?: string } })?.data?.message ??
        'Login failed. Check your credentials.';
      message.error(apiMessage);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-canvas px-4">
      <Card className="w-full max-w-md border-brand-border">
        <Title level={3} className="!text-brand-primary">
          SUKNA Dashboard
        </Title>
        <Text type="secondary">Sign in with your SUKNA account.</Text>
        <Form<LoginFormValues> layout="vertical" onFinish={onFinish} className="mt-6" requiredMark={false}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Enter a valid email.' }]}
          >
            <Input prefix={<MailOutlined />} size="large" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Enter your password.' }]}
          >
            <Input.Password prefix={<LockOutlined />} size="large" placeholder="Password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
            Sign in
          </Button>
        </Form>
      </Card>
    </main>
  );
}
