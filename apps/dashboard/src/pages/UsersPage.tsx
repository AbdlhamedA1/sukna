import { App as AntApp, Input, Switch, Table, Tag } from 'antd';
import { useState } from 'react';

import { errMsg, useGetUsersQuery, useSetUserStatusMutation, type UserItem } from '../services/adminApi';

export function UsersPage() {
  const { message } = AntApp.useApp();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isFetching } = useGetUsersQuery({ page, search });
  const [setStatus] = useSetUserStatusMutation();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Users</h1>
          <p className="text-sm text-brand-muted">Deactivating a user signs them out immediately.</p>
        </div>
        <Input.Search placeholder="Search name or email" allowClear className="!w-72 max-w-full" onSearch={(v) => { setSearch(v); setPage(1); }} />
      </div>
      <Table
        rowKey="_id"
        loading={isFetching}
        dataSource={data?.users}
        scroll={{ x: 700 }}
        pagination={{ current: page, pageSize: 20, total: data?.pagination.total, onChange: setPage, showSizeChanger: false }}
        columns={[
          { title: 'Name', dataIndex: 'fullName' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Role', dataIndex: 'role', render: (r: string) => <Tag color={r === 'admin' ? 'purple' : 'blue'}>{r}</Tag> },
          { title: 'Verified', dataIndex: 'isVerified', render: (v: boolean) => (v ? 'Yes' : 'No') },
          {
            title: 'Active',
            render: (_, u: UserItem) => (
              <Switch
                checked={u.isActive}
                onChange={async (checked) => {
                  try {
                    await setStatus({ id: u._id, isActive: checked }).unwrap();
                    message.success(checked ? 'User activated.' : 'User deactivated.');
                  } catch (e) {
                    message.error(errMsg(e, 'Could not change the status.'));
                  }
                }}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
