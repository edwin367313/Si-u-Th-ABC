import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tabs, 
  Spin, 
  message, 
  Tag,
  Typography,
  Space,
  Button,
  DatePicker,
  Select
} from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  LineChartOutlined,
  ClusterOutlined,
  TeamOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import api from '../../utils/api';
import './Analytics.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [revenueAnalysis, setRevenueAnalysis] = useState(null);
  const [productClusters, setProductClusters] = useState(null);
  const [customerSegmentation, setCustomerSegmentation] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  
  const [predictDays, setPredictDays] = useState(30);
  const [clusterK, setClusterK] = useState(5);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchRevenueAnalysis(),
        fetchProductClusters(),
        fetchCustomerSegmentation(),
        fetchTopProducts(),
        fetchMonthlyRevenue()
      ]);
      message.success('Đã tải dữ liệu phân tích');
    } catch (error) {
      message.error('Lỗi tải dữ liệu phân tích');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error('Dashboard stats error:', error);
    }
  };

  const fetchRevenueAnalysis = async () => {
    try {
      const response = await api.get(`/analytics/revenue-analysis?predictDays=${predictDays}`);
      if (response.data.success) {
        setRevenueAnalysis(response.data.data);
      }
    } catch (error) {
      console.error('Revenue analysis error:', error);
    }
  };

  const fetchProductClusters = async () => {
    try {
      const response = await api.get(`/analytics/product-clusters?k=${clusterK}`);
      if (response.data.success) {
        setProductClusters(response.data.data);
      }
    } catch (error) {
      console.error('Product clusters error:', error);
    }
  };

  const fetchCustomerSegmentation = async () => {
    try {
      const response = await api.get('/analytics/customer-segmentation');
      if (response.data.success) {
        setCustomerSegmentation(response.data.data);
      }
    } catch (error) {
      console.error('Customer segmentation error:', error);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const response = await api.get('/analytics/top-products?limit=10&days=30');
      if (response.data.success) {
        setTopProducts(response.data.data);
      }
    } catch (error) {
      console.error('Top products error:', error);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const response = await api.get('/analytics/monthly-revenue?months=12');
      if (response.data.success) {
        setMonthlyRevenue(response.data.data);
      }
    } catch (error) {
      console.error('Monthly revenue error:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Render Dashboard Overview
  const renderDashboard = () => (
    <div className="dashboard-overview">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={dashboardStats?.total_revenue || 0}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={dashboardStats?.total_orders || 0}
              prefix={<ShoppingOutlined />}
              formatter={formatNumber}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách hàng"
              value={dashboardStats?.total_customers || 0}
              prefix={<UserOutlined />}
              formatter={formatNumber}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Giá trị TB đơn hàng"
              value={dashboardStats?.avg_order_value || 0}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu 12 tháng gần nhất">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Doanh thu" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Top 5 sản phẩm bán chạy">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_sold" fill="#82ca9d" name="Đã bán" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Render Revenue Analysis (Linear Regression)
  const renderRevenueAnalysis = () => {
    if (!revenueAnalysis) return <Spin />;

    const combinedData = [
      ...(revenueAnalysis.historical || []).map(item => ({
        date: item.date,
        actual: parseFloat(item.revenue),
        predicted: item.predicted
      })),
      ...(revenueAnalysis.prediction || []).map(item => ({
        date: item.date,
        predicted: item.predicted_revenue
      }))
    ];

    return (
      <div className="revenue-analysis">
        <Card 
          title={<><LineChartOutlined /> Phân tích xu hướng doanh thu (Linear Regression)</>}
          extra={
            <Space>
              <Select value={predictDays} onChange={(val) => setPredictDays(val)} style={{ width: 150 }}>
                <Option value={7}>Dự đoán 7 ngày</Option>
                <Option value={14}>Dự đoán 14 ngày</Option>
                <Option value={30}>Dự đoán 30 ngày</Option>
                <Option value={60}>Dự đoán 60 ngày</Option>
              </Select>
              <Button type="primary" onClick={fetchRevenueAnalysis}>Cập nhật</Button>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#8884d8" 
                    name="Doanh thu thực tế"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#ff7300" 
                    strokeDasharray="5 5"
                    name="Dự đoán"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Xu hướng"
                  value={revenueAnalysis.trend === 'increasing' ? 'Tăng' : revenueAnalysis.trend === 'decreasing' ? 'Giảm' : 'Ổn định'}
                  prefix={revenueAnalysis.trend === 'increasing' ? <RiseOutlined /> : <FallOutlined />}
                  valueStyle={{ color: revenueAnalysis.trend === 'increasing' ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Độ chính xác (R²)"
                  value={(revenueAnalysis.r_squared * 100).toFixed(2)}
                  suffix="%"
                  valueStyle={{ color: revenueAnalysis.r_squared > 0.7 ? '#3f8600' : '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Doanh thu TB/ngày"
                  value={revenueAnalysis.average_daily_revenue}
                  formatter={(value) => formatCurrency(value)}
                />
              </Card>
            </Col>
          </Row>

          <Card size="small" style={{ marginTop: 16 }}>
            <Title level={5}>Giải thích mô hình</Title>
            <Paragraph>
              <Text strong>Linear Regression</Text> phân tích xu hướng doanh thu dựa trên dữ liệu lịch sử.
              Độ chính xác R² = {(revenueAnalysis.r_squared * 100).toFixed(2)}% 
              {revenueAnalysis.r_squared > 0.7 ? ' (Tốt)' : revenueAnalysis.r_squared > 0.5 ? ' (Trung bình)' : ' (Thấp)'}.
            </Paragraph>
            <Paragraph>
              Hệ số slope = {revenueAnalysis.slope?.toFixed(2)} cho thấy doanh thu trung bình 
              {revenueAnalysis.slope > 0 ? ' tăng ' : ' giảm '} 
              {formatCurrency(Math.abs(revenueAnalysis.slope))} mỗi ngày.
            </Paragraph>
          </Card>
        </Card>
      </div>
    );
  };

  // Render Product Clusters (K-Means)
  const renderProductClusters = () => {
    if (!productClusters) return <Spin />;

    const clusterData = productClusters.clusters?.map(cluster => ({
      name: cluster.cluster_name,
      value: cluster.product_count,
      revenue: cluster.total_revenue
    })) || [];

    const scatterData = productClusters.clusters?.flatMap(cluster =>
      cluster.products.map(p => ({
        x: p.price,
        y: p.total_sold,
        name: p.name,
        cluster: cluster.cluster_name
      }))
    ) || [];

    return (
      <div className="product-clusters">
        <Card 
          title={<><ClusterOutlined /> Phân cụm sản phẩm theo tên (K-Means)</>}
          extra={
            <Space>
              <Select value={clusterK} onChange={(val) => setClusterK(val)} style={{ width: 120 }}>
                <Option value={3}>3 cụm</Option>
                <Option value={4}>4 cụm</Option>
                <Option value={5}>5 cụm</Option>
                <Option value={6}>6 cụm</Option>
                <Option value={7}>7 cụm</Option>
              </Select>
              <Button type="primary" onClick={fetchProductClusters}>Cập nhật</Button>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card size="small" title="Phân bố sản phẩm theo cụm">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={clusterData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {clusterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card size="small" title="Giá vs Doanh số">
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis dataKey="x" name="Giá" />
                    <YAxis dataKey="y" name="Đã bán" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Sản phẩm" data={scatterData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {productClusters.clusters?.map((cluster, index) => (
              <Col xs={24} lg={12} key={cluster.cluster_id}>
                <Card 
                  size="small"
                  title={
                    <Space>
                      <Tag color={COLORS[index % COLORS.length]}>{cluster.cluster_name}</Tag>
                      <Text type="secondary">({cluster.product_count} sản phẩm)</Text>
                    </Space>
                  }
                >
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <Statistic
                        title="Giá trung bình"
                        value={cluster.avg_price}
                        formatter={(val) => formatCurrency(val)}
                        valueStyle={{ fontSize: 14 }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Tổng doanh thu"
                        value={cluster.total_revenue}
                        formatter={(val) => formatCurrency(val)}
                        valueStyle={{ fontSize: 14 }}
                      />
                    </Col>
                  </Row>
                  <div style={{ marginTop: 8, maxHeight: 150, overflowY: 'auto' }}>
                    {cluster.products.slice(0, 5).map(product => (
                      <div key={product.id} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <Text ellipsis style={{ fontSize: 12 }}>
                          {product.name} - {formatCurrency(product.price)}
                        </Text>
                      </div>
                    ))}
                    {cluster.products.length > 5 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        ... và {cluster.products.length - 5} sản phẩm khác
                      </Text>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Card size="small" style={{ marginTop: 16 }}>
            <Title level={5}>Giải thích thuật toán K-Means</Title>
            <Paragraph>
              <Text strong>K-Means Clustering</Text> tự động phân loại sản phẩm thành {clusterK} nhóm dựa trên:
            </Paragraph>
            <ul>
              <li><Text strong>Tên sản phẩm:</Text> Phân tích từ khóa như 'rau', 'củ', 'quả', 'thịt', 'cá', 'sữa', 'mì', 'gia vị'...</li>
              <li><Text strong>Giá bán:</Text> Phân loại sản phẩm giá rẻ, trung bình, cao cấp</li>
              <li><Text strong>Doanh số:</Text> Đánh giá hiệu suất bán hàng của từng sản phẩm</li>
            </ul>
            <Paragraph>
              Tổng số: {productClusters.summary?.total_products} sản phẩm được phân thành {productClusters.summary?.k} cụm.
            </Paragraph>
          </Card>
        </Card>
      </div>
    );
  };

  // Render Customer Segmentation (Decision Tree)
  const renderCustomerSegmentation = () => {
    if (!customerSegmentation) return <Spin />;

    const segmentData = customerSegmentation.segments?.map(seg => ({
      name: seg.segment,
      value: seg.count,
      revenue: seg.total_revenue
    })) || [];

    const columns = [
      {
        title: 'Phân khúc',
        dataIndex: 'segment',
        key: 'segment',
        render: (text, record) => (
          <Space direction="vertical" size="small">
            <Tag color={record.tier === 1 ? 'gold' : record.tier === 2 ? 'blue' : record.tier === 3 ? 'green' : 'default'}>
              {text}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
          </Space>
        )
      },
      {
        title: 'Số lượng',
        dataIndex: 'count',
        key: 'count',
        sorter: (a, b) => a.count - b.count,
        render: (val) => formatNumber(val)
      },
      {
        title: 'Doanh thu',
        dataIndex: 'total_revenue',
        key: 'total_revenue',
        sorter: (a, b) => a.total_revenue - b.total_revenue,
        render: (val) => formatCurrency(val)
      },
      {
        title: 'Giá trị TB/đơn',
        dataIndex: 'avg_order_value',
        key: 'avg_order_value',
        sorter: (a, b) => a.avg_order_value - b.avg_order_value,
        render: (val) => formatCurrency(val)
      },
      {
        title: 'Hành động đề xuất',
        dataIndex: 'action',
        key: 'action',
        render: (text) => <Text style={{ fontSize: 12 }}>{text}</Text>
      }
    ];

    return (
      <div className="customer-segmentation">
        <Card title={<><TeamOutlined /> Phân loại khách hàng (Decision Tree)</>}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card size="small" title="Phân bố khách hàng">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card size="small" title="Doanh thu theo phân khúc">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={segmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Doanh thu" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={customerSegmentation.segments}
            rowKey="segment"
            pagination={false}
            style={{ marginTop: 16 }}
          />

          <Card size="small" style={{ marginTop: 16 }}>
            <Title level={5}>Giải thích Decision Tree</Title>
            <Paragraph>
              <Text strong>Decision Tree</Text> phân loại khách hàng thành các nhóm dựa trên:
            </Paragraph>
            <ul>
              <li><Text strong>Tổng chi tiêu:</Text> Chia thành VIP (≥10tr), Trung bình (3-10tr), Thấp ({'<'}3tr)</li>
              <li><Text strong>Số đơn hàng:</Text> Đánh giá tần suất mua hàng</li>
              <li><Text strong>Thời gian từ đơn cuối:</Text> Xác định khách hàng còn active hay đã rời bỏ</li>
            </ul>
            <Paragraph>
              <Text strong>Thống kê:</Text> {customerSegmentation.summary?.total_customers} khách hàng,
              tổng doanh thu {formatCurrency(customerSegmentation.summary?.total_revenue)},
              giá trị trung bình {formatCurrency(customerSegmentation.summary?.avg_customer_value)}/khách.
            </Paragraph>
          </Card>
        </Card>
      </div>
    );
  };

  if (loading && !dashboardStats) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Đang tải dữ liệu phân tích..." />
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <Title level={2}>Phân tích & Báo cáo</Title>
      
      <Tabs defaultActiveKey="dashboard" size="large">
        <TabPane tab="Dashboard" key="dashboard">
          {renderDashboard()}
        </TabPane>
        
        <TabPane tab="Dự đoán doanh thu (Linear Regression)" key="revenue">
          {renderRevenueAnalysis()}
        </TabPane>
        
        <TabPane tab="Phân cụm sản phẩm (K-Means)" key="clusters">
          {renderProductClusters()}
        </TabPane>
        
        <TabPane tab="Phân loại khách hàng (Decision Tree)" key="segmentation">
          {renderCustomerSegmentation()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Analytics;
