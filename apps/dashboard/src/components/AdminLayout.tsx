import {
  AimOutlined,
  ApartmentOutlined,
  AuditOutlined,
  DashboardOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  GiftOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { App, Button, Drawer, Grid, Layout, Menu } from 'antd';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../app/hooks';
import { clearSessionUser } from '../features/auth/authSlice';
import { apiSlice } from '../services/apiSlice';
import { useLogoutMutation, useMeQuery } from '../services/authApi';

const ITEMS = [
  { key: '/', icon: <DashboardOutlined />, label: 'Overview' },
  { key: '/buildings', icon: <HomeOutlined />, label: 'Buildings' },
  { key: '/apartments', icon: <ApartmentOutlined />, label: 'Apartments' },
  { key: '/locations', icon: <EnvironmentOutlined />, label: 'Locations' },
  { key: '/landmarks', icon: <AimOutlined />, label: 'Landmarks' },
  { key: '/packages', icon: <GiftOutlined />, label: 'Packages' },
  { key: '/orders', icon: <DollarOutlined />, label: 'Orders' },
  { key: '/users', icon: <TeamOutlined />, label: 'Users' },
  { key: '/audit', icon: <AuditOutlined />, label: 'Audit log' },
  { key: '/account', icon: <UserOutlined />, label: 'Account' },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const { data } = useMeQuery();
  const [logout, { isLoading }] = useLogoutMutation();
  const screens = Grid.useBreakpoint();
  const desktop = !!screens.lg;
  const [open, setOpen] = useState(false);

  const selected = ITEMS.filter((i) => i.key === '/' ? pathname === '/' : pathname.startsWith(i.key)).map((i) => i.key);

  async function onLogout() {
    try {
      await logout().unwrap();
    } finally {
      dispatch(clearSessionUser());
      dispatch(apiSlice.util.resetApiState());
      message.success('Logged out.');
      navigate('/login', { replace: true });
    }
  }

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={selected}
      items={ITEMS}
      onClick={({ key }) => {
        navigate(key);
        setOpen(false);
      }}
      style={{ borderInlineEnd: 0 }}
    />
  );

  return (
    <Layout className="min-h-screen">
      {desktop && (
        <Layout.Sider width={230} theme="light" className="!sticky top-0 h-screen border-r border-brand-border">
          <div className="px-5 py-5"><img src="/logo-header.png" alt="SUKNA Admin" className="h-11 w-auto" /></div>
          {menu}
        </Layout.Sider>
      )}
      <Layout>
        <Layout.Header className="!flex items-center justify-between !bg-white !px-4 border-b border-brand-border">
          <div className="flex items-center gap-3">
            {!desktop && (
              <Button aria-label="Open menu" icon={<MenuOutlined />} onClick={() => setOpen(true)} />
            )}
            {!desktop && <img src="/logo-header.png" alt="SUKNA Admin" className="h-9 w-auto" />}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-brand-muted sm:inline">{data?.data.user.email}</span>
            <Button danger icon={<LogoutOutlined />} loading={isLoading} onClick={onLogout}>
              Log out
            </Button>
          </div>
        </Layout.Header>
        <Layout.Content className="bg-brand-canvas">
          <Outlet />
        </Layout.Content>
      </Layout>
      <Drawer placement="left" open={open} onClose={() => setOpen(false)} width={260} title={<img src="/logo-header.png" alt="SUKNA Admin" className="h-9 w-auto" />} styles={{ body: { padding: 0 } }}>
        {menu}
      </Drawer>
    </Layout>
  );
}
