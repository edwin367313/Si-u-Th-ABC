import React, { useState, useEffect } from 'react';
import { List, Card, Tag, Button, Typography, Space, message, Badge } from 'antd';
import { BellOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const navigate = useNavigate();

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/notifications/admin?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setPagination({
          current: page,
          pageSize: 10,
          total: response.data.data.pagination.total
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      message.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleViewOrder = (orderId, notificationId) => {
    if (notificationId) handleMarkAsRead(notificationId);
    navigate(`/admin/orders`); // Ideally navigate to specific order detail if available
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}><BellOutlined /> Thông báo đơn hàng</Title>
        <Button onClick={handleMarkAllRead}>Đánh dấu tất cả đã đọc</Button>
      </div>

      <Card>
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={notifications}
          pagination={{
            ...pagination,
            onChange: (page) => fetchNotifications(page)
          }}
          renderItem={item => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => handleViewOrder(item.reference_id, item.id)}>
                  Xem chi tiết
                </Button>,
                !item.is_read && (
                  <Button type="text" size="small" onClick={() => handleMarkAsRead(item.id)}>
                    Đã đọc
                  </Button>
                )
              ]}
              style={{ 
                background: item.is_read ? 'transparent' : '#f0f5ff',
                padding: '12px 24px',
                borderRadius: 4,
                marginBottom: 8
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={!item.is_read}>
                    <div style={{ 
                      width: 40, height: 40, borderRadius: '50%', 
                      background: '#1890ff', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center',
                      color: 'white'
                    }}>
                      {item.type === 'order' ? <ClockCircleOutlined /> : <BellOutlined />}
                    </div>
                  </Badge>
                }
                title={
                  <Space>
                    <Text strong>{item.title}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(item.created_at).toLocaleString('vi-VN')}
                    </Text>
                  </Space>
                }
                description={item.message}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default NotificationsPage;
