import React from 'react';
import { Menu, Layout } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  BgColorsOutlined,
  PictureOutlined,
  SettingOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import './AdminSidebar.css';

const { Sider } = Layout;

const AdminSidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Tổng quan'
    },
    {
      key: '/admin/analytics',
      icon: <LineChartOutlined />,
      label: 'Phân tích & ML'
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: 'Sản phẩm'
    },
    {
      key: '/admin/orders',
      icon: <ShoppingCartOutlined />,
      label: 'Đơn hàng'
    },
    {
      key: '/admin/revenue',
      icon: <DollarOutlined />,
      label: 'Doanh thu'
    },
    {
      key: '/admin/themes',
      icon: <BgColorsOutlined />,
      label: 'Giao diện'
    }
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="admin-sidebar"
      width={250}
    >
      <div className="admin-logo">
        <h2>{collapsed ? 'ABC' : 'Admin Panel'}</h2>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default AdminSidebar;
