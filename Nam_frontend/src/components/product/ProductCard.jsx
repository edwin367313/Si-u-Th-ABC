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
          <img
            alt={product.name}
            src={product.image_url || '/placeholder.png'}
            className="product-image"
          />
          {product.discount_percent > 0 && (
            <Tag color="red" className="discount-badge">
              -{product.discount_percent}%
            </Tag>
          )}
          {product.stock_quantity === 0 && (
            <div className="out-of-stock-overlay">
              <span>Hết hàng</span>
            </div>
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
          disabled={product.stock_quantity === 0}
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
              {product.stock_quantity > 0 ? (
                <span className="in-stock">Còn {product.stock_quantity} sản phẩm</span>
              ) : (
                <span className="out-of-stock">Hết hàng</span>
              )}
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default ProductCard;
