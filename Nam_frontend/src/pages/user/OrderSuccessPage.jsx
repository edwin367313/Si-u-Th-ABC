import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const OrderSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="success"
      title="Đặt hàng thành công!"
      subTitle="Cảm ơn bạn đã mua hàng tại Siêu Thị ABC. Đơn hàng của bạn đang được xử lý."
      extra={[
        <Button type="primary" key="home" onClick={() => navigate('/')}>
          Về trang chủ
        </Button>,
        <Button key="orders" onClick={() => navigate('/profile')}>
          Xem đơn hàng
        </Button>
      ]}
    />
  );
};

export default OrderSuccessPage;
