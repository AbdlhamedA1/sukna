import { App as AntApp, ConfigProvider, theme as antdTheme } from 'antd';
import type { PropsWithChildren } from 'react';

/**
 * Ant Design brand token wiring — Deep Forest Green / Warm Orange /
 * Warm Off-White / Charcoal with Inter (Cairo reserved for future RTL),
 * per docs/UI_UX_GUIDELINES.md.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#123B35',
          colorInfo: '#205A87',
          colorSuccess: '#226E43',
          colorWarning: '#C77700',
          colorError: '#B92525',
          colorTextBase: '#252B28',
          colorBgLayout: '#F7F5F0',
          colorBgContainer: '#FFFFFF',
          colorBorder: '#E5E2DA',
          fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          borderRadius: 8,
        },
      }}
    >
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
