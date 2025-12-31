import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Button, InputNumber, Tag, Divider, Breadcrumb, Card, Typography, Space, message } from 'antd';
import { ShoppingCartOutlined, HomeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useProduct } from '../../hooks/useProduct';
import { useCart } from '../../context/CartContext';
import { formatCurrency, calculateDiscountedPrice } from '../../utils/helpers';
import Loading from '../../components/common/Loading';

const { Title, Text, Paragraph } = Typography;

const ProductDetailPage = () => {
  const { id } = useParams();
  const { product, isLoading } = useProduct(id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) return <Loading />;
  if (!product) return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <Title level={3}>Không tìm thấy sản phẩm</Title>
      <Link to="/products"><Button type="primary">Quay lại danh sách</Button></Link>
    </div>
  );

  const finalPrice = product.discount_percent > 0
    ? calculateDiscountedPrice(product.price, product.discount_percent)
    : product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    message.success('Đã thêm vào giỏ hàng');
  };

  return (
    <div style={{ padding: '20px 0', maxWidth: '1200px', margin: '0 auto' }}>
      <Breadcrumb style={{ marginBottom: '20px' }}>
        <Breadcrumb.Item>
          <Link to="/"><HomeOutlined /></Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/products">Sản phẩm</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Row gutter={[48, 32]}>
          {/* Product Image Section */}
          <Col xs={24} md={10} lg={10}>
            <div style={{ 
              width: '100%', 
              aspectRatio: '1/1',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #e8e8e8',
              position: 'relative'
            }}>
              <div style={{
                padding: '20px',
                textAlign: 'center'
              }}>
                <Title level={2} style={{ color: '#555', margin: 0 }}>{product.name}</Title>
                <Text type="secondary" style={{ fontSize: '16px', marginTop: '10px', display: 'block' }}>
                  {product.category_name}
                </Text>
              </div>
              
              {product.discount_percent > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: '#ff4d4f',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  -{product.discount_percent}%
                </div>
              )}
            </div>
          </Col>

          {/* Product Info Section */}
          <Col xs={24} md={14} lg={14}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={2} style={{ marginBottom: 8 }}>{product.name}</Title>
                <Space split={<Divider type="vertical" />}>
                  <Text type="secondary">Mã SP: #{product.id}</Text>
                  <Text type="success"><CheckCircleOutlined /> Còn hàng</Text>
                  <Text type="secondary">{product.category_name}</Text>
                </Space>
              </div>

              <div style={{ background: '#fafafa', padding: '20px', borderRadius: '8px' }}>
                <Space align="baseline">
                  <Title level={1} style={{ color: '#ff4d4f', margin: 0 }}>
                    {formatCurrency(finalPrice)}
                  </Title>
                  {product.discount_percent > 0 && (
                    <Text delete style={{ fontSize: '18px', color: '#999' }}>
                      {formatCurrency(product.price)}
                    </Text>
                  )}
                </Space>
              </div>

              <div>
                <Title level={5}>Mô tả sản phẩm:</Title>
                <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  {product.description || 'Chưa có mô tả cho sản phẩm này.'}
                </Paragraph>
              </div>

              <Divider />

              <div>
                <Title level={5} style={{ marginBottom: 16 }}>Số lượng:</Title>
                <Space size="large">
                  <InputNumber
                    min={1}
                    max={999}
                    value={quantity}
                    onChange={setQuantity}
                    size="large"
                    style={{ width: '120px' }}
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    style={{ 
                      height: '40px', 
                      padding: '0 40px',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                </Space>
              </div>

              <div style={{ marginTop: '20px' }}>
                <Space size={[0, 8]} wrap>
                  <Tag color="blue">Giao hàng nhanh</Tag>
                  <Tag color="green">Đảm bảo chất lượng</Tag>
                  <Tag color="orange">Đổi trả trong 7 ngày</Tag>
                </Space>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ProductDetailPage;
