import { PlusOutlined } from '@ant-design/icons';
import { App as AntApp, Button, Form, Input, InputNumber, Modal, Select, Switch, Table, Tag } from 'antd';
import { useState } from 'react';

import {
  errMsg,
  useGetPackagesQuery,
  useSavePackageMutation,
  type PackageItem,
} from '../services/adminApi';

export function PackagesPage() {
  const { message } = AntApp.useApp();
  const { data = [], isLoading } = useGetPackagesQuery();
  const [save, { isLoading: saving }] = useSavePackageMutation();
  const [editing, setEditing] = useState<PackageItem | 'new' | null>(null);
  const [form] = Form.useForm();

  function openModal(p: PackageItem | 'new') {
    setEditing(p);
    form.resetFields();
    if (p !== 'new') form.setFieldsValue(p);
    else form.setFieldsValue({ isActive: true, isFeatured: false, displayOrder: 0, benefits: [] });
  }

  async function onFinish(values: Record<string, unknown>) {
    try {
      await save({ id: editing !== 'new' && editing ? editing._id : undefined, body: values }).unwrap();
      message.success('Package saved. Existing orders keep their original price.');
      setEditing(null);
    } catch (e) {
      message.error(errMsg(e, 'Could not save the package.'));
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Advertising packages</h1>
          <p className="text-sm text-brand-muted">
            Prices here are placeholders until you set real ones. Changing a price never alters existing orders.
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('new')}>
          New package
        </Button>
      </div>
      <Table
        rowKey="_id"
        loading={isLoading}
        dataSource={data}
        scroll={{ x: 700 }}
        pagination={false}
        columns={[
          { title: 'Name', dataIndex: 'nameEn' },
          { title: 'Arabic name', dataIndex: 'nameAr' },
          { title: 'Price (EGP)', dataIndex: 'price' },
          { title: 'Days', dataIndex: 'durationDays' },
          {
            title: 'Status',
            render: (_, p: PackageItem) => (
              <>
                <Tag color={p.isActive ? 'green' : 'default'}>{p.isActive ? 'Active' : 'Hidden'}</Tag>
                {p.isFeatured && <Tag color="gold">Highlighted</Tag>}
              </>
            ),
          },
          {
            title: '',
            render: (_, p: PackageItem) => <Button onClick={() => openModal(p)}>Edit</Button>,
          },
        ]}
      />
      <Modal
        title={editing === 'new' ? 'New package' : 'Edit package'}
        open={!!editing}
        onCancel={() => setEditing(null)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="Save"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="nameEn" label="Name (English)" rules={[{ required: true, min: 3 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nameAr" label="Name (Arabic)" rules={[{ required: true, min: 3 }]}>
            <Input dir="rtl" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="price" label="Price (EGP)" rules={[{ required: true }]}>
              <InputNumber min={0} className="!w-full" />
            </Form.Item>
            <Form.Item name="durationDays" label="Duration (days)" rules={[{ required: true }]}>
              <InputNumber min={1} max={365} precision={0} className="!w-full" />
            </Form.Item>
          </div>
          <Form.Item name="benefits" label="Benefits (type and press Enter)">
            <Select mode="tags" open={false} tokenSeparators={[',']} />
          </Form.Item>
          <div className="flex gap-6">
            <Form.Item name="isActive" label="Visible" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isFeatured" label="Highlighted" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="displayOrder" label="Order">
              <InputNumber precision={0} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
