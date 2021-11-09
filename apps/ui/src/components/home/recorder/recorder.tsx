import styled from '@emotion/styled';
import {
  Button,
  Col,
  PageHeader,
  Row,
  Divider,
  Descriptions,
  Badge,
} from 'antd';
import { useGlobalStores } from '../../../stores';
import { useObserver } from 'mobx-react-lite';
import React from 'react';

/* eslint-disable-next-line */
export interface RecorderProps {}

const StyledRecorder = styled.div`
  color: pink;
`;

export function Recorder(props: RecorderProps) {
  const { DatarefStore } = useGlobalStores();
  return useObserver(() => (
    <StyledRecorder>
      <Row>
        <PageHeader
          ghost={false}
          backIcon={false}
          title="Recorder Status"
          subTitle={
            <>
            TODO: only flip to green is last ts is within 10s?
              {DatarefStore.isDatarefWsConnected ? (
                <Badge status="success" />
              ) : (
                <Badge status="error" />
              )}{' '}
              Web Scoket
              <Divider type="vertical" />
              {DatarefStore.isXPlaneConnected ? (
                <Badge status="success" />
              ) : (
                <Badge status="error" />
              )}{' '}
              X Plane
            </>
          }
          style={{
            width: '96%',
            marginLeft: '2%',
          }}
        >
          {DatarefStore.isDatarefWsConnected
            ? JSON.stringify(DatarefStore.flightData)
            : 'NO'}
        </PageHeader>
      </Row>
    </StyledRecorder>
  ));
}

export default Recorder;
