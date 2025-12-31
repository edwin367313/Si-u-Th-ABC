import { useState, useEffect } from 'react';
import productService from '../services/productService';
import { useFetch, usePagination } from './useCommon';

/**
 * Hook for product operations
 */
export const useProducts = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    search: '',
    category_id: null,
    min_price: null,
    max_price: null,
    sort_by: 'created_at',
    sort_order: 'desc',
    ...initialFilters
  });

  const pagination = usePagination();

  const {
    data: productsData,
    isLoading,
    error,
    refetch
  } = useFetch(
    ['products', pagination.page, pagination.limit, filters],
    () => productService.getAll({
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    }),
    {
      onSuccess: (data) => {
        // Handle both response structures: { data: { products: [], ... } } or { products: [], ... }
        const responseData = data.data || data;
        if (responseData.pagination && responseData.pagination.total) {
          pagination.setTotal(responseData.pagination.total);
        } else if (responseData.total) {
          pagination.setTotal(responseData.total);
        }
      }
    }
  );

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    pagination.goToPage(1); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category_id: null,
      min_price: null,
      max_price: null,
      sort_by: 'created_at',
      sort_order: 'desc'
    });
    pagination.goToPage(1);
  };

  // Handle both response structures for products list
  const products = productsData?.data?.products || productsData?.products || [];

  return {
    products,
    pagination,
    filters,
    updateFilters,
    clearFilters,
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook for single product
 */
export const useProduct = (productId) => {
  const {
    data: product,
    isLoading,
    error,
    refetch
  } = useFetch(
    ['product', productId],
    () => productService.getById(productId),
    {
      enabled: !!productId
    }
  );

  return {
    product,
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook for product search
 */
export const useProductSearch = (keyword) => {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (keyword && keyword.length >= 2) {
      searchProducts(keyword);
    } else {
      setResults([]);
    }
  }, [keyword]);

  const searchProducts = async (searchKeyword) => {
    try {
      setIsSearching(true);
      const data = await productService.search(searchKeyword);
      setResults(data.products || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    results,
    isSearching
  };
};

export default {
  useProducts,
  useProduct,
  useProductSearch
};
