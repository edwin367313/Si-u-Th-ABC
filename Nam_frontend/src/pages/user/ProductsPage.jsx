import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProduct';
import ProductList from '../../components/product/ProductList';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const { products, pagination, isLoading, updateFilters } = useProducts({ limit: 12 });

  useEffect(() => {
    if (searchQuery) {
      updateFilters({ search: searchQuery });
    } else {
      // Clear search filter if no query param
      updateFilters({ search: '' });
    }
  }, [searchQuery]);

  return (
    <div>
      <h1>{searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : 'Sản phẩm'}</h1>
      <ProductList
        products={products}
        loading={isLoading}
        pagination={pagination}
        onPageChange={pagination.goToPage}
      />
    </div>
  );
};

export default ProductsPage;
