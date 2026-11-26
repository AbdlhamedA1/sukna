import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, App } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../app/hooks';
import { setSessionUser } from '../features/auth/authSlice';
import {
  useForgotPasswordMutation,
  useLoginMutation,
  useResetPasswordMutation,
  useVerifyResetCodeMutation,
} from '../services/authApi';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

type Step = 'login' | 'email' | 'code' | 'password';

export function LoginPage() {
  const [step, setStep] = useState<Step>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [forgot, { isLoading: sending }] = useForgotPasswordMutation();
  const [verifyCode, { isLoading: verifying }] = useVerifyResetCodeMutation();
  const [resetPw, { isLoading: resetting }] = useResetPasswordMutation();
  const errMsg = (e: unknown, fb: string) => (e as { data?: { message?: string } })?.data?.message ?? fb;

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

  async function onEmail(v: { email: string }) {
    try {
      await forgot(v).unwrap();
      setResetEmail(v.email.trim().toLowerCase());
      setStep('code');
      message.success('If this email is registered, a reset code was sent.');
    } catch (e) {
      message.error(errMsg(e, 'Could not send the code.'));
    }
  }

  async function onCode(v: { code: string }) {
    try {
      const r = await verifyCode({ email: resetEmail, code: v.code }).unwrap();
      setResetToken(r.data.resetToken);
      setStep('password');
    } catch (e) {
      message.error(errMsg(e, 'That code did not work.'));
    }
  }

  async function onNewPassword(v: { newPassword: string; confirmNewPassword: string }) {
    try {
      await resetPw({ email: resetEmail, resetToken, ...v }).unwrap();
      message.success('Password reset. Sign in with your new password.');
      setStep('login');
    } catch (e) {
      message.error(errMsg(e, 'Could not reset the password.'));
    }
  }

  if (step !== 'login') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-canvas px-4">
        <Card className="w-full max-w-md border-brand-border">
          <Title level={3} className="!text-brand-primary">Reset password</Title>
          {step === 'email' && (
            <Form layout="vertical" onFinish={onEmail} requiredMark={false} className="mt-4">
              <Text type="secondary">We will email you a 6-digit code.</Text>
              <Form.Item name="email" label="Email" className="mt-4" rules={[{ required: true, type: 'email' }]}>
                <Input size="large" prefix={<MailOutlined />} />
              </Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={sending}>Send code</Button>
            </Form>
          )}
          {step === 'code' && (
            <Form layout="vertical" onFinish={onCode} requiredMark={false} className="mt-4">
              <Text type="secondary">Enter the 6-digit code sent to {resetEmail}.</Text>
              <Form.Item name="code" label="Code" className="mt-4" rules={[{ required: true, len: 6, message: 'Enter the 6-digit code.' }]}>
                <Input size="large" maxLength={6} inputMode="numeric" />
              </Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={verifying}>Verify code</Button>
            </Form>
          )}
          {step === 'password' && (
            <Form layout="vertical" onFinish={onNewPassword} requiredMark={false} className="mt-4">
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
                <Input.Password size="large" />
              </Form.Item>
              <Form.Item
                name="confirmNewPassword"
                label="Confirm new password"
                dependencies={['newPassword']}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator: (_, x) =>
                      !x || getFieldValue('newPassword') === x
                        ? Promise.resolve()
                        : Promise.reject(new Error('Passwords do not match.')),
                  }),
                ]}
              >
                <Input.Password size="large" />
              </Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={resetting}>Reset password</Button>
            </Form>
          )}
          <Button type="link" className="mt-3 !px-0" onClick={() => setStep('login')}>Back to sign in</Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-canvas px-4">
      <Card className="w-full max-w-md border-brand-border">
        <Title level={3} className="!text-brand-primary">
          SUKNA Dashboard
        </Title>
        <Text type="secondary">Administrator sign in.</Text>
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
          <Button type="link" block className="mt-2" onClick={() => setStep('email')}>
            Forgot your password?
          </Button>
        </Form>
      </Card>
    </main>
  );
}
