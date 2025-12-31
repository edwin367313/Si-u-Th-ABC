import React from 'react';
import { Card, Row, Col, Button, Switch, ColorPicker, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import themeService from '../../services/themeService';
import './ThemeManager.css';

const ThemeManager = () => {
  const { activeTheme, changeTheme, effectsEnabled, toggleEffects } = useTheme();
  const presets = themeService.getPresets();

  return (
    <div className="theme-manager">
      <Card title="Cài đặt hiệu ứng">
        <Space>
          <span>Bật/Tắt hiệu ứng mùa:</span>
          <Switch
            checked={effectsEnabled}
            onChange={toggleEffects}
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
          />
        </Space>
        <p style={{ marginTop: 12, color: '#666', fontSize: 13 }}>
          Hiệu ứng mùa bao gồm: Pháo hoa Tết, hoa xuân, lá thu, tuyết đông...
        </p>
      </Card>

      <Card title="Theme mùa" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          {presets.map((theme) => (
            <Col xs={24} sm={12} md={8} lg={6} key={theme.type}>
              <Card
                hoverable
                className={`theme-card ${activeTheme?.type === theme.type ? 'active' : ''}`}
              >
                <div className="theme-icon">{theme.config.iconUrl}</div>
                <h3>{theme.name}</h3>
                <p className="theme-effect">Hiệu ứng: {theme.config.effectType}</p>
                <div className="theme-colors">
                  <div
                    className="color-box"
                    style={{ backgroundColor: theme.config.primaryColor }}
                    title="Màu chính"
                  />
                  <div
                    className="color-box"
                    style={{ backgroundColor: theme.config.secondaryColor }}
                    title="Màu phụ"
                  />
                </div>
                <Button
                  type={activeTheme?.type === theme.type ? 'primary' : 'default'}
                  block
                  onClick={() => changeTheme(theme)}
                  style={{ marginTop: 12 }}
                >
                  {activeTheme?.type === theme.type ? 'Đang áp dụng' : 'Áp dụng'}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="Theme tùy chỉnh" style={{ marginTop: 16 }}>
        <p style={{ color: '#666' }}>
          Tính năng tạo theme tùy chỉnh đang được phát triển...
        </p>
        <Button icon={<PlusOutlined />} disabled>
          Tạo theme mới
        </Button>
      </Card>
    </div>
  );
};

export default ThemeManager;
