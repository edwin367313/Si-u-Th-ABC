import React from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Button, InputNumber, Tag, Divider } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useProduct } from '../../hooks/useProduct';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/helpers';
import Loading from '../../components/common/Loading';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { product, isLoading } = useProduct(id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = React.useState(1);

  if (isLoading) return <Loading />;
  if (!product) return <div>Không tìm thấy sản phẩm</div>;

  return (
    <div>
      <Row gutter={[32, 32]}>
        <Col xs={24} md={12}>
          <img src={product.image_url} alt={product.name} style={{ width: '100%' }} />
        </Col>
        <Col xs={24} md={12}>
          <h1>{product.name}</h1>
          {product.discount_percent > 0 && (
            <Tag color="red">-{product.discount_percent}%</Tag>
          )}
          <h2 style={{ color: '#ff4d4f' }}>{formatCurrency(product.price)}</h2>
          <Divider />
          <p>{product.description}</p>
          <Divider />
          <div>
            <InputNumber
              min={1}
              max={product.stock_quantity}
              value={quantity}
              onChange={setQuantity}
            />
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={() => addToCart(product, quantity)}
              style={{ marginLeft: 16 }}
            >
              Thêm vào giỏ hàng
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetailPage;
