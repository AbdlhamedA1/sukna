import { PlusOutlined } from '@ant-design/icons';
import {
  App as AntApp,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag, Image } from 'antd';
import { useMemo, useState } from 'react';

import {
  useArchiveBuildingMutation,
  useCreateBuildingMutation,
  useDeleteBuildingMutation,
  useGetAdminBuildingsQuery,
  type BuildingItem,
} from '../services/buildingsApi';
import { useGetAdminLocationsQuery } from '../services/locationsApi';

export function BuildingsPage() {
  const { message } = AntApp.useApp();
  const { data: buildings = [], isLoading } = useGetAdminBuildingsQuery();
  const { data: locations = [] } = useGetAdminLocationsQuery();
  const [createBuilding, { isLoading: creating }] = useCreateBuildingMutation();
  const [archiveBuilding] = useArchiveBuildingMutation();
  const [deleteBuilding] = useDeleteBuildingMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const watchGov = Form.useWatch('governorateId', form) as string | undefined;
  const watchCity = Form.useWatch('cityId', form) as string | undefined;

  const govs = useMemo(() => locations.filter((l) => l.type === 'governorate'), [locations]);
  const cities = useMemo(
    () => locations.filter((l) => l.type === 'city' && l.parentId === watchGov),
    [locations, watchGov],
  );
  const areas = useMemo(
    () => locations.filter((l) => l.type === 'area' && l.parentId === watchCity),
    [locations, watchCity],
  );

  async function onCreate(values: Record<string, string>) {
    try {
      await createBuilding({
        name: values.name,
        description: values.description ?? '',
        mainImage: values.mainImage,
        mainImagePublicId: values.mainImagePublicId || 'manual',
        additionalImages: [],
        additionalImagePublicIds: [],
        governorateId: values.governorateId,
        cityId: values.cityId,
        areaId: values.areaId,
        streetAddress: values.streetAddress,
        googleMapsUrl: values.googleMapsUrl,
      }).unwrap();
      message.success('Building created.');
      setModalOpen(false);
      form.resetFields();
    } catch {
      message.error('Could not create the building. Check the fields.');
    }
  }

  const columns = [
    {
      title: 'Building',
      key: 'name',
      render: (_: unknown, b: BuildingItem) => (
        <div className="flex items-center gap-3">
          <Image src={b.mainImage} alt="" width={56} height={40} className="rounded object-cover" style={{ objectFit: 'cover', borderRadius: 4 }} />
          <div>
            <div className="font-semibold">{b.name}</div>
            <div className="text-xs text-brand-muted">{b.streetAddress}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_: unknown, b: BuildingItem) =>
        [b.areaId?.nameEn, b.cityId?.nameEn, b.governorateId?.nameEn].filter(Boolean).join(', '),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, b: BuildingItem) =>
        b.isArchived ? <Tag color="orange">Archived</Tag> : <Tag color="green">Active</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, b: BuildingItem) => (
        <div className="flex gap-2">
          {!b.isArchived && (
            <Button
              size="small"
              onClick={() =>
                archiveBuilding(b._id)
                  .unwrap()
                  .then(() => message.success('Building archived.'))
                  .catch(() => message.error('Archive failed.'))
              }
            >
              Archive
            </Button>
          )}
          <Popconfirm
            title="Delete this building? It must have no apartments."
            onConfirm={() =>
              deleteBuilding(b._id)
                .unwrap()
                .then(() => message.success('Building deleted.'))
                .catch(() => message.error('Delete failed (apartments may be attached).'))
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
        <h1 className="text-2xl font-bold text-brand-primary">Buildings</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Add building
        </Button>
      </div>
      <Table
        rowKey="_id"
        loading={isLoading}
        dataSource={buildings}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />

      <Modal
        title="Add building"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={creating}
        okText="Create"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onCreate} preserve={false}>
          <Form.Item name="name" label="Name" rules={[{ required: true, min: 3 }]}>
            <Input placeholder="Al-Safa Tower 3" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} maxLength={1000} />
          </Form.Item>
          <Form.Item
            name="mainImage"
            label="Main image URL"
            rules={[{ required: true, type: 'url' }]}
          >
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="governorateId" label="Governorate" rules={[{ required: true }]}>
            <Select
              options={govs.map((g) => ({ value: g._id, label: g.nameEn }))}
              onChange={() => form.setFieldsValue({ cityId: undefined, areaId: undefined })}
              placeholder="Select governorate"
            />
          </Form.Item>
          <Form.Item name="cityId" label="City" rules={[{ required: true }]}>
            <Select
              options={cities.map((c) => ({ value: c._id, label: c.nameEn }))}
              onChange={() => form.setFieldsValue({ areaId: undefined })}
              placeholder="Select city"
              disabled={!watchGov}
            />
          </Form.Item>
          <Form.Item name="areaId" label="Area" rules={[{ required: true }]}>
            <Select
              options={areas.map((a) => ({ value: a._id, label: a.nameEn }))}
              placeholder="Select area"
              disabled={!watchCity}
            />
          </Form.Item>
          <Form.Item
            name="streetAddress"
            label="Street address"
            rules={[{ required: true, min: 5 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="googleMapsUrl"
            label="Google Maps URL"
            rules={[{ required: true, type: 'url' }]}
          >
            <Input placeholder="https://maps.google.com/..." />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
