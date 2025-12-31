import React from 'react';
import { Layout, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import {
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import './Footer.css';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter className="app-footer">
      <div className="footer-container">
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={6}>
            <h3>Siêu Thị ABC</h3>
            <p>Chuỗi siêu thị hàng đầu Việt Nam, cung cấp sản phẩm chất lượng với giá tốt nhất.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><FacebookOutlined /></a>
              <a href="#" aria-label="Instagram"><InstagramOutlined /></a>
              <a href="#" aria-label="Twitter"><TwitterOutlined /></a>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <h3>Danh mục</h3>
            <ul className="footer-links">
              <li><Link to="/products">Sản phẩm</Link></li>
              <li><Link to="/promotions">Khuyến mãi</Link></li>
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
            </ul>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <h3>Chính sách</h3>
            <ul className="footer-links">
              <li><Link to="/privacy">Chính sách bảo mật</Link></li>
              <li><Link to="/terms">Điều khoản sử dụng</Link></li>
              <li><Link to="/shipping">Chính sách vận chuyển</Link></li>
              <li><Link to="/return">Chính sách đổi trả</Link></li>
            </ul>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <h3>Liên hệ</h3>
            <ul className="footer-contact">
              <li>
                <PhoneOutlined /> 0354367313
              </li>
              <li>
                <MailOutlined /> 1303buiquanghi@gmail.com
              </li>
              <li>
                <EnvironmentOutlined /> 85, phố Đại An, Văn Quán, Hà Đông, Hà Nội
              </li>
            </ul>
          </Col>
        </Row>

        <div className="footer-bottom">
          <p>© 2024 Siêu Thị ABC. All rights reserved.</p>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;
