import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './Loading.css';

const Loading = ({ tip = 'Đang tải...', size = 'large', fullscreen = false }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />;

  if (fullscreen) {
    return (
      <div className="loading-fullscreen">
        <Spin indicator={antIcon} size={size} tip={tip} />
      </div>
    );
  }

  return (
    <div className="loading-container">
      <Spin indicator={antIcon} size={size} tip={tip} />
    </div>
  );
};

export default Loading;
