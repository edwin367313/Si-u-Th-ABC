import React, { useState } from 'react';
import { Card, Form, Input, Button, Radio, Space } from 'antd';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../../components/payment/PaymentModal';
import orderService from '../../services/orderService';
import { PAYMENT_METHODS } from '../../utils/constants';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [order, setOrder] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS.COD);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    if (loading) return;
    setLoading(true);
    try {
      // Map form values to backend schema
      const orderData = {
        shippingName: values.fullname,
        shippingPhone: values.phone,
        shippingAddress: values.address,
        paymentMethod: values.paymentMethod || 'cod',
        items: cart.items.map(item => ({
          productId: item.productId || item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await orderService.createOrder(orderData);
      
      // Clear cart in frontend context since backend has already cleared it
      clearCart();

      // The response structure is { success: true, message: "...", data: { order: {...} } }
      // But axios interceptor returns response.data, so we get { success: true, message: "...", data: { order: {...} } }
      // Wait, if axios interceptor returns response.data, then `response` IS the body.
      // successResponse returns { success: true, message, data: { order } }
      
      const createdOrder = response.data?.order || response.order;

      if (!createdOrder) {
          console.error("Order creation response invalid:", response);
          // Fallback or error handling
      }

      // Enrich order object with form values and cart items for display in PaymentModal
      setOrder({
        ...createdOrder,
        items: cart.items,
        full_name: values.fullname,
        phone: values.phone,
        address: values.address
      });
      setSelectedPaymentMethod(values.paymentMethod);
      setShowPayment(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate('/order-success');
  };

  return (
    <div>
      <h1>Thanh toán</h1>
      <Card>
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
          initialValues={{
            paymentMethod: PAYMENT_METHODS.COD
          }}
        >
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

          <Form.Item
            name="paymentMethod"
            label="Phương thức thanh toán"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
          >
            <Radio.Group onChange={(e) => setSelectedPaymentMethod(e.target.value)}>
              <Space direction="vertical">
                <Radio value={PAYMENT_METHODS.COD}>Thanh toán khi nhận hàng (COD)</Radio>
                <Radio value={PAYMENT_METHODS.BANK_TRANSFER}>Chuyển khoản ngân hàng (QR Code)</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" loading={loading}>
            Tiếp tục thanh toán
          </Button>
        </Form>
      </Card>

      {showPayment && (
        <PaymentModal
          visible={showPayment}
          onCancel={() => setShowPayment(false)}
          order={order}
          initialMethod={selectedPaymentMethod}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
