import React from 'react';
import { Card, Row, Col, Statistic, Button, Typography, Space } from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  SkinOutlined,
  AppstoreOutlined,
  PlusOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Quản lý Sản phẩm',
      icon: <AppstoreOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      desc: 'Thêm, sửa, xóa sản phẩm',
      link: '/admin/products',
      action: 'Thêm mới',
      actionLink: '/admin/products/new'
    },
    {
      title: 'Quản lý Đơn hàng',
      icon: <ShoppingCartOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      desc: 'Xem và xử lý đơn hàng',
      link: '/admin/orders'
    },
    {
      title: 'Thông báo',
      icon: <BellOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />,
      desc: 'Xem thông báo đơn hàng mới',
      link: '/admin/notifications'
    },
    {
      title: 'Quản lý Giao diện',
      icon: <SkinOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      desc: 'Chỉnh sửa theme, banner',
      link: '/admin/themes'
    },
    {
      title: 'Báo cáo Doanh thu',
      icon: <DollarOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
      desc: 'Xem thống kê chi tiết',
      link: '/admin/revenue'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Trang quản trị</Title>
      
      {/* Statistics Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Tổng doanh thu"
              value={112893000}
              suffix="đ"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Đơn hàng"
              value={128}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Sản phẩm"
              value={234}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Khách hàng"
              value={456}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions Section */}
      <Title level={3}>Chức năng quản lý</Title>
      <Row gutter={[16, 16]}>
        {menuItems.map((item, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card 
              hoverable 
              style={{ height: '100%' }}
              actions={[
                <Button type="link" onClick={() => navigate(item.link)}>Truy cập</Button>,
                item.action && <Button type="link" icon={<PlusOutlined />} onClick={() => navigate(item.actionLink || item.link)}>{item.action}</Button>
              ].filter(Boolean)}
            >
              <Card.Meta
                avatar={item.icon}
                title={item.title}
                description={item.desc}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Dashboard;
