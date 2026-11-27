import { PlusOutlined } from '@ant-design/icons';
import {
  App as AntApp,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Table,
  Tag,
} from 'antd';
import { useMemo, useState } from 'react';

import {
  useCreateLocationMutation,
  useGetAdminLocationsQuery,
  useUpdateLocationMutation,
  type LocationItem,
} from '../services/locationsApi';

const TYPE_LABEL: Record<LocationItem['type'], string> = {
  governorate: 'Governorate',
  city: 'City',
  area: 'Area',
};

const PARENT_TYPE: Record<LocationItem['type'], LocationItem['type'] | null> = {
  governorate: null,
  city: 'governorate',
  area: 'city',
};

export function LocationsPage() {
  const { message } = AntApp.useApp();
  const { data: locations = [], isLoading } = useGetAdminLocationsQuery();
  const [createLocation, { isLoading: creating }] = useCreateLocationMutation();
  const [updateLocation] = useUpdateLocationMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const watchType = Form.useWatch('type', form) as LocationItem['type'] | undefined;

  type Row = LocationItem & { key: string; depth: number; childCount: number };
  const rows = useMemo(() => {
    const byParent = new Map<string, LocationItem[]>();
    for (const loc of locations) {
      const key = loc.parentId ?? 'root';
      byParent.set(key, [...(byParent.get(key) ?? []), loc]);
    }
    const out: Row[] = [];
    const walk = (parentKey: string, depth: number) => {
      const list = [...(byParent.get(parentKey) ?? [])].sort(
        (x, y) => (x.displayOrder ?? 0) - (y.displayOrder ?? 0),
      );
      for (const loc of list) {
        out.push({ ...loc, key: loc._id, depth, childCount: byParent.get(loc._id)?.length ?? 0 });
        walk(loc._id, depth + 1);
      }
    };
    walk('root', 0);
    return out;
  }, [locations]);

  const parentOptions = useMemo(() => {
    if (!watchType || !PARENT_TYPE[watchType]) return [];
    return locations
      .filter((l) => l.type === PARENT_TYPE[watchType] && l.isActive)
      .map((l) => ({ value: l._id, label: l.nameEn }));
  }, [locations, watchType]);

  async function handleCreate(values: {
    nameEn: string;
    nameAr: string;
    type: LocationItem['type'];
    parentId?: string;
    displayOrder?: number;
  }) {
    try {
      await createLocation({
        nameEn: values.nameEn,
        nameAr: values.nameAr,
        type: values.type,
        parentId: values.parentId ?? null,
        displayOrder: values.displayOrder ?? 0,
      }).unwrap();
      message.success(`${TYPE_LABEL[values.type]} created.`);
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ?? 'Could not create location.';
      message.error(msg);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Locations</h1>
          <p className="text-sm text-brand-muted">
            Manage the governorate, city, and area hierarchy shown in public search filters.
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Add location
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm">
        <Table<Row>
          loading={isLoading}
          dataSource={rows}
          pagination={false}
          size="middle"
          scroll={{ x: 640 }}
          rowClassName={(r) => (r.type === 'governorate' ? 'bg-brand-primary-soft/60' : '')}
          columns={[
            {
              title: 'Name (EN)',
              dataIndex: 'nameEn',
              key: 'nameEn',
              render: (_: string, r) => (
                <div className="flex items-center" style={{ paddingLeft: r.depth * 28 }}>
                  {r.depth > 0 ? (
                    <span className="mr-2 inline-block h-4 w-3 shrink-0 rounded-bl border-b border-l border-brand-border" />
                  ) : null}
                  <span
                    className={
                      r.type === 'governorate'
                        ? 'font-bold text-brand-primary'
                        : r.type === 'city'
                          ? 'font-semibold text-brand-ink'
                          : 'text-brand-ink'
                    }
                  >
                    {r.nameEn}
                  </span>
                  {r.childCount > 0 ? (
                    <span className="ml-2 text-xs text-brand-muted">({r.childCount})</span>
                  ) : null}
                </div>
              ),
            },
            {
              title: 'Name (AR)',
              dataIndex: 'nameAr',
              key: 'nameAr',
              width: 200,
              align: 'right',
              render: (v: string) => (
                <span dir="rtl" className="font-arabic text-base">
                  {v}
                </span>
              ),
            },
            {
              title: 'Type',
              dataIndex: 'type',
              key: 'type',
              width: 140,
              render: (type: LocationItem['type']) => (
                <Tag
                  className="m-0 min-w-[96px] text-center"
                  color={type === 'governorate' ? 'blue' : type === 'city' ? 'cyan' : 'default'}
                >
                  {TYPE_LABEL[type]}
                </Tag>
              ),
            },
            {
              title: 'Order',
              dataIndex: 'displayOrder',
              key: 'displayOrder',
              width: 90,
              align: 'center',
            },
            {
              title: 'Active',
              dataIndex: 'isActive',
              key: 'isActive',
              width: 100,
              align: 'center',
              render: (isActive: boolean, row) => (
                <Switch
                  checked={isActive}
                  onChange={async (checked) => {
                    await updateLocation({ id: row._id, isActive: checked });
                    message.success(checked ? 'Activated.' : 'Deactivated.');
                  }}
                />
              ),
            },
          ]}
        />
      </div>

      <Modal
        title="Add location"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={creating}
        okText="Create"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="pt-2">
          <Form.Item
            name="type"
            label="Tier"
            rules={[{ required: true, message: 'Pick a tier.' }]}
          >
            <Select
              options={(['governorate', 'city', 'area'] as const).map((t) => ({
                value: t,
                label: TYPE_LABEL[t],
              }))}
              placeholder="Governorate, city, or area"
            />
          </Form.Item>
          {watchType && PARENT_TYPE[watchType] ? (
            <Form.Item
              name="parentId"
              label={`Parent ${TYPE_LABEL[PARENT_TYPE[watchType]!]}`}
              rules={[{ required: true, message: 'Pick a parent.' }]}
            >
              <Select options={parentOptions} placeholder="Select parent" showSearch />
            </Form.Item>
          ) : null}
          <Form.Item
            name="nameEn"
            label="Name (English)"
            rules={[{ required: true, min: 2, message: 'At least 2 characters.' }]}
          >
            <Input placeholder="Qena" />
          </Form.Item>
          <Form.Item
            name="nameAr"
            label="Name (Arabic)"
            rules={[{ required: true, min: 2, message: 'At least 2 characters.' }]}
          >
            <Input placeholder="قنا" dir="rtl" />
          </Form.Item>
          <Form.Item name="displayOrder" label="Display order" initialValue={0}>
            <InputNumber min={0} max={10000} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
