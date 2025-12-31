import React, { useState, useEffect } from 'react';
import { Row, Col, Carousel, Typography, Button, Card, Tag, Space, Statistic } from 'antd';
import { 
  ShoppingCartOutlined, 
  FireOutlined, 
  TrophyOutlined, 
  RocketOutlined,
  SafetyOutlined,
  GiftOutlined,
  ThunderboltOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../../hooks/useProduct';
import ProductList from '../../components/product/ProductList';
import FilterPanel from '../../components/common/FilterPanel';
import './HomePage.css';

const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { products, pagination, filters, updateFilters, clearFilters, isLoading } = useProducts({
    limit: 12
  });

  const heroSlides = [
    {
      title: '🎉 Siêu Sale Cuối Tuần',
      subtitle: 'Giảm giá lên đến 50% cho tất cả sản phẩm',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      image: '🛒',
      action: 'Mua ngay',
      link: '/products'
    },
    {
      title: '🔥 Flash Sale 12h',
      subtitle: 'Voucher 200K cho đơn hàng từ 2 triệu',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      image: '⚡',
      action: 'Săn deal',
      link: '/products?sale=true'
    },
    {
      title: '🎁 Freeship Toàn Quốc',
      subtitle: 'Miễn phí vận chuyển cho mọi đơn hàng',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      image: '🚚',
      action: 'Xem ngay',
      link: '/products'
    }
  ];

  const features = [
    {
      icon: <ThunderboltOutlined style={{ fontSize: 48, color: '#faad14' }} />,
      title: 'Giao hàng siêu tốc',
      desc: 'Nhận hàng trong 2h tại nội thành'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      title: 'Bảo đảm chất lượng',
      desc: 'Cam kết 100% hàng chính hãng'
    },
    {
      icon: <GiftOutlined style={{ fontSize: 48, color: '#eb2f96' }} />,
      title: 'Ưu đãi hấp dẫn',
      desc: 'Voucher và quà tặng mỗi ngày'
    },
    {
      icon: <CrownOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
      title: 'Tích điểm VIP',
      desc: 'Đổi điểm lấy quà giá trị'
    }
  ];

  const categories = [
    { name: '🥬 Thực phẩm tươi', color: '#52c41a', id: 1 },
    { name: '🍚 Thực phẩm khô', color: '#faad14', id: 2 },
    { name: '🥤 Đồ uống', color: '#1890ff', id: 3 },
    { name: '🍰 Bánh kẹo', color: '#eb2f96', id: 4 },
    { name: '🧂 Gia vị', color: '#fa8c16', id: 5 },
    { name: '🏠 Đồ gia dụng', color: '#13c2c2', id: 6 },
    { name: '🧴 Chăm sóc', color: '#722ed1', id: 7 }
  ];

  const stats = [
    { label: 'Sản phẩm', value: '10,000+', icon: '📦' },
    { label: 'Khách hàng', value: '50,000+', icon: '👥' },
    { label: 'Đơn hàng/ngày', value: '1,000+', icon: '🛒' },
    { label: 'Đánh giá 5⭐', value: '98%', icon: '⭐' }
  ];

  return (
    <div className="homepage-modern">
      {/* Hero Section with Gradient Carousel */}
      <section className="hero-section">
        <Carousel 
          autoplay 
          effect="fade"
          className="hero-carousel"
          afterChange={setCurrentSlide}
        >
          {heroSlides.map((slide, index) => (
            <div key={index}>
              <motion.div 
                className="hero-slide"
                style={{ background: slide.gradient }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <div className="hero-content">
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <div className="hero-emoji">{slide.image}</div>
                    <Title level={1} className="hero-title">
                      {slide.title}
                    </Title>
                    <Paragraph className="hero-subtitle">
                      {slide.subtitle}
                    </Paragraph>
                    <Button 
                      type="primary" 
                      size="large" 
                      className="hero-btn"
                      onClick={() => navigate(slide.link)}
                      icon={<ShoppingCartOutlined />}
                    >
                      {slide.action}
                    </Button>
                  </motion.div>
                </div>
                <div className="hero-decoration">
                  <div className="floating-shape shape-1"></div>
                  <div className="floating-shape shape-2"></div>
                  <div className="floating-shape shape-3"></div>
                </div>
              </motion.div>
            </div>
          ))}
        </Carousel>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <Row gutter={[24, 24]} justify="center">
          {stats.map((stat, index) => (
            <Col xs={12} sm={6} key={index}>
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="stat-card" hoverable>
                  <div className="stat-emoji">{stat.icon}</div>
                  <Statistic 
                    value={stat.value} 
                    title={stat.label}
                    valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                  />
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="feature-card" hoverable>
                  <div className="feature-icon">{feature.icon}</div>
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph>{feature.desc}</Paragraph>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <Title level={2} className="section-title">
          <FireOutlined /> Danh mục nổi bật
        </Title>
        <Row gutter={[16, 16]} justify="center">
          {categories.map((cat, index) => (
            <Col xs={12} sm={8} md={6} lg={3} key={index}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card 
                  className="category-card"
                  hoverable
                  onClick={() => navigate(`/products?category=${cat.id}`)}
                  style={{ borderTop: `4px solid ${cat.color}` }}
                >
                  <Text strong>{cat.name}</Text>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </section>

      {/* Hot Deals Section */}
      <section className="deals-section">
        <div className="section-header">
          <Space>
            <TrophyOutlined style={{ fontSize: 32, color: '#faad14' }} />
            <Title level={2} className="section-title">
              🔥 Deal hot hôm nay
            </Title>
          </Space>
          <Tag color="red" className="hot-tag">
            <ThunderboltOutlined /> Chỉ hôm nay
          </Tag>
        </div>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={6}>
            <FilterPanel
              filters={filters}
              onFilterChange={updateFilters}
              onClear={clearFilters}
            />
          </Col>

          <Col xs={24} lg={18}>
            <ProductList
              products={products}
              loading={isLoading}
              pagination={pagination}
              onPageChange={pagination.goToPage}
            />
          </Col>
        </Row>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
        >
          <Card className="newsletter-card">
            <Row align="middle" gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <div className="newsletter-icon">📬</div>
                <Title level={3}>Đăng ký nhận tin</Title>
                <Paragraph>
                  Nhận thông báo về ưu đãi và sản phẩm mới nhất
                </Paragraph>
              </Col>
              <Col xs={24} md={12}>
                <Space.Compact style={{ width: '100%' }} size="large">
                  <input 
                    type="email" 
                    placeholder="Nhập email của bạn..."
                    className="newsletter-input"
                  />
                  <Button type="primary" icon={<RocketOutlined />}>
                    Đăng ký
                  </Button>
                </Space.Compact>
              </Col>
            </Row>
          </Card>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
