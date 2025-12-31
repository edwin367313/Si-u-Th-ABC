import React from 'react';
import { Card, Row, Col, Select } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RevenuePage = () => {
  const data = [
    { month: 'T1', revenue: 4000 },
    { month: 'T2', revenue: 3000 },
    { month: 'T3', revenue: 5000 },
    { month: 'T4', revenue: 4500 },
    { month: 'T5', revenue: 6000 },
    { month: 'T6', revenue: 5500 }
  ];

  return (
    <div>
      <h1>Báo cáo doanh thu</h1>
      <div style={{ marginBottom: 16 }}>
        <Select defaultValue="month" style={{ width: 200 }}>
          <Select.Option value="month">Theo tháng</Select.Option>
          <Select.Option value="quarter">Theo quý</Select.Option>
          <Select.Option value="year">Theo năm</Select.Option>
        </Select>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Biểu đồ doanh thu">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RevenuePage;
