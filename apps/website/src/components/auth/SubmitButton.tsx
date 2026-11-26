'use client';

import { Button } from 'antd';

interface SubmitButtonProps {
  loading: boolean;
  children: React.ReactNode;
}

export function SubmitButton({ loading, children }: SubmitButtonProps) {
  return (
    <Button type="primary" htmlType="submit" size="large" block loading={loading}>
      {children}
    </Button>
  );
}
