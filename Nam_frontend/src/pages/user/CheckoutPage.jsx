import React, { useState } from 'react';
import { Card, Form, Input, Button } from 'antd';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../../components/payment/PaymentModal';
import orderService from '../../services/orderService';

const CheckoutPage = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [order, setOrder] = useState(null);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      // Map form values to backend schema
      const orderData = {
        shippingName: values.fullname,
        shippingPhone: values.phone,
        shippingAddress: values.address,
        paymentMethod: 'cod', // Default to COD initially, or let user choose before this step
        items: cart.items.map(item => ({
          productId: item.productId || item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const newOrder = await orderService.createOrder(orderData);
      setOrder(newOrder.order);
      setShowPayment(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePaymentSuccess = () => {
    navigate('/order-success');
  };

  return (
    <div>
      <h1>Thanh toán</h1>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="fullname"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[
              { required: true, message: 'Vui lòng nhập địa chỉ!' },
              { min: 5, message: 'Địa chỉ phải có ít nhất 5 ký tự' }
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large">
            Tiếp tục thanh toán
          </Button>
        </Form>
      </Card>

      {showPayment && (
        <PaymentModal
          visible={showPayment}
          onCancel={() => setShowPayment(false)}
          order={order}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
