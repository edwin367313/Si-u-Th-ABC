import React from 'react';
import { Card, InputNumber, Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/helpers';
import './CartItem.css';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, quantity, price } = item;

  return (
    <Card className="cart-item">
      <div className="cart-item-content">
        <div className="cart-item-image">
          <img src={product.image_url || '/placeholder.png'} alt={product.name} />
        </div>
        
        <div className="cart-item-details">
          <h3 className="cart-item-name">{product.name}</h3>
          <p className="cart-item-price">{formatCurrency(price)}</p>
        </div>

        <div className="cart-item-quantity">
          <span>Số lượng:</span>
          <InputNumber
            min={1}
            max={product.stock_quantity}
            value={quantity}
            onChange={(value) => onUpdateQuantity(product.id, value)}
          />
        </div>

        <div className="cart-item-total">
          <span className="label">Thành tiền:</span>
          <span className="amount">{formatCurrency(price * quantity)}</span>
        </div>

        <div className="cart-item-actions">
          <Popconfirm
            title="Xóa sản phẩm khỏi giỏ hàng?"
            onConfirm={() => onRemove(product.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
};

export default CartItem;
