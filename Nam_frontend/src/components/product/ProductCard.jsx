import React from 'react';
import { Card, Button, Tag } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency, calculateDiscountedPrice } from '../../utils/helpers';
import './ProductCard.css';

const { Meta } = Card;

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleViewDetail = () => {
    navigate(`/products/${product.id}`);
  };

  const finalPrice = product.discount_percent > 0
    ? calculateDiscountedPrice(product.price, product.discount_percent)
    : product.price;

  return (
    <Card
      hoverable
      className="product-card"
      cover={
        <div className="product-image-wrapper" onClick={handleViewDetail}>
          <div className="product-image-placeholder" style={{ 
              width: '100%', 
              height: '200px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: '#f0f0f0',
              color: '#333',
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '10px',
              textAlign: 'center'
            }}>
              <span>{product.name}</span>
            </div>
          {product.discount_percent > 0 && (
            <Tag color="red" className="discount-badge">
              -{product.discount_percent}%
            </Tag>
          )}
        </div>
      }
      actions={[
        <Button
          icon={<EyeOutlined />}
          onClick={handleViewDetail}
        >
          Xem
        </Button>,
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={handleAddToCart}
        >
          Thêm
        </Button>
      ]}
    >
      <Meta
        title={
          <div className="product-title" onClick={handleViewDetail}>
            {product.name}
          </div>
        }
        description={
          <div className="product-info">
            <div className="product-price">
              {product.discount_percent > 0 ? (
                <>
                  <span className="original-price">{formatCurrency(product.price)}</span>
                  <span className="discounted-price">{formatCurrency(finalPrice)}</span>
                </>
              ) : (
                <span className="discounted-price">{formatCurrency(product.price)}</span>
              )}
            </div>
            <div className="product-stock">
              <span className="in-stock">Còn hàng</span>
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default ProductCard;
