import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Statistic, Table, Button, DatePicker, message } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpOutlined, ArrowDownOutlined, DownloadOutlined } from '@ant-design/icons';
import revenueService from '../../services/revenueService';
import { formatCurrency } from '../../utils/helpers';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const RevenuePage = () => {
  const [overview, setOverview] = useState({
    dailyRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalOrders: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchOverview = async () => {
    try {
      const res = await revenueService.getOverview();
      if (res.success) {
        setOverview(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const res = await revenueService.getMonthlyRevenue(year);
      if (res.success) {
        // Transform data for chart
        const chartData = Array.from({ length: 12 }, (_, i) => {
          const monthData = res.data.results.find(item => item.month === i + 1);
          return {
            month: `T${i + 1}`,
            revenue: monthData ? monthData.revenue : 0,
            orders: monthData ? monthData.orders : 0
          };
        });
        setMonthlyData(chartData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const res = await revenueService.getTopProducts();
      if (res.success) {
        setTopProducts(res.data.products);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategoryData = async () => {
    try {
      const res = await revenueService.getRevenueByCategory();
      if (res.success) {
        setCategoryData(res.data.categories);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchOverview(),
      fetchMonthlyData(),
      fetchTopProducts(),
      fetchCategoryData()
    ]).finally(() => setLoading(false));
  }, [year]);

  const handleExport = async () => {
    try {
      const startDate = dayjs().startOf('year').format('YYYY-MM-DD');
      const endDate = dayjs().endOf('year').format('YYYY-MM-DD');
      const blob = await revenueService.exportReport(startDate, endDate);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `revenue_report_${year}.xlsx`); // Assuming backend returns excel/csv
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Không thể xuất báo cáo');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Báo cáo doanh thu</h1>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
          Xuất báo cáo năm nay
        </Button>
      </div>

      {/* Overview Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Doanh thu hôm nay" 
              value={overview.dailyRevenue} 
              formatter={val => formatCurrency(val)}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Doanh thu tháng này" 
              value={overview.monthlyRevenue} 
              formatter={val => formatCurrency(val)}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Doanh thu năm nay" 
              value={overview.yearlyRevenue} 
              formatter={val => formatCurrency(val)}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Tổng đơn hàng (Đã giao)" 
              value={overview.totalOrders} 
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card title={`Biểu đồ doanh thu năm ${year}`} extra={
            <Select defaultValue={year} onChange={setYear} style={{ width: 100 }}>
              <Select.Option value={2024}>2024</Select.Option>
              <Select.Option value={2025}>2025</Select.Option>
              <Select.Option value={2026}>2026</Select.Option>
            </Select>
          }>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name="Đơn hàng" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Tỷ trọng theo danh mục">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Top Products */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Top 5 sản phẩm bán chạy nhất">
            <Table 
              dataSource={topProducts} 
              rowKey="id"
              pagination={false}
              columns={[
                { title: 'Sản phẩm', dataIndex: 'name', key: 'name' },
                { title: 'Số lượng bán', dataIndex: 'sold_quantity', key: 'sold_quantity' },
                { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', render: val => formatCurrency(val) }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RevenuePage;
