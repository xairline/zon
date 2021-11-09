import styled from '@emotion/styled';
import { Button, Col, PageHeader, Row, Divider } from 'antd';
import React from 'react';

/* eslint-disable-next-line */
export interface StatsProps {}

const StyledStats = styled.div`
  color: pink;
`;

export function Stats(props: StatsProps) {
  return (
    <StyledStats>
      <Row>
        <PageHeader
          ghost={false}
          title="Stats"
          style={{
            width: '96%',
            marginLeft: '2%',
          }}
          backIcon={false}
        >
          <Row>
            <Col span={11}>landing</Col>
            <Divider type="vertical" />
            <Col span={11}>flights</Col>
          </Row>
        </PageHeader>
      </Row>
    </StyledStats>
  );
}

export default Stats;
