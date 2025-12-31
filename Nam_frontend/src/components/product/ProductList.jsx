import React from 'react';
import { Row, Col, Pagination, Empty } from 'antd';
import ProductCard from './ProductCard';
import Loading from '../common/Loading';
import './ProductList.css';

const ProductList = ({
  products = [],
  loading = false,
  pagination = null,
  onPageChange = null
}) => {
  if (loading) {
    return <Loading tip="Đang tải sản phẩm..." />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-products">
        <Empty description="Không tìm thấy sản phẩm nào" />
      </div>
    );
  }

  return (
    <div className="product-list">
      <Row gutter={[16, 16]}>
        {products.map(product => (
          <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>

      {pagination && pagination.total > 0 && (
        <div className="pagination-wrapper">
          <Pagination
            current={pagination.page}
            total={pagination.total}
            pageSize={pagination.limit}
            onChange={onPageChange}
            showSizeChanger={false}
            showTotal={(total) => `Tổng ${total} sản phẩm`}
          />
        </div>
      )}
    </div>
  );
};

export default ProductList;
