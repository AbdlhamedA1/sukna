import { PlusOutlined } from '@ant-design/icons';
import { App as AntApp, Button, Form, Input, Modal, Select, Switch, Table, Tag } from 'antd';
import { useState } from 'react';

import {
  errMsg,
  useGetLandmarksQuery,
  useSaveLandmarkMutation,
  type LandmarkItem,
} from '../services/adminApi';

export function LandmarksPage() {
  const { message } = AntApp.useApp();
  const { data = [], isLoading } = useGetLandmarksQuery();
  const [save, { isLoading: saving }] = useSaveLandmarkMutation();
  const [open, setOpen] = useState<LandmarkItem | 'new' | null>(null);
  const [form] = Form.useForm();

  async function onFinish(v: { name: string; type: string; mapsUrl?: string }) {
    try {
      await save({ id: open && open !== 'new' ? open._id : undefined, ...v }).unwrap();
      message.success('Landmark saved.');
      setOpen(null);
    } catch (e) {
      message.error(errMsg(e, 'Could not save the landmark.'));
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Landmarks</h1>
          <p className="text-sm text-brand-muted">
            University gates and other places. Each apartment page shows its distance to the nearest ones. Paste the
            Google Maps link of the exact gate.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setOpen('new');
            form.resetFields();
            form.setFieldsValue({ type: 'university_gate' });
          }}
        >
          Add landmark
        </Button>
      </div>
      <Table
        rowKey="_id"
        loading={isLoading}
        dataSource={data}
        pagination={false}
        scroll={{ x: 500 }}
        locale={{ emptyText: 'No landmarks yet. Add the university gate to show distances on listings.' }}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Type', dataIndex: 'type', render: (t: string) => <Tag>{t === 'university_gate' ? 'University gate' : 'Other'}</Tag> },
          { title: 'Coordinates', render: (_, l: LandmarkItem) => `${l.lat.toFixed(5)}, ${l.lng.toFixed(5)}` },
          {
            title: 'Active',
            render: (_, l: LandmarkItem) => (
              <Switch checked={l.isActive} onChange={(c) => save({ id: l._id, isActive: c })} />
            ),
          },
          {
            title: '',
            render: (_, l: LandmarkItem) => (
              <Button
                onClick={() => {
                  setOpen(l);
                  form.setFieldsValue({ name: l.name, type: l.type, mapsUrl: undefined });
                }}
              >
                Edit
              </Button>
            ),
          },
        ]}
      />
      <Modal
        title={open === 'new' ? 'Add landmark' : 'Edit landmark'}
        open={!!open}
        onCancel={() => setOpen(null)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="Save"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="name" label="Name" rules={[{ required: true, min: 3 }]}>
            <Input placeholder="South Valley University, main gate" />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select options={[{ value: 'university_gate', label: 'University gate' }, { value: 'other', label: 'Other' }]} />
          </Form.Item>
          <Form.Item
            name="mapsUrl"
            label="Google Maps link"
            extra={open === 'new' ? undefined : 'Leave empty to keep the current location.'}
            rules={[{ required: open === 'new', type: 'url' }]}
          >
            <Input placeholder="https://maps.app.goo.gl/..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
