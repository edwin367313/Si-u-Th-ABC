import React from 'react';
import { Card, Button, Space, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import themeService from '../../services/themeService';
import { useTheme } from '../../context/ThemeContext';

const ThemesPage = () => {
  const { changeTheme, effectsEnabled, toggleEffects } = useTheme();
  const presets = themeService.getPresets();

  return (
    <div>
      <h1>Quản lý giao diện</h1>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <span>Hiệu ứng mùa:</span>
          <Switch checked={effectsEnabled} onChange={toggleEffects} />
        </Space>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
        {presets.map(theme => (
          <Card
            key={theme.type}
            title={theme.name}
            extra={
              <Button
                type="primary"
                size="small"
                onClick={() => changeTheme(theme)}
              >
                Áp dụng
              </Button>
            }
          >
            <div style={{ textAlign: 'center', fontSize: 48 }}>
              {theme.config.iconUrl}
            </div>
            <p style={{ textAlign: 'center', marginTop: 8 }}>
              Hiệu ứng: {theme.config.effectType}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ThemesPage;
