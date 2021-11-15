import styled from '@emotion/styled';
import { XPlaneData } from '@zon/xplane-data';
import { Descriptions } from 'antd';
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
      <Descriptions size={(props.size as any) || 'small'} column={2}>
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
            ? XPlaneData.dataRoundup(DatarefStore.dataref.elevation * 3.28)
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
        <Descriptions.Item label="Aircraft Type">
          {DatarefStore?.dataref?.aircraftType || ''}
        </Descriptions.Item>
        <Descriptions.Item label="Aircraft Registration">
          {DatarefStore?.dataref?.aircraftRegistration || ''}
        </Descriptions.Item>
        <Descriptions.Item label="Fuel">
          {XPlaneData.dataRoundup(DatarefStore?.dataref?.fuelWeight || '')} kg
        </Descriptions.Item>
        <Descriptions.Item label="Payload">
          {XPlaneData.dataRoundup(DatarefStore?.dataref?.payloadWeight || '')} kg
        </Descriptions.Item>
        <Descriptions.Item label="Route">
          {DatarefStore.trackingFlight.route}
        </Descriptions.Item>
      </Descriptions>
    </StyledFlightDetails>
  ));
}

export default FlightDetails;
