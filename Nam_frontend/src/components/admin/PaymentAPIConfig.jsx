import React from 'react';
import { Card, Form, Input, InputNumber, Switch, Button, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import './PaymentAPIConfig.css';

const PaymentAPIConfig = ({ config, onSave }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      await onSave(values);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="payment-api-config">
      <Card title="Cấu hình API Thanh toán">
        <Form
          form={form}
          layout="vertical"
          initialValues={config}
          onFinish={handleSubmit}
        >
          <h3>Momo</h3>
          <Form.Item name={['momo', 'enabled']} valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
          <Form.Item name={['momo', 'partnerCode']} label="Partner Code">
            <Input />
          </Form.Item>
          <Form.Item name={['momo', 'accessKey']} label="Access Key">
            <Input.Password />
          </Form.Item>
          <Form.Item name={['momo', 'secretKey']} label="Secret Key">
            <Input.Password />
          </Form.Item>

          <h3>ZaloPay</h3>
          <Form.Item name={['zalopay', 'enabled']} valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
          <Form.Item name={['zalopay', 'appId']} label="App ID">
            <Input />
          </Form.Item>
          <Form.Item name={['zalopay', 'key1']} label="Key 1">
            <Input.Password />
          </Form.Item>
          <Form.Item name={['zalopay', 'key2']} label="Key 2">
            <Input.Password />
          </Form.Item>

          <h3>PayPal</h3>
          <Form.Item name={['paypal', 'enabled']} valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
          <Form.Item name={['paypal', 'clientId']} label="Client ID">
            <Input />
          </Form.Item>
          <Form.Item name={['paypal', 'clientSecret']} label="Client Secret">
            <Input.Password />
          </Form.Item>

          <h3>Cài đặt chung</h3>
          <Form.Item 
            name="processingDelay" 
            label="Thời gian xử lý (giây)"
            help="Thời gian mô phỏng xử lý thanh toán"
          >
            <InputNumber min={5} max={60} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Lưu cấu hình
              </Button>
              <Button onClick={() => form.resetFields()}>
                Đặt lại
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PaymentAPIConfig;
