import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Upload, Card, message, Space } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

const { Option } = Select;
const { TextArea } = Input;

const ProductFormPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      if (res.success) {
        const product = res.data;
        form.setFieldsValue({
          name: product.name,
          price: product.price,
          stock: product.stock,
          category_id: product.category_id,
          description: product.description,
          unit: product.unit
        });
        if (product.images) {
          // Handle existing images if needed
        }
      }
    } catch (error) {
      message.error('Không thể tải thông tin sản phẩm');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      if (fileList.length > 0) {
        fileList.forEach(file => {
          formData.append('images', file.originFileObj);
        });
      }

      if (isEdit) {
        await api.put(`/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Thêm sản phẩm thành công');
      }
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList }) => setFileList(fileList);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/products')}>
          Quay lại
        </Button>
      </div>
      
      <Card title={isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>

          <Space style={{ display: 'flex', width: '100%' }} align="start">
            <Form.Item
              name="price"
              label="Giá bán"
              rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                addonAfter="VND"
              />
            </Form.Item>

            <Form.Item
              name="stock"
              label="Tồn kho"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
              style={{ flex: 1 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>

            <Form.Item
              name="unit"
              label="Đơn vị tính"
              style={{ flex: 1 }}
            >
              <Input placeholder="kg, hộp, cái..." />
            </Form.Item>
          </Space>

          <Form.Item
            name="category_id"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Hình ảnh">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              maxCount={5}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProductFormPage;
