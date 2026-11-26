import { Card, Skeleton, Typography } from 'antd';
import { Link } from 'react-router-dom';

import { useMeQuery } from '../services/authApi';
import { useGetStatsQuery } from '../services/adminApi';

const { Title, Text } = Typography;

function Stat({ label, value, to, hint }: { label: string; value: string | number; to: string; hint?: string }) {
  return (
    <Link to={to}>
      <Card hoverable className="h-full border-brand-border">
        <Text type="secondary">{label}</Text>
        <div className="mt-1 text-3xl font-bold text-brand-primary">{value}</div>
        {hint && <div className="mt-1 text-xs text-brand-muted">{hint}</div>}
      </Card>
    </Link>
  );
}

export function HomePage() {
  const { data: me } = useMeQuery();
  const { data: s, isLoading } = useGetStatsQuery();
  const name = me?.data.user.fullName.split(' ')[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Title level={3} className="!mb-1 !text-brand-primary">
        Welcome back{name ? `, ${name}` : ''}
      </Title>
      <Text type="secondary">Here is how SUKNA is doing right now.</Text>
      {isLoading || !s ? (
        <Skeleton active className="mt-6" />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Buildings" value={s.buildings} to="/buildings" />
          <Stat label="Apartments" value={s.apartments} to="/apartments" hint={`${s.published} published`} />
          <Stat label="Waiting for review" value={s.pending} to="/apartments" />
          <Stat label="Registered users" value={s.users} to="/users" />
          <Stat label="Active ads" value={s.activeOrders} to="/orders" />
          <Stat label="Orders to settle" value={s.pendingOrders} to="/orders" />
          <Stat label="Revenue (EGP)" value={s.revenue.toLocaleString()} to="/orders" />
        </div>
      )}
    </div>
  );
}
