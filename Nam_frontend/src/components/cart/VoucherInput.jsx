import React, { useState } from 'react';
import { Input, Button, Tag, Space, message } from 'antd';
import { TagOutlined, CloseOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import './VoucherInput.css';

const VoucherInput = () => {
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { appliedVoucher, applyVoucher, removeVoucher } = useCart();

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      message.warning('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      setLoading(true);
      await applyVoucher(voucherCode);
      setVoucherCode('');
    } catch (error) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = async () => {
    try {
      await removeVoucher();
    } catch (error) {
      // Error handled by context
    }
  };

  return (
    <div className="voucher-input">
      {appliedVoucher ? (
        <div className="applied-voucher">
          <Tag color="success" icon={<TagOutlined />}>
            <Space>
              <span>{appliedVoucher.code}</span>
              <span>-{appliedVoucher.discount_percent}%</span>
              <CloseOutlined onClick={handleRemoveVoucher} style={{ cursor: 'pointer' }} />
            </Space>
          </Tag>
          <p className="voucher-description">{appliedVoucher.description}</p>
        </div>
      ) : (
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Nhập mã giảm giá"
            prefix={<TagOutlined />}
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            onPressEnter={handleApplyVoucher}
          />
          <Button
            type="primary"
            onClick={handleApplyVoucher}
            loading={loading}
          >
            Áp dụng
          </Button>
        </Space.Compact>
      )}
    </div>
  );
};

export default VoucherInput;
