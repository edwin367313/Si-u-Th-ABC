import React from 'react';
import { Card, Tabs } from 'antd';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Tài khoản của tôi</h1>
      <Card>
        <Tabs
          items={[
            {
              key: 'info',
              label: 'Thông tin cá nhân',
              children: (
                <div>
                  <p>Tên: {user?.fullname}</p>
                  <p>Email: {user?.email}</p>
                  <p>Số điện thoại: {user?.phone}</p>
                </div>
              )
            },
            {
              key: 'orders',
              label: 'Đơn hàng của tôi',
              children: <div>Danh sách đơn hàng</div>
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default ProfilePage;
