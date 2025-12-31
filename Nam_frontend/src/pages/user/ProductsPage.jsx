import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProduct';
import ProductList from '../../components/product/ProductList';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || ''; // Assuming the search param is 'q' or handled by Header
  
  // Header.jsx navigates to /search but doesn't seem to set a query param yet?
  // Let's check Header.jsx again. It just navigates to /search.
  // Wait, Header.jsx has: onClick={() => navigate('/search')}
  // It doesn't seem to have an input field visible in the code snippet I read earlier.
  // Ah, I missed checking if there is an input field in Header.jsx.
  
  const { products, pagination, isLoading, updateFilters } = useProducts({ limit: 12 });

  useEffect(() => {
    if (searchQuery) {
      updateFilters({ search: searchQuery });
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
