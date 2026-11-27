import { PlusOutlined } from '@ant-design/icons';
import { App as AntApp, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

import { useGetAdminApartmentsQuery } from '../services/apartmentsApi';
import {
  errMsg,
  useAssignOrderApartmentMutation,
  useCancelOrderMutation,
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetPackagesQuery,
  useSettleOrderMutation,
  type OrderItem,
} from '../services/adminApi';

const COLOR = { pending: 'orange', active: 'green', expired: 'default', cancelled: 'red' } as const;
const fmt = (d: string | null) => (d ? dayjs(d).format('DD MMM YYYY') : '-');

export function OrdersPage() {
  const { message } = AntApp.useApp();
  const { data: orders = [], isLoading } = useGetOrdersQuery();
  const { data: packages = [] } = useGetPackagesQuery();
  const { data: apartments = [] } = useGetAdminApartmentsQuery();
  const [createOrder, { isLoading: creating }] = useCreateOrderMutation();
  const [cancelOrder] = useCancelOrderMutation();
  const [assignApartment, { isLoading: assigning }] = useAssignOrderApartmentMutation();
  const [settle, { isLoading: settling }] = useSettleOrderMutation();
  const [newOpen, setNewOpen] = useState(false);
  const [paying, setPaying] = useState<OrderItem | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<OrderItem | null>(null);
  const [assignForm] = Form.useForm();
  const [newForm] = Form.useForm();
  const [payForm] = Form.useForm();

  async function onCreate(v: { apartmentId: string; packageId: string }) {
    try {
      await createOrder(v).unwrap();
      message.success('Order created with the current package price.');
      setNewOpen(false);
      newForm.resetFields();
    } catch (e) {
      message.error(errMsg(e, 'Could not create the order.'));
    }
  }

  async function onAssign(v: { apartmentId: string }) {
    if (!assigningOrder) return;
    try {
      await assignApartment({ id: assigningOrder._id, apartmentId: v.apartmentId }).unwrap();
      message.success('Property assigned. You can settle the order now.');
      setAssigningOrder(null);
    } catch (e) {
      message.error(errMsg(e, 'Could not assign the property.'));
    }
  }

  async function onSettle(v: { amountPaid: number; paymentMethod: string; externalTransactionRef?: string }) {
    if (!paying) return;
    try {
      await settle({ id: paying._id, ...v }).unwrap();
      message.success('Payment recorded. The ad is now active.');
      setPaying(null);
    } catch (e) {
      message.error(errMsg(e, 'Could not record the payment.'));
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Advertising orders</h1>
          <p className="text-sm text-brand-muted">Create an order, then settle it once the money arrives.</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setNewOpen(true)}>
          New order
        </Button>
      </div>
      <Table
        rowKey="_id"
        loading={isLoading}
        dataSource={orders}
        scroll={{ x: 800 }}
        columns={[
          {
            title: 'Apartment',
            render: (_, o: OrderItem) =>
              typeof o.apartmentId === 'string'
                ? o.apartmentId
                : (o.apartmentId?.title ?? <Tag color="orange">Not assigned</Tag>),
          },
          {
            title: 'Owner',
            render: (_, o: OrderItem) =>
              o.ownerName ? (
                <span>
                  {o.ownerName}
                  {o.ownerPhone ? <span className="text-brand-muted"> · {o.ownerPhone}</span> : null}
                  {o.propertyNote ? <div className="text-xs text-brand-muted">{o.propertyNote}</div> : null}
                </span>
              ) : (
                '-'
              ),
          },
          { title: 'Package', render: (_, o: OrderItem) => o.packageSnapshot.nameEn },
          { title: 'Price (EGP)', render: (_, o: OrderItem) => o.packageSnapshot.price },
          { title: 'Status', render: (_, o: OrderItem) => <Tag color={COLOR[o.orderStatus]}>{o.orderStatus}</Tag> },
          { title: 'Starts', render: (_, o: OrderItem) => fmt(o.startDate) },
          { title: 'Ends', render: (_, o: OrderItem) => fmt(o.endDate) },
          {
            title: '',
            render: (_, o: OrderItem) =>
              o.orderStatus === 'pending' ? (
                <div className="flex gap-2">
                  {o.apartmentId ? (
                    <Button
                      type="primary"
                      onClick={() => {
                        setPaying(o);
                        payForm.setFieldsValue({ amountPaid: o.packageSnapshot.price, paymentMethod: 'instapay' });
                      }}
                    >
                      Settle
                    </Button>
                  ) : (
                    <Button type="primary" onClick={() => setAssigningOrder(o)}>
                      Assign property
                    </Button>
                  )}
                  <Popconfirm title="Cancel this order?" onConfirm={() => cancelOrder(o._id)}>
                    <Button danger>Cancel</Button>
                  </Popconfirm>
                </div>
              ) : null,
          },
        ]}
        expandable={{
          rowExpandable: (o) => !!o.payment,
          expandedRowRender: (o) => (
            <div className="text-sm">
              Paid {o.payment?.amountPaid} EGP via {o.payment?.paymentMethod.replace('_', ' ')} on {fmt(o.payment?.paidAt ?? null)}
              {o.payment?.externalTransactionRef ? `, ref ${o.payment.externalTransactionRef}` : ''}
            </div>
          ),
        }}
      />

      <Modal title="New order" open={newOpen} onCancel={() => setNewOpen(false)} onOk={() => newForm.submit()} confirmLoading={creating} okText="Create" destroyOnClose>
        <Form form={newForm} layout="vertical" onFinish={onCreate} requiredMark={false}>
          <Form.Item name="apartmentId" label="Apartment" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" options={apartments.filter((a) => a.listingStatus === 'published').map((a) => ({ value: a._id, label: a.title }))} />
          </Form.Item>
          <Form.Item name="packageId" label="Package" rules={[{ required: true }]}>
            <Select options={packages.filter((p) => p.isActive).map((p) => ({ value: p._id, label: `${p.nameEn} - ${p.price} EGP / ${p.durationDays} days` }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Assign property"
        open={!!assigningOrder}
        onCancel={() => setAssigningOrder(null)}
        onOk={() => assignForm.submit()}
        confirmLoading={assigning}
        okText="Assign"
        destroyOnClose
      >
        <p className="mb-3 text-sm text-brand-muted">
          {assigningOrder?.ownerName ? `${assigningOrder.ownerName} asked for ${assigningOrder.packageSnapshot.nameEn}. ` : ''}
          Pick the apartment this order belongs to, then settle it when the payment arrives.
        </p>
        <Form form={assignForm} layout="vertical" onFinish={onAssign} requiredMark={false}>
          <Form.Item name="apartmentId" label="Apartment" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={apartments.filter((a) => a.listingStatus === 'published').map((a) => ({ value: a._id, label: a.title }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Settle payment" open={!!paying} onCancel={() => setPaying(null)} onOk={() => payForm.submit()} confirmLoading={settling} okText="Record payment" destroyOnClose>
        <p className="mb-3 text-sm text-brand-muted">
          The amount must equal the order price ({paying?.packageSnapshot.price} EGP).
        </p>
        <Form form={payForm} layout="vertical" onFinish={onSettle} requiredMark={false}>
          <Form.Item name="amountPaid" label="Amount (EGP)" rules={[{ required: true }]}>
            <InputNumber min={0} className="!w-full" />
          </Form.Item>
          <Form.Item name="paymentMethod" label="Method" rules={[{ required: true }]}>
            <Select options={[
              { value: 'instapay', label: 'InstaPay' },
              { value: 'vodafone_cash', label: 'Vodafone Cash' },
              { value: 'bank_transfer', label: 'Bank transfer' },
              { value: 'cash', label: 'Cash' },
            ]} />
          </Form.Item>
          <Form.Item name="externalTransactionRef" label="Receipt reference">
            <Input maxLength={100} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
