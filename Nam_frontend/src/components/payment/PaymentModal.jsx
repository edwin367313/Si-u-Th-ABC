import React, { useState, useEffect } from 'react';
import { Modal, Radio, Button, Space, Progress, Alert, Image, Typography, Statistic } from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined,
  WalletOutlined,
  LoadingOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import { PAYMENT_METHODS, PAYMENT_PROCESSING_DELAY } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import usePayment from '../../hooks/usePayment';
import './PaymentModal.css';

const { Title, Text } = Typography;
const { Countdown } = Statistic;

const PaymentModal = ({ visible, onCancel, order, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS.MOMO);
  const [showQR, setShowQR] = useState(false);
  const {
    isProcessing,
    countdown,
    processMomoPayment,
    processZaloPayPayment,
    executePayPalPayment,
    createPayment
  } = usePayment();

  const handlePayment = async () => {
    try {
      // Create payment
      const paymentData = await createPayment(
        selectedMethod,
        order.id,
        order.total || order.total_amount, // Handle different field names
        `Đơn hàng #${order.id}`
      );

      if (selectedMethod === PAYMENT_METHODS.COD) {
        onSuccess(paymentData);
        return;
      }

      if (selectedMethod === PAYMENT_METHODS.MOMO) {
        setShowQR(true);
        return;
      }

      // Process payment with 20s delay
      let result;
      switch (selectedMethod) {
        case PAYMENT_METHODS.ZALOPAY:
          result = await processZaloPayPayment(paymentData);
          break;
        case PAYMENT_METHODS.PAYPAL:
          result = await executePayPalPayment(paymentData.paymentId, paymentData.payerId);
          break;
        default:
          throw new Error('Invalid payment method');
      }

      if (result.status === 'success') {
        onSuccess(result);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const handleFinishPayment = () => {
      // In a real app, we might check status here.
      // For now, we assume user transferred and admin will verify.
      onSuccess({ status: 'pending', method: 'momo' });
  };

  const paymentOptions = [
    {
      value: PAYMENT_METHODS.MOMO,
      label: 'Momo',
      icon: <WalletOutlined />,
      description: 'Quét mã QR Momo'
    },
    {
      value: PAYMENT_METHODS.ZALOPAY,
      label: 'ZaloPay',
      icon: <WalletOutlined />,
      description: 'Thanh toán qua ví ZaloPay'
    },
    {
      value: PAYMENT_METHODS.PAYPAL,
      label: 'PayPal',
      icon: <CreditCardOutlined />,
      description: 'Thanh toán qua PayPal'
    },
    {
      value: PAYMENT_METHODS.COD,
      label: 'Thanh toán khi nhận hàng',
      icon: <DollarOutlined />,
      description: 'Thanh toán tiền mặt khi nhận hàng'
    }
  ];

  const progressPercent = countdown > 0 
    ? ((PAYMENT_PROCESSING_DELAY / 1000 - countdown) / (PAYMENT_PROCESSING_DELAY / 1000)) * 100 
    : 0;

  // Momo QR Data
  const momoPhone = "0909090909"; // Replace with actual phone
  const momoName = "NGUYEN VAN A"; // Replace with actual name
  const transferContent = `DH${order?.id}`;
  const amount = order?.total || order?.total_amount || 0;
  // Using VietQR for Momo (Momo supports VietQR standard now or we use a generic link)
  // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png
  // For Momo, bank ID is usually not supported directly in VietQR public API unless mapped to a bank.
  // But we can use a placeholder or just text instructions if VietQR doesn't support Momo wallet directly.
  // Actually, let's use a generic QR generator for the text string if it's a Momo link, 
  // OR just display the info.
  // Let's use a placeholder QR for now or a text QR.
  // A common way is to use a link: https://me.momo.vn/qr/<PHONE> (This might not work for auto-fill amount)
  // Let's stick to displaying the info clearly as requested.
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=2|99|${momoPhone}|${momoName}|${order?.email || ''}|0|0|${amount}|${transferContent}|transfer_myqr`; 
  // The above is a raw format attempt. Let's just use a simple text QR or a static image if we had one.
  // Better: Use VietQR with a Bank Account that links to Momo? No, user asked for Momo.
  // Let's just use a generic QR code that contains the phone number or a deep link.
  // Deep link: momo://?action=transfer&receiver=${momoPhone}&amount=${amount}&note=${transferContent}
  const momoDeepLink = `momo://?action=transfer&receiver=${momoPhone}&amount=${amount}&note=${transferContent}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(momoDeepLink)}`;

  const deadline = Date.now() + 60 * 60 * 1000; // 60 minutes

  return (
    <Modal
      title={showQR ? "Thanh toán Momo" : "Chọn phương thức thanh toán"}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      className="payment-modal"
    >
      <div className="payment-content">
        <div className="order-summary">
          <h3>Thông tin đơn hàng</h3>
          <div className="summary-row">
            <span>Mã đơn hàng:</span>
            <strong>#{order?.id}</strong>
          </div>
          <div className="summary-row">
            <span>Tổng tiền:</span>
            <strong className="total-amount">{formatCurrency(order?.total)}</strong>
          </div>
        </div>

        {showQR ? (
          <div className="qr-container" style={{ textAlign: 'center' }}>
            <Alert
              message="Vui lòng quét mã QR để thanh toán"
              description="Đơn hàng sẽ được xử lý sau khi admin xác nhận thanh toán."
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
            />
            
            <div style={{ marginBottom: 20 }}>
              <Image
                width={250}
                src={qrCodeUrl}
                fallback="https://via.placeholder.com/250?text=QR+Code+Error"
              />
            </div>

            <div className="payment-info-details" style={{ textAlign: 'left', background: '#f5f5f5', padding: 15, borderRadius: 8, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">Người nhận:</Text>
                <Text strong>{momoName}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">Số điện thoại:</Text>
                <Text strong>{momoPhone}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">Số tiền:</Text>
                <Text strong style={{ color: '#f50' }}>{formatCurrency(amount)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">Nội dung chuyển khoản:</Text>
                <Text strong copyable>{transferContent}</Text>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <Text type="secondary">Thời gian còn lại:</Text>
              <Countdown value={deadline} format="mm:ss" />
            </div>

            <Space>
              <Button onClick={() => setShowQR(false)}>Quay lại</Button>
              <Button type="primary" onClick={handleFinishPayment}>Đã thanh toán</Button>
            </Space>
          </div>
        ) : isProcessing ? (
          <div className="processing-container">
            <Alert
              message="Đang xử lý thanh toán"
              description={`Vui lòng chờ ${countdown} giây để hoàn tất giao dịch...`}
              type="info"
              showIcon
              icon={<LoadingOutlined />}
            />
            <Progress 
              percent={progressPercent} 
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <p className="processing-note">
              * Đây là mô phỏng thanh toán với thời gian xử lý 20 giây
            </p>
          </div>
        ) : (
          <>
            <Radio.Group
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="payment-methods"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {paymentOptions.map(option => (
                  <Radio key={option.value} value={option.value} className="payment-option">
                    <div className="payment-option-content">
                      <span className="payment-icon">{option.icon}</span>
                      <div className="payment-info">
                        <div className="payment-label">{option.label}</div>
                        <div className="payment-description">{option.description}</div>
                      </div>
                    </div>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>

            <div className="payment-actions">
              <Button onClick={onCancel}>
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handlePayment}
                disabled={!selectedMethod}
              >
                Thanh toán
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default PaymentModal;
