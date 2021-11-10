import styled from '@emotion/styled';
import { useLocalObservable, useObserver } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import React, { useEffect } from 'react';
import { useGlobalStores } from '../../stores';
import { Table, message, Button, Modal, PageHeader } from 'antd';
import FlightDetails from '../flight-details/flight-details';

/* eslint-disable-next-line */
export interface SchedulesProps {}

const StyledSchedules = styled.div`
  color: pink;
`;

export function Schedules(props: SchedulesProps) {
  const { FlightStore, DatarefStore } = useGlobalStores();
  const localStore = useLocalObservable(() => ({
    showModal: false,
    dataBefore: {},
    toggleModal() {
      localStore.showModal = !localStore.showModal;
    },
  }));
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
      filters: FlightStore.scheduledFlights
        .filter(
          (thing, index, self) =>
            index === self.findIndex((t) => t.departure === thing.departure)
        )
        .map((flight) => {
          return {
            text: flight.departure as string,
            value: flight.departure as string,
          };
        })
        .sort((a, b) => {
          if (a.text < b.text) {
            return -1;
          }
          if (a.text > b.text) {
            return 1;
          }
          return 0;
        }),
      filterSearch: true,
      onFilter: (value: any, record: any) =>
        record.departure.indexOf(value) === 0,
    },
    {
      title: 'Destination',
      width: 80,
      dataIndex: 'destination',
      key: 'destination',
      filterSearch: true,
      filters: FlightStore.scheduledFlights
        .filter(
          (thing, index, self) =>
            index === self.findIndex((t) => t.destination === thing.destination)
        )
        .map((flight) => {
          return { text: flight.destination, value: flight.destination };
        })
        .sort((a, b) => {
          if (a.text < b.text) {
            return -1;
          }
          if (a.text > b.text) {
            return 1;
          }
          return 0;
        }),
      onFilter: (value: any, record: any) =>
        record.destination.indexOf(value) === 0,
    },
    {
      title: 'Aircraft Type',
      width: 100,
      dataIndex: 'aircraftType',
      key: 'aircraftType',

      filters: FlightStore.scheduledFlights
        .filter(
          (thing, index, self) =>
            index ===
            self.findIndex((t) => t.aircraftType === thing.aircraftType)
        )
        .map((flight) => {
          return { text: flight.aircraftType, value: flight.aircraftType };
        })
        .sort((a, b) => {
          if (a.text < b.text) {
            return -1;
          }
          if (a.text > b.text) {
            return 1;
          }
          return 0;
        }),
      onFilter: (value: any, record: any) =>
        record.aircraftType.indexOf(value) === 0,
      filterSearch: true,
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
    FlightStore.loadScheduledFlights();
  }, []);
  return useObserver(() => (
    <StyledSchedules>
      {' '}
      <Table
        title={() => <h2>Scheduled Flights</h2>}
        rowSelection={{
          type: 'radio',
          onSelect: (record, selected, rows, nativeEvent) => {
            runInAction(() => {
              localStore.dataBefore = DatarefStore.trackingFlight;
              DatarefStore.trackingFlight = {
                flightNumber: record.flightNumber,
                departure: record.departure,
                destination: record.destination,
                route: record.route,
              };
              localStore.toggleModal();
            });
          },
        }}
        columns={columns}
        dataSource={FlightStore.scheduledFlights}
        style={{
          maxHeight: '90%',
          width: '96%',
          marginLeft: '2%',
          marginBottom: '4vh',
        }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
      />
      <Modal
        title={null}
        visible={localStore.showModal}
        onCancel={localStore.toggleModal}
        footer={[
          <Button
            key="Cancel"
            type="primary"
            danger
            onClick={() => {
              DatarefStore.trackingFlight = localStore.dataBefore as any;
              localStore.toggleModal();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="track"
            type="primary"
            onClick={() => {
              localStore.toggleModal();
            }}
          >
            Track
          </Button>,
        ]}
        centered
        width={'85vw'}
        bodyStyle={{ height: '100%', overflowY: 'auto' }}
      >
        <PageHeader
          ghost={false}
          title="Booked Flights"
          style={{
            width: '98%',
            marginLeft: '1%',
          }}
          backIcon={false}
        >
          <FlightDetails size="default" />
        </PageHeader>
      </Modal>
    </StyledSchedules>
  ));
}

export default Schedules;
