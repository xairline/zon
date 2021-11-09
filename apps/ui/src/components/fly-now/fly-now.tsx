import styled from '@emotion/styled';
import { useObserver } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import React, { useEffect } from 'react';
import { useGlobalStores } from '../../stores';
import { Table, message } from 'antd';

/* eslint-disable-next-line */
export interface FlyNowProps {}

const StyledFlyNow = styled.div`
  color: pink;
`;

export function FlyNow(props: FlyNowProps) {
  const { FlightStore } = useGlobalStores();
  const columns = [
    {
      title: 'Flight #',
      key: 'flightNumber',
      width: 100,
      dataIndex: 'flightNumber',
    },
    {
      title: 'Departure',
      width: 80,
      dataIndex: 'departure',
      key: 'departure',
      filterSearch: true,
      filters: FlightStore.bookedFlights
        .filter(
          (thing, index, self) =>
            index === self.findIndex((t) => t.departure === thing.departure)
        )
        .map((flight) => {
          return { text: flight.departure, value: flight.departure };
        }),
      onFilter: (value: any, record: any) =>
        record.departure.indexOf(value) === 0,
    },
    {
      title: 'Destination',
      width: 80,
      dataIndex: 'destination',
      key: 'destination',
      filterSearch: true,
      filters: FlightStore.bookedFlights
        .filter(
          (thing, index, self) =>
            index === self.findIndex((t) => t.destination === thing.destination)
        )
        .map((flight) => {
          return { text: flight.destination, value: flight.destination };
        }),
      onFilter: (value: any, record: any) =>
        record.destination.indexOf(value) === 0,
    },
    {
      title: 'Aircraft Type',
      width: 100,
      dataIndex: 'aircraftType',
      key: 'aircraftType',
      filterSearch: true,
      filters: FlightStore.bookedFlights.map((flight) => {
        return { text: flight.aircraftType, value: flight.aircraftType };
      }),
      onFilter: (value: any, record: any) =>
        record.aircraftType.indexOf(value) === 0,
    },
    {
      title: 'Distance',
      width: 100,
      dataIndex: 'distance',
      key: 'distance',
      sorter: (a: any, b: any) => a.distance - b.distance,
      render: (value: number) => `${value} nm`,
    },
    {
      title: 'Total Flight Time',
      width: 100,
      dataIndex: 'totalFlightTime',
      key: 'totalFlightTime',
      sorter: (a: any, b: any) => a.totalFlightTime - b.totalFlightTime,
      render: (value: number) => `${value} hr`,
    },
  ];
  useEffect(() => {
    FlightStore.loadBookedFlights();
  }, []);
  return useObserver(() => (
    <StyledFlyNow>
      {' '}
      <Table
        title={() => <h2>Booked Flights</h2>}
        rowSelection={{
          type: 'radio',
          onSelect: (record, selected, rows, nativeEvent) => {
            message.info(JSON.stringify(record));
          },
        }}
        columns={columns}
        dataSource={FlightStore.bookedFlights}
        style={{
          height: '100%',
          width: '96%',
          marginLeft: '2%',
        }}
      />
    </StyledFlyNow>
  ));
}

export default FlyNow;
