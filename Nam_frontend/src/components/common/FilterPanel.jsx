import React from 'react';
import { Input, Select, Slider, Button, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import './FilterPanel.css';

const { Option } = Select;

const FilterPanel = ({
  categories = [],
  filters = {},
  onFilterChange,
  onClear
}) => {
  const priceMarks = {
    0: '0đ',
    1000000: '1tr',
    5000000: '5tr',
    10000000: '10tr'
  };

  return (
    <div className="filter-panel">
      <h3>Bộ lọc</h3>

      <div className="filter-group">
        <label>Tìm kiếm</label>
        <Input
          placeholder="Tên sản phẩm..."
          prefix={<SearchOutlined />}
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          allowClear
        />
      </div>

      <div className="filter-group">
        <label>Danh mục</label>
        <Select
          placeholder="Chọn danh mục"
          value={filters.category_id}
          onChange={(value) => onFilterChange({ category_id: value })}
          style={{ width: '100%' }}
          allowClear
        >
          {categories.map(cat => (
            <Option key={cat.id} value={cat.id}>{cat.name}</Option>
          ))}
        </Select>
      </div>

      <div className="filter-group">
        <label>Khoảng giá</label>
        <Slider
          range
          min={0}
          max={10000000}
          step={100000}
          marks={priceMarks}
          value={[filters.min_price || 0, filters.max_price || 10000000]}
          onChange={([min, max]) => onFilterChange({ min_price: min, max_price: max })}
          tipFormatter={(value) => `${(value / 1000000).toFixed(1)}tr`}
        />
      </div>

      <div className="filter-group">
        <label>Sắp xếp</label>
        <Select
          value={`${filters.sort_by}-${filters.sort_order}`}
          onChange={(value) => {
            const [sort_by, sort_order] = value.split('-');
            onFilterChange({ sort_by, sort_order });
          }}
          style={{ width: '100%' }}
        >
          <Option value="created_at-desc">Mới nhất</Option>
          <Option value="created_at-asc">Cũ nhất</Option>
          <Option value="price-asc">Giá tăng dần</Option>
          <Option value="price-desc">Giá giảm dần</Option>
          <Option value="name-asc">Tên A-Z</Option>
          <Option value="name-desc">Tên Z-A</Option>
        </Select>
      </div>

      <Button
        icon={<ClearOutlined />}
        onClick={onClear}
        block
      >
        Xóa bộ lọc
      </Button>
    </div>
  );
};

export default FilterPanel;
