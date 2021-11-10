import styled from '@emotion/styled';
import { XPlaneData } from '@zon/xplane-data';
import { Badge, Col, Descriptions, PageHeader, Row, Timeline } from 'antd';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
import { useGlobalStores } from '../../../stores';

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
          <Row>
            <Col span={18}>
              <Descriptions size="small" column={2}>
                <Descriptions.Item label="Flight Number">
                  {DatarefStore.trackingFlight.flightNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Speed">
                  {DatarefStore.isXPlaneConnected
                    ? XPlaneData.dataRoundup(DatarefStore.dataref.ias)
                    : '--'}{' '}
                  Knots
                </Descriptions.Item>
                <Descriptions.Item label="ALT">
                  {DatarefStore.isXPlaneConnected
                    ? XPlaneData.dataRoundup(
                        DatarefStore.dataref.elevation * 3.28
                      )
                    : '--'}{' '}
                  ft
                </Descriptions.Item>
                <Descriptions.Item label="VS">
                  {DatarefStore.isXPlaneConnected
                    ? XPlaneData.dataRoundup(DatarefStore.dataref.vs * 196.85)
                    : '--'}{' '}
                  ft/min
                </Descriptions.Item>
                <Descriptions.Item label="Departure">
                  {DatarefStore.trackingFlight.departure}
                </Descriptions.Item>
                <Descriptions.Item label="Arrival">
                  {DatarefStore.trackingFlight.destination}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={6}>
              <Timeline
                pending={
                  DatarefStore.isXPlaneConnected
                    ? false
                    : 'Waiting for X Plane ...'
                }
              >
                {DatarefStore?.flightData?.events.map((event: string) => (
                  <Timeline.Item key={event}>{event}</Timeline.Item>
                ))}
              </Timeline>
            </Col>
          </Row>
        </PageHeader>
      </Row>
    </StyledRecorder>
  ));
}

export default Recorder;
