import React from 'react';
import { Layout, Menu, Badge, Dropdown, Avatar, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCartOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  DashboardOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Header.css';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { cart } = useCart();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Tài khoản',
      onClick: () => navigate('/profile')
    },
    ...(isAdmin() ? [{
      key: 'admin',
      icon: <DashboardOutlined />,
      label: 'Quản trị',
      onClick: () => navigate('/admin')
    }] : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: logout
    }
  ];

  return (
    <AntHeader className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>Siêu Thị ABC</h1>
        </Link>

        <div className="header-search">
          <Button
            icon={<SearchOutlined />}
            onClick={() => navigate('/search')}
            className="search-btn"
          >
            Tìm kiếm sản phẩm...
          </Button>
        </div>

        <div className="header-actions">
          <Link to="/cart" className="cart-link">
            <Badge count={cart?.itemCount || 0} showZero>
              <ShoppingCartOutlined className="cart-icon" />
            </Badge>
            <span className="cart-text">Giỏ hàng</span>
          </Link>

          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-menu">
                <Avatar icon={<UserOutlined />} />
                <span className="username">{user?.fullname || user?.username}</span>
              </div>
            </Dropdown>
          ) : (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
