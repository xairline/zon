import styled from '@emotion/styled';
import { XPlaneData } from '@zon/xplane-data';
import { Badge, Button, Descriptions, Divider, Input } from 'antd';
import { runInAction } from 'mobx';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
import TimeAgo from 'react-timeago';
import { useGlobalStores } from '../../stores';

/* eslint-disable-next-line */
export interface FlightDetailsProps {
  size: string;
}

const StyledFlightDetails = styled.div`
  color: pink;
`;

export function FlightDetails(props: FlightDetailsProps) {
  const { DatarefStore } = useGlobalStores();
  return useObserver(() => (
    <StyledFlightDetails>
      <Descriptions size={(props.size as any) || 'small'} bordered column={2}>
        <Descriptions.Item label="X Plane UDP" style={{ width: '200px' }}>
          <>
            <Badge
              status={DatarefStore.isXPlaneConnected() ? 'success' : 'error'}
            />
            <TimeAgo date={DatarefStore.lastDataref} />
          </>
        </Descriptions.Item>
        <Descriptions.Item label="Backend" style={{ width: '180px' }}>
          <>
            <Badge
              status={
                Date.now() - DatarefStore.lastWsPing < 10000
                  ? 'success'
                  : 'error'
              }
            />
            <TimeAgo date={DatarefStore.lastWsPing} />
          </>
        </Descriptions.Item>
        <Descriptions.Item label="Flight Number">
          <Input
            defaultValue={DatarefStore.trackingFlight.flightNumber}
            value={DatarefStore.trackingFlight.flightNumber}
            onChange={(e) => {
              runInAction(() => {
                DatarefStore.trackingFlight.flightNumber = e.target.value;
              });
            }}
            style={{ width: '96px' }}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Speed">
          {DatarefStore.isXPlaneConnected
            ? Math.round(DatarefStore.dataref.ias)
            : '--'}{' '}
          Knots
        </Descriptions.Item>
        <Descriptions.Item label="ALT">
          {DatarefStore.isXPlaneConnected
            ? Math.round(DatarefStore.dataref.elevation * 3.28)
            : '--'}{' '}
          ft
        </Descriptions.Item>
        <Descriptions.Item label="VS">
          {DatarefStore.isXPlaneConnected
            ? Math.round(DatarefStore.dataref.vs)
            : '--'}{' '}
          ft/min
        </Descriptions.Item>
        <Descriptions.Item label="Departure">
          <Input
            defaultValue={DatarefStore.trackingFlight.departure}
            value={DatarefStore.trackingFlight.departure}
            onChange={(e) => {
              runInAction(() => {
                DatarefStore.trackingFlight.departure = e.target.value;
              });
            }}
            style={{ width: '96px' }}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Arrival">
          <Input
            defaultValue={DatarefStore.trackingFlight.destination}
            value={DatarefStore.trackingFlight.destination}
            onChange={(e) => {
              runInAction(() => {
                DatarefStore.trackingFlight.destination = e.target.value;
              });
            }}
            style={{ width: '96px' }}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Aircraft Type">
          <>
            {DatarefStore?.dataref?.aircraftType || ''}
            {DatarefStore?.dataref?.aircraftType === 'A321' && (
              <Button
                type="primary"
                danger
                size="small"
                style={{ marginLeft: '8px' }}
                onClick={() => {
                  DatarefStore.dataref.aircraftType = 'A21N';
                }}
              >
                NEO
              </Button>
            )}
            {DatarefStore?.dataref?.aircraftType === 'B77L' && (
              <Button
                type="primary"
                danger
                size="small"
                style={{ marginLeft: '8px' }}
                onClick={() => {
                  DatarefStore.dataref.aircraftType = 'B77F';
                }}
              >
                B77F
              </Button>
            )}
          </>
        </Descriptions.Item>
        <Descriptions.Item label="Pax">
          <Input
            defaultValue={DatarefStore?.trackingFlight.passengers || ''}
            value={DatarefStore?.trackingFlight.passengers || ''}
            onChange={(e) => {
              runInAction(() => {
                DatarefStore.trackingFlight.passengers = parseInt(
                  e.target.value
                );
              });
            }}
            style={{ width: '96px' }}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Fuel">
          {XPlaneData.dataRoundup(DatarefStore?.dataref?.fuelWeight || 0)} kg{' '}
          <br />
          {XPlaneData.dataRoundup(
            DatarefStore?.dataref?.fuelWeight * 2.20462 || 0
          )}{' '}
          lbs
        </Descriptions.Item>
        <Descriptions.Item label="Payload">
          {XPlaneData.dataRoundup(DatarefStore?.dataref?.payloadWeight || 0)} kg
          <br />
          {XPlaneData.dataRoundup(
            DatarefStore?.dataref?.payloadWeight * 2.20462 || 0
          )}{' '}
          lbs
        </Descriptions.Item>
        <Descriptions.Item label="Route">
          <Input.TextArea
            defaultValue={DatarefStore.trackingFlight.route}
            value={DatarefStore.trackingFlight.route}
            onChange={(e) => {
              runInAction(() => {
                DatarefStore.trackingFlight.route = e.target.value;
              });
            }}
            autoSize={{ minRows: 3, maxRows: 8 }}
          />
        </Descriptions.Item>
      </Descriptions>
    </StyledFlightDetails>
  ));
}

export default FlightDetails;
