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
import { useAuth } from '../../context/AuthContext';
import './PaymentModal.css';

const { Title, Text } = Typography;
const { Countdown } = Statistic;

const PaymentModal = ({ visible, onCancel, order, onSuccess, initialMethod }) => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState(initialMethod || PAYMENT_METHODS.MOMO);
  const [showQR, setShowQR] = useState(false);
  const {
    isProcessing,
    countdown,
    processMomoPayment,
    processZaloPayPayment,
    executePayPalPayment,
    createPayment
  } = usePayment();

  const isCOD = initialMethod === PAYMENT_METHODS.COD;

  useEffect(() => {
    if (visible && !isCOD && (initialMethod === PAYMENT_METHODS.MOMO || initialMethod === PAYMENT_METHODS.BANK_TRANSFER)) {
      setShowQR(true);
    }
  }, [visible, initialMethod, isCOD]);

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

      if (selectedMethod === PAYMENT_METHODS.MOMO || selectedMethod === PAYMENT_METHODS.BANK_TRANSFER) {
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
      onSuccess({ status: 'pending', method: selectedMethod });
  };

  const paymentOptions = [
    {
      value: PAYMENT_METHODS.BANK_TRANSFER,
      label: 'Chuyển khoản ngân hàng',
      icon: <QrcodeOutlined />,
      description: 'Quét mã QR ngân hàng (VietQR)'
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

  // Payment Data
  // Use User ID for transfer content if available, otherwise fallback to Order ID
  // Format: KH<UserID> or DH<OrderID>
  const transferContent = user ? `KH${user.id}` : `DH${order?.id}`;
  const amount = order?.total || order?.total_amount || 0;
  
  // Momo Data
  const momoPhone = "0909090909"; 
  const momoName = "NGUYEN VAN A";
  const momoDeepLink = `momo://?action=transfer&receiver=${momoPhone}&amount=${amount}&note=${transferContent}`;
  const momoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(momoDeepLink)}`;

  // Bank Transfer Data (VietQR)
  const bankId = "MB"; // MBBank
  const bankAccount = "0354367313";
  const bankName = "BUI QUANG NGHI";
  const bankQrUrl = `https://img.vietqr.io/image/${bankId}-${bankAccount}-compact.png?amount=${amount}&addInfo=${transferContent}&accountName=${encodeURIComponent(bankName)}`;

  const isBankTransfer = selectedMethod === PAYMENT_METHODS.BANK_TRANSFER;
  const qrCodeUrl = isBankTransfer ? bankQrUrl : momoQrUrl;
  const receiverName = isBankTransfer ? bankName : momoName;
  const receiverInfo = isBankTransfer ? bankAccount : momoPhone;
  const receiverLabel = isBankTransfer ? "Số tài khoản:" : "Số điện thoại:";

  const deadline = Date.now() + 60 * 60 * 1000; // 60 minutes

  const renderInvoice = () => (
    <div className="invoice-container">
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ color: '#1890ff' }}>HÓA ĐƠN BÁN HÀNG</Title>
        <Text type="secondary">Mã đơn hàng: <strong>#{order?.id}</strong></Text>
        <br />
        <Text type="secondary">Ngày đặt: {new Date().toLocaleDateString('vi-VN')}</Text>
      </div>

      <div className="customer-info-details" style={{ marginBottom: 20, padding: 15, background: '#f9f9f9', borderRadius: 8, border: '1px solid #eee' }}>
        <Title level={5} style={{ marginTop: 0 }}>Thông tin khách hàng</Title>
        <div style={{ marginBottom: 5 }}><strong>Họ tên:</strong> {order?.full_name || order?.shippingName}</div>
        <div style={{ marginBottom: 5 }}><strong>SĐT:</strong> {order?.phone || order?.shippingPhone}</div>
        <div><strong>Địa chỉ:</strong> {order?.address || order?.shippingAddress}</div>
      </div>

      <div className="order-items" style={{ marginBottom: 20 }}>
        <Title level={5}>Chi tiết đơn hàng</Title>
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: 4, padding: 10 }}>
            {order?.items?.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: index < (order.items?.length || 0) - 1 ? '1px solid #eee' : 'none' }}>
                    <div style={{ flex: 2 }}>
                        <Text strong>{item.product_name || item.name || item.title || 'Sản phẩm'}</Text>
                        <div><Text type="secondary">x{item.quantity}</Text></div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                        <Text>{formatCurrency((item.price || 0) * (item.quantity || 1))}</Text>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 10, borderTop: '2px solid #eee' }}>
        <Title level={4}>Tổng cộng:</Title>
        <Title level={4} type="danger">{formatCurrency(amount)}</Title>
      </div>

      {isBankTransfer && (
        <div className="qr-section" style={{ marginTop: 20, textAlign: 'center', borderTop: '2px dashed #ccc', paddingTop: 20 }}>
            <Title level={5} style={{ color: '#1890ff' }}>QUÉT MÃ ĐỂ THANH TOÁN</Title>
            <Image
                width={200}
                src={qrCodeUrl}
                fallback="https://via.placeholder.com/200?text=QR+Code+Error"
            />
            <div style={{ marginTop: 10 }}>
                <Text strong>{bankName}</Text>
                <br/>
                <Text>{bankAccount}</Text>
                <br/>
                <Text type="secondary">Nội dung: {transferContent}</Text>
            </div>
        </div>
      )}

      <div style={{ marginTop: 30, textAlign: 'center' }}>
        <Button type="primary" size="large" onClick={() => onSuccess({ status: 'success', method: selectedMethod })} block style={{ height: 50, fontSize: 18 }}>
          {isBankTransfer ? "Đã thanh toán" : "Hoàn tất đơn hàng"}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      className="payment-modal"
      closable={false}
      maskClosable={false}
    >
      {(isCOD || showQR) ? renderInvoice() : (
        <div className="payment-content">
        <div className="order-summary">
          <h3>Thông tin đơn hàng</h3>
          <div className="summary-row">
            <span>Mã đơn hàng:</span>
            <strong>#{order?.id}</strong>
          </div>
          <div className="summary-row">
            <span>Tổng tiền:</span>
            <strong className="total-amount">{formatCurrency(order?.total || order?.total_amount)}</strong>
          </div>
        </div>

        {isProcessing ? (
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
      )}
    </Modal>
  );
};

export default PaymentModal;
