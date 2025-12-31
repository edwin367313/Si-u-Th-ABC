import React from 'react';
import { Table, Button, InputNumber, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/helpers';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => {
        // Handle both flat structure (from backend) and nested structure (from local storage)
        const productInfo = record.product || record;
        const imageUrl = productInfo.image_url || productInfo.images || '/placeholder.png';
        
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={imageUrl} 
              alt={productInfo.name} 
              style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 10 }} 
            />
            <span>{productInfo.name}</span>
          </div>
        );
      }
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      render: (price) => formatCurrency(price)
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      render: (quantity, record) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => updateQuantity(record.productId, value)}
        />
      )
    },
    {
      title: 'Thành tiền',
      render: (_, record) => formatCurrency(record.price * record.quantity)
    },
    {
      title: '',
      render: (_, record) => (
        <Popconfirm
          title="Xóa sản phẩm?"
          onConfirm={() => removeFromCart(record.productId)}
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  return (
    <div>
      <h1>Giỏ hàng</h1>
      <Table
        dataSource={cart?.items || []}
        columns={columns}
        rowKey="productId"
        pagination={false}
      />
      <div style={{ marginTop: 20, textAlign: 'right' }}>
        <h2>Tổng: {formatCurrency(cart?.total || 0)}</h2>
        <Button type="primary" size="large" onClick={() => navigate('/checkout')}>
          Thanh toán
        </Button>
      </div>
    </div>
  );
};

export default CartPage;
