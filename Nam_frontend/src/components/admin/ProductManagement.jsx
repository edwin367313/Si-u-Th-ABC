import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import productService from '../../services/productService';
import ImageUploader from './ImageUploader';
import { formatCurrency } from '../../utils/helpers';

const { Option } = Select;

const ProductManagement = ({ products, categories, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      render: (url) => <img src={url} alt="" style={{ width: 50, height: 50, objectFit: 'cover' }} />
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      sorter: true
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_name'
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      render: (price) => formatCurrency(price),
      sorter: true
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discount_percent',
      render: (discount) => discount ? `${discount}%` : '-'
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock_quantity',
      sorter: true
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa sản phẩm?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await productService.delete(id);
      message.success('Xóa sản phẩm thành công');
      onRefresh();
    } catch (error) {
      message.error('Xóa sản phẩm thất bại');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, values);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await productService.create(values);
        message.success('Thêm sản phẩm thành công');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingProduct(null);
      onRefresh();
    } catch (error) {
      message.error('Lưu sản phẩm thất bại');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingProduct(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Thêm sản phẩm
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select>
              {categories?.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="price"
              label="Giá"
              rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
            >
              <InputNumber min={0} style={{ width: 200 }} />
            </Form.Item>

            <Form.Item
              name="discount_percent"
              label="Giảm giá (%)"
            >
              <InputNumber min={0} max={100} style={{ width: 150 }} />
            </Form.Item>

            <Form.Item
              name="stock_quantity"
              label="Tồn kho"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
            >
              <InputNumber min={0} style={{ width: 150 }} />
            </Form.Item>
          </Space>

          <Form.Item name="image_url" label="URL ảnh">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingProduct ? 'Cập nhật' : 'Thêm'}
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;
