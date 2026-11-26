import { Select, Table } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

import { useGetAuditLogsQuery, type AuditItem } from '../services/adminApi';

const ACTIONS = [
  'PROPERTY_CREATED', 'PROPERTY_UPDATED', 'LISTING_PUBLISHED', 'LISTING_UNPUBLISHED', 'LISTING_REJECTED',
  'PROPERTY_ARCHIVED', 'PROPERTY_SOFT_DELETED', 'LOCATION_TIER_CREATED', 'LOCATION_TIER_UPDATED',
  'LOCATION_TIER_TOGGLED', 'PAYMENT_CONFIRMED', 'ADVERTISING_ORDER_CREATED', 'ADVERTISING_ORDER_CANCELLED',
  'USER_ACTIVATED', 'USER_DEACTIVATED', 'CONTACT_INFO_REVEALED',
];

export function AuditPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<string | undefined>();
  const { data, isFetching } = useGetAuditLogsQuery({ page, action });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Audit log</h1>
          <p className="text-sm text-brand-muted">Who did what, and when. Read only.</p>
        </div>
        <Select
          allowClear
          placeholder="Filter by action"
          className="!w-64 max-w-full"
          options={ACTIONS.map((a) => ({ value: a, label: a.replace(/_/g, ' ').toLowerCase() }))}
          onChange={(v) => { setAction(v); setPage(1); }}
        />
      </div>
      <Table
        rowKey="_id"
        loading={isFetching}
        dataSource={data?.logs}
        scroll={{ x: 700 }}
        pagination={{ current: page, pageSize: 25, total: data?.pagination.total, onChange: setPage, showSizeChanger: false }}
        columns={[
          { title: 'When', dataIndex: 'createdAt', render: (d: string) => dayjs(d).format('DD MMM YYYY HH:mm') },
          { title: 'Actor', render: (_, l: AuditItem) => (l.actorId && typeof l.actorId === 'object' ? l.actorId.email : l.actorRole) },
          { title: 'Action', dataIndex: 'action', render: (a: string) => a.replace(/_/g, ' ').toLowerCase() },
          { title: 'Target', dataIndex: 'targetEntity' },
          { title: 'IP', dataIndex: 'ipAddress' },
        ]}
      />
    </div>
  );
}
