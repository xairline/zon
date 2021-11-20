import styled from '@emotion/styled';
import { XPlaneData } from '@zon/xplane-data';
import { Descriptions, Input } from 'antd';
import { runInAction } from 'mobx';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
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
          {DatarefStore?.dataref?.aircraftType || ''}
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
          {XPlaneData.dataRoundup(DatarefStore?.dataref?.fuelWeight || '')} kg
        </Descriptions.Item>
        <Descriptions.Item label="Payload">
          {XPlaneData.dataRoundup(DatarefStore?.dataref?.payloadWeight || '')}{' '}
          kg
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
            style={{ minHeight: '8vh' }}
          />
        </Descriptions.Item>
      </Descriptions>
    </StyledFlightDetails>
  ));
}

export default FlightDetails;
