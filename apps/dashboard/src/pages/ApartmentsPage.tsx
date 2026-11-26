import { PlusOutlined } from '@ant-design/icons';
import {
  App as AntApp,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag, Image } from 'antd';
import { useState } from 'react';

import {
  useCreateApartmentMutation,
  useDeleteApartmentMutation,
  useGetAdminApartmentsQuery,
  useUpdateApartmentAvailabilityMutation,
  useUpdateApartmentStatusMutation,
  type ApartmentAdminItem,
  type ListingStatus,
} from '../services/apartmentsApi';
import { useGetAdminBuildingsQuery } from '../services/buildingsApi';

const STATUS_COLOR: Record<ListingStatus, string> = {
  pending: 'gold',
  published: 'green',
  rejected: 'red',
  unpublished: 'default',
};

export function ApartmentsPage() {
  const { message } = AntApp.useApp();
  const [statusFilter, setStatusFilter] = useState<ListingStatus | undefined>(undefined);
  const { data: apartments = [], isLoading } = useGetAdminApartmentsQuery(statusFilter);
  const { data: buildings = [] } = useGetAdminBuildingsQuery();
  const [createApartment, { isLoading: creating }] = useCreateApartmentMutation();
  const [updateStatus] = useUpdateApartmentStatusMutation();
  const [updateAvailability] = useUpdateApartmentAvailabilityMutation();
  const [deleteApartment] = useDeleteApartmentMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  async function setStatus(id: string, listingStatus: ListingStatus, rejectionReason = '') {
    try {
      await updateStatus({ id, listingStatus, rejectionReason }).unwrap();
      message.success(`Listing ${listingStatus}.`);
    } catch {
      message.error('Status update failed.');
    }
  }

  async function onCreate(values: Record<string, unknown>) {
    const imageLines = String(values.images ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await createApartment({
        buildingId: String(values.buildingId),
        title: String(values.title),
        description: String(values.description),
        rentalPrice: Number(values.rentalPrice),
        rentalType: values.rentalType as ApartmentAdminItem['rentalType'],
        bedrooms: Number(values.bedrooms),
        bathrooms: Number(values.bathrooms),
        floor: Number(values.floor),
        furnishedStatus: values.furnishedStatus as ApartmentAdminItem['furnishedStatus'],
        images: imageLines,
        imagePublicIds: imageLines.map(() => 'manual'),
        ownerName: String(values.ownerName),
        ownerPhone: String(values.ownerPhone),
      }).unwrap();
      message.success('Apartment created (pending publication).');
      setModalOpen(false);
      form.resetFields();
    } catch {
      message.error('Could not create the apartment. Check the fields.');
    }
  }

  const columns = [
    {
      title: 'Listing',
      key: 'title',
      render: (_: unknown, a: ApartmentAdminItem) => (
        <div className="flex items-center gap-3">
          {a.images[0] ? (
            <Image src={a.images[0]} alt="" width={56} height={40} className="rounded object-cover" style={{ objectFit: 'cover', borderRadius: 4 }} />
          ) : null}
          <div>
            <div className="font-semibold">{a.title}</div>
            <div className="text-xs text-brand-muted">
              {a.buildingId?.name} - EGP {a.rentalPrice.toLocaleString()}/mo
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Specs',
      key: 'specs',
      render: (_: unknown, a: ApartmentAdminItem) =>
        `${a.bedrooms} bd / ${a.bathrooms} ba / floor ${a.floor}`,
    },
    {
      title: 'Owner',
      key: 'owner',
      render: (_: unknown, a: ApartmentAdminItem) => (
        <div>
          <div>{a.ownerName}</div>
          <div className="text-xs text-brand-muted" dir="ltr">
            {a.ownerPhone}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, a: ApartmentAdminItem) => (
        <div className="flex flex-col gap-1">
          <Tag color={STATUS_COLOR[a.listingStatus]}>{a.listingStatus}</Tag>
          <Tag color={a.availabilityStatus === 'available' ? 'blue' : 'purple'}>
            {a.availabilityStatus}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, a: ApartmentAdminItem) => (
        <div className="flex flex-wrap gap-2">
          {a.listingStatus !== 'published' && (
            <Button size="small" type="primary" onClick={() => setStatus(a._id, 'published')}>
              Publish
            </Button>
          )}
          {a.listingStatus === 'published' && (
            <Button size="small" onClick={() => setStatus(a._id, 'unpublished')}>
              Unpublish
            </Button>
          )}
          {a.listingStatus === 'pending' && (
            <Popconfirm
              title="Reject this listing?"
              onConfirm={() => setStatus(a._id, 'rejected', 'Rejected by admin review.')}
            >
              <Button size="small" danger>
                Reject
              </Button>
            </Popconfirm>
          )}
          <Button
            size="small"
            onClick={() =>
              updateAvailability({
                id: a._id,
                availabilityStatus: a.availabilityStatus === 'available' ? 'rented' : 'available',
              })
                .unwrap()
                .then(() => message.success('Availability updated.'))
                .catch(() => message.error('Availability update failed.'))
            }
          >
            Mark {a.availabilityStatus === 'available' ? 'rented' : 'available'}
          </Button>
          <Popconfirm
            title="Delete this apartment?"
            onConfirm={() =>
              deleteApartment(a._id)
                .unwrap()
                .then(() => message.success('Apartment deleted.'))
                .catch(() => message.error('Delete failed.'))
            }
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <main className="mx-auto min-h-screen w-[95%] max-w-container px-4 py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-primary">Apartments</h1>
        <div className="flex gap-2">
          <Select
            allowClear
            placeholder="All statuses"
            style={{ minWidth: 160 }}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            options={(['pending', 'published', 'rejected', 'unpublished'] as const).map((s) => ({
              value: s,
              label: s,
            }))}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Add apartment
          </Button>
        </div>
      </div>
      <Table
        rowKey="_id"
        loading={isLoading}
        dataSource={apartments}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />

      <Modal
        title="Add apartment"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={creating}
        okText="Create"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onCreate} preserve={false}>
          <Form.Item name="buildingId" label="Building" rules={[{ required: true }]}>
            <Select
              options={buildings.map((b) => ({ value: b._id, label: b.name }))}
              placeholder="Select building"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true, min: 5 }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, min: 20 }]}
          >
            <Input.TextArea rows={3} maxLength={3000} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="rentalPrice" label="Price (EGP/mo)" rules={[{ required: true }]}>
              <InputNumber min={100} max={500000} className="w-full" />
            </Form.Item>
            <Form.Item
              name="rentalType"
              label="Rental type"
              initialValue="entire"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'entire', label: 'Entire place' },
                  { value: 'shared', label: 'Shared' },
                  { value: 'private_room', label: 'Private room' },
                ]}
              />
            </Form.Item>
            <Form.Item name="bedrooms" label="Bedrooms" rules={[{ required: true }]}>
              <InputNumber min={1} max={15} className="w-full" />
            </Form.Item>
            <Form.Item name="bathrooms" label="Bathrooms" rules={[{ required: true }]}>
              <InputNumber min={1} max={10} className="w-full" />
            </Form.Item>
            <Form.Item name="floor" label="Floor" rules={[{ required: true }]}>
              <InputNumber min={-2} max={50} className="w-full" />
            </Form.Item>
            <Form.Item
              name="furnishedStatus"
              label="Furnished"
              initialValue="unfurnished"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'furnished', label: 'Furnished' },
                  { value: 'semi_furnished', label: 'Semi-furnished' },
                  { value: 'unfurnished', label: 'Unfurnished' },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item
            name="images"
            label="Image URLs (one per line)"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} placeholder="https://..." />
          </Form.Item>
          <Form.Item name="ownerName" label="Owner name" rules={[{ required: true, min: 2 }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="ownerPhone"
            label="Owner phone (Egyptian mobile)"
            rules={[{ required: true }]}
          >
            <Input placeholder="01xxxxxxxxx" dir="ltr" />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
