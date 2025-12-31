import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Tag, Button, message, Space, Modal, Typography } from 'antd';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { getOrderStatusText, getOrderStatusColor } from '../../utils/helpers';

const { Text } = Typography;

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/my-orders');
      if (response.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn hàng',
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      okText: 'Đồng ý',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          await api.put(`/orders/${orderId}/cancel`);
          message.success('Hủy đơn hàng thành công');
          fetchOrders();
        } catch (error) {
          message.error('Không thể hủy đơn hàng');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <b>#{text}</b>
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString('vi-VN')
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => <Text type="danger" strong>{amount?.toLocaleString('vi-VN')}đ</Text>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getOrderStatusColor(status)}>
          {getOrderStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
           {record.status === 'pending' && (
             <Button danger size="small" onClick={() => handleCancelOrder(record.id)}>Hủy đơn</Button>
           )}
        </Space>
      )
    }
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={orders} 
      rowKey="id" 
      loading={loading}
      pagination={{ pageSize: 5 }}
    />
  );
};

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1>Tài khoản của tôi</h1>
      <Card>
        <Tabs
          items={[
            {
              key: 'info',
              label: 'Thông tin cá nhân',
              children: (
                <div style={{ padding: 20 }}>
                  <p><strong>Họ tên:</strong> {user?.fullname}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Số điện thoại:</strong> {user?.phone}</p>
                </div>
              )
            },
            {
              key: 'orders',
              label: 'Đơn hàng của tôi',
              children: <MyOrders />
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default ProfilePage;
