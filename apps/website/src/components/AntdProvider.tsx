'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import type { PropsWithChildren } from 'react';

export function AntdProvider({ children }: PropsWithChildren) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#E88A35',
            colorText: '#252B28',
            colorBorder: '#E5E2DA',
            borderRadius: 8,
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
