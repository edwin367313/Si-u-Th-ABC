import React from 'react';
import { Card, Divider, Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/helpers';
import './CartSummary.css';

const CartSummary = ({ 
  subtotal = 0, 
  discount = 0, 
  shipping = 0, 
  total = 0,
  onCheckout,
  checkoutDisabled = false
}) => {
  return (
    <Card className="cart-summary" title="Tổng đơn hàng">
      <div className="summary-row">
        <span>Tạm tính:</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      {discount > 0 && (
        <div className="summary-row discount">
          <span>Giảm giá:</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
      )}

      <div className="summary-row">
        <span>Phí vận chuyển:</span>
        <span>{shipping > 0 ? formatCurrency(shipping) : 'Miễn phí'}</span>
      </div>

      <Divider />

      <div className="summary-row total">
        <span>Tổng cộng:</span>
        <span>{formatCurrency(total)}</span>
      </div>

      <Button
        type="primary"
        size="large"
        block
        icon={<ShoppingCartOutlined />}
        onClick={onCheckout}
        disabled={checkoutDisabled}
        className="checkout-btn"
      >
        Tiến hành thanh toán
      </Button>

      <div className="summary-note">
        <p>* Miễn phí vận chuyển cho đơn hàng từ 500.000đ</p>
        <p>* Áp dụng mã giảm giá ở bước tiếp theo</p>
      </div>
    </Card>
  );
};

export default CartSummary;
