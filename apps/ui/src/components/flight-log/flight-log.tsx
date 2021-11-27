import styled from '@emotion/styled';
import { Button, Modal, PageHeader, Row, Table } from 'antd';
import { useLocalObservable, useObserver } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { useGlobalStores } from '../../stores';
import { Stats } from './stats/stats';

/* eslint-disable-next-line */
export interface FlightLogProps {}

const StyledFlightLog = styled.div`
  color: pink;
`;

export function FlightLog(props: FlightLogProps) {
  const { FlightStore, DatarefStore } = useGlobalStores();
  const localStore = useLocalObservable(() => ({
    showModal: false,
    flightNumber: '',
    toggleModal() {
      localStore.showModal = !localStore.showModal;
    },
  }));
  const columns = [
    {
      title: 'Flight #',
      key: 'flightNumber',
      width: 100,
      dataIndex: 'number',
    },
    {
      title: 'Departure',
      width: 80,
      dataIndex: 'departure',
      key: 'departure',
      filters: FlightStore.pastFlights
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
      filters: FlightStore.pastFlights
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

      filters: FlightStore.pastFlights
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
      title: 'Total Flight Time',
      width: 100,
      dataIndex: 'totalFlightTime',
      key: 'totalFlightTime',
      sorter: (a: any, b: any) => a.totalFlightTime - b.totalFlightTime,
      render: (value: number) =>
        `${Math.trunc(value)}h ${Math.round((value % 1) * 60)}m`,
    },
    {
      title: 'Time In',
      width: 100,
      dataIndex: 'timeIn',
      key: 'timeIn',
      sorter: (a: any, b: any) =>
        new Date(a.timeIn).getTime() - new Date(b.timeIn).getTime(),
    },
  ];
  useEffect(() => {
    FlightStore.loadPastFlights();
  }, []);
  return useObserver(() => (
    <StyledFlightLog>
      {' '}
      <Row>
        <Table
          title={() => <h2>Logbook</h2>}
          rowSelection={{
            type: 'radio',
            onSelect: (record, selected, rows, nativeEvent) => {
              //message.info(JSON.stringify(record));
              // runInAction(() => {
              //   localStore.flightNumber = record.number;
              //   localStore.toggleModal();
              // });
            },
          }}
          columns={columns}
          dataSource={FlightStore.pastFlights}
          style={{
            maxHeight: '95%',
            width: '96%',
            marginLeft: '2%',
            marginTop: '4vh',
          }}
          pagination={{ pageSize: 5, showSizeChanger: false }}
        />
      </Row>
      <Row>{localStorage.getItem('lastFlightLandingData') && <Stats />}</Row>
      <Modal
        title={null}
        visible={localStore.showModal}
        onCancel={localStore.toggleModal}
        footer={[
          <Button
            key="Close"
            type="primary"
            onClick={() => {
              localStore.toggleModal();
            }}
          >
            Close
          </Button>,
        ]}
        centered
        width={'85vw'}
        bodyStyle={{ height: '100%', overflowY: 'auto' }}
      >
        <PageHeader
          ghost={false}
          title={localStore.flightNumber}
          style={{
            width: '98%',
            marginLeft: '1%',
          }}
          backIcon={false}
        >
          TODO
        </PageHeader>
      </Modal>
    </StyledFlightLog>
  ));
}

export default FlightLog;
