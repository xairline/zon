import styled from '@emotion/styled';
import { Button, Col, PageHeader, Row, Divider, Descriptions } from 'antd';
import React from 'react';

/* eslint-disable-next-line */
export interface RecorderProps {}

const StyledRecorder = styled.div`
  color: pink;
`;

export function Recorder(props: RecorderProps) {
  return (
    <StyledRecorder>
      <Row>
        <PageHeader
          ghost={false}
          backIcon={false}
          title="Recorder Status"
          subTitle="TODO: status icon with tooltips"
          style={{
            width: '96%',
            marginLeft: '2%',
          }}
        ></PageHeader>
      </Row>
    </StyledRecorder>
  );
}

export default Recorder;
