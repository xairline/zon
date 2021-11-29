import styled from '@emotion/styled';
import {
  Badge,
  Button,
  Col,
  PageHeader,
  Popconfirm,
  Row,
  Timeline,
} from 'antd';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
import TimeAgo from 'react-timeago';
import { useGlobalStores } from '../../../stores';
import FlightDetails from '../../flight-details/flight-details';

/* eslint-disable-next-line */
export interface RecorderProps {}

const StyledRecorder = styled.div`
  color: pink;
`;

export function Recorder(props: RecorderProps) {
  const { DatarefStore } = useGlobalStores();
  return useObserver(() => (
    <StyledRecorder>
      <PageHeader
        ghost={false}
        backIcon={false}
        title="Recorder Status"
        subTitle={
          <>
            {DatarefStore.isXPlaneConnected ? (
              <>
                <Badge status="success" />
                {'Connected: '}
                <TimeAgo date={DatarefStore.lastDataref} />
              </>
            ) : (
              <>
                <Badge status="error" />
                {'Disconnected'}
              </>
            )}{' '}
          </>
        }
        style={{
          width: '96%',
          marginLeft: '2%',
          minHeight: '60vh',
          maxHeight: '60vh',
          height: '60vh',
          overflowY: 'auto',
        }}
        extra={[
          <Popconfirm
            title="Are sure you want to reset tracker? All data in progress will be lost!"
            onConfirm={async () => {
              DatarefStore.resetTracking();
            }}
          >
            <Button danger key="2" type="primary" color="red">
              Reset Tracking
            </Button>
          </Popconfirm>,
        ]}
      >
        <Row
          style={{
            overflowY: 'auto',
          }}
        >
          <Col span={14}>
            <FlightDetails size="small" />
          </Col>
          <Col span={10}>
            <Timeline
              pending={
                DatarefStore.isXPlaneConnected
                  ? false
                  : 'Waiting for X Plane ...'
              }
              style={{
                marginTop: '8px',
                marginLeft: '32px',
              }}
            >
              {DatarefStore?.flightData?.events.map((event: string) => (
                <Timeline.Item key={event}>{event}</Timeline.Item>
              ))}
            </Timeline>
          </Col>
        </Row>
      </PageHeader>
    </StyledRecorder>
  ));
}

export default Recorder;
