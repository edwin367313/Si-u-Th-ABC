import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, message, Modal, Select, Card, Typography } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import orderService from '../../services/orderService';
import { formatCurrency } from '../../utils/helpers';

const { Title } = Typography;
const { Option } = Select;

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filterStatus, setFilterStatus] = useState(null);

  const fetchOrders = async (page = 1, status = filterStatus) => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrders(page, 10, status);
      if (response.orders) {
        setOrders(response.orders);
        setPagination({
          current: page,
          pageSize: 10,
          total: response.total
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      message.success('Cập nhật trạng thái thành công');
      fetchOrders(pagination.current);
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <b>#{text}</b>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'full_name', // Assuming API returns full_name or user object
      key: 'customer',
      render: (text, record) => (
        <div>
          <div>{record.full_name || record.username}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.phone}</div>
        </div>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total',
      render: (amount) => <span style={{ color: '#f50', fontWeight: 'bold' }}>{formatCurrency(amount)}</span>
    },
    {
      title: 'Phương thức',
      dataIndex: 'payment_method',
      key: 'payment',
      render: (method) => <Tag color="blue">{method?.toUpperCase()}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = status;
        if (status === 'pending') { color = 'orange'; text = 'Chờ xử lý'; }
        if (status === 'processing') { color = 'blue'; text = 'Đang xử lý'; }
        if (status === 'completed') { color = 'green'; text = 'Hoàn thành'; }
        if (status === 'cancelled') { color = 'red'; text = 'Đã hủy'; }
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<CheckCircleOutlined />}
                onClick={() => Modal.confirm({
                  title: 'Xác nhận thanh toán',
                  content: 'Bạn có chắc chắn muốn xác nhận đơn hàng này đã thanh toán?',
                  onOk: () => handleStatusUpdate(record.id, 'processing')
                })}
              >
                Xác nhận
              </Button>
              <Button 
                danger 
                size="small" 
                icon={<CloseCircleOutlined />}
                onClick={() => Modal.confirm({
                  title: 'Hủy đơn hàng',
                  content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
                  okType: 'danger',
                  onOk: () => handleStatusUpdate(record.id, 'cancelled')
                })}
              >
                Hủy
              </Button>
            </>
          )}
          {/* Add View Detail button if needed */}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2}>Quản lý đơn hàng</Title>
        <Select 
          placeholder="Lọc theo trạng thái" 
          style={{ width: 200 }}
          allowClear
          onChange={setFilterStatus}
        >
          <Option value="pending">Chờ xử lý</Option>
          <Option value="processing">Đang xử lý</Option>
          <Option value="completed">Hoàn thành</Option>
          <Option value="cancelled">Đã hủy</Option>
        </Select>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page) => fetchOrders(page)
          }}
        />
      </Card>
    </div>
  );
};

export default OrdersPage;
