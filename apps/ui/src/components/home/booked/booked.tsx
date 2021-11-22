import React, { useEffect } from 'react';
import { useLocalObservable, useObserver } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import {
  Table,
  message,
  Row,
  PageHeader,
  Button,
  Descriptions,
  Divider,
  Modal,
  Input,
} from 'antd';
import styled from '@emotion/styled';
import { useGlobalStores } from '../../../stores';
import FlightDetails from '../../flight-details/flight-details';
import axios from 'axios';
import xml2js from 'xml2js';
import util from 'util';
/* eslint-disable-next-line */
export interface BookedProps {}

const StyledBooked = styled.div``;

export function Booked(props: BookedProps) {
  const { FlightStore, DatarefStore, PilotStore } = useGlobalStores();
  const localStore = useLocalObservable(() => ({
    showModal: false,
    dataBefore: {},
    simBriefUsername: '',
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
      filterSearch: true,
      filters: FlightStore.bookedFlights
        .filter(
          (thing, index, self) =>
            index === self.findIndex((t) => t.departure === thing.departure)
        )
        .map((flight) => {
          return { text: flight.departure, value: flight.departure };
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
      filters: FlightStore.bookedFlights
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
      render: (value: number) =>
        `${Math.round(value)}h ${Math.round((value % 1) * 100)}m`,
    },
  ];
  useEffect(() => {
    FlightStore.loadBookedFlights();
  }, []);
  return useObserver(() => (
    <StyledBooked>
      <Row>
        <PageHeader
          ghost={false}
          title="Booked Flights"
          style={{
            width: '96%',
            marginLeft: '2%',
          }}
          extra={[
            <Input
              placeholder="SimBrief Username"
              onChange={(e) => {
                localStorage.setItem('simbriefUsername', e.target.value);
                runInAction(() => {
                  localStore.simBriefUsername = e.target.value;
                });
              }}
              defaultValue={localStorage.getItem('simbriefUsername')}
              style={{ width: '12vw' }}
            ></Input>,
            <Button
              type="primary"
              disabled={PilotStore.offline}
              onClick={async () => {
                try {
                  const simBriefResponse = await axios
                    .get(
                      `https://www.simbrief.com/api/xml.fetcher.php?username=${localStorage.getItem(
                        'simbriefUsername'
                      )}`
                    )
                    .catch((e: any) => {
                      throw e;
                    });
                  const simBriefPlanObj = await xml2js.parseStringPromise(
                    simBriefResponse.data
                  );
                  runInAction(() => {
                    DatarefStore.resetTracking();
                    localStore.dataBefore = DatarefStore.trackingFlight;
                    DatarefStore.trackingFlight = {
                      flightNumber: simBriefPlanObj.OFP.atc[0].callsign[0],
                      departure: simBriefPlanObj.OFP.origin[0].icao_code[0],
                      destination:
                        simBriefPlanObj.OFP.destination[0].icao_code[0],
                      aircraftType: simBriefPlanObj.OFP.aircraft[0].icaocode[0],
                      route: simBriefPlanObj.OFP.general[0].route[0],
                      passengers: simBriefPlanObj.OFP.general[0].passengers.reduce(
                        (p, c) => (p += c * 1),
                        0
                      ),
                      lastPosReportTs: 0,
                    };
                    window.electron.logger.info(
                      `Filght plan loaded from simBrief for: ${localStorage.getItem(
                        'simbriefUsername'
                      )}`
                    );
                    localStore.toggleModal();
                  });
                } catch (error) {
                  window.electron.logger.error('Failed to load from simBrief');
                  window.electron.logger.error(util.inspect(error));
                  window.electron.logger.error(error.stack);
                }
              }}
            >
              Load from SimBrief
            </Button>,
          ]}
          backIcon={false}
        >
          <Table
            rowSelection={{
              type: 'radio',
              onSelect: (record, selected, rows, nativeEvent) => {
                runInAction(() => {
                  DatarefStore.resetTracking();
                  localStore.dataBefore = DatarefStore.trackingFlight;
                  DatarefStore.trackingFlight = {
                    flightNumber: record.flightNumber,
                    departure: record.departure,
                    destination: record.destination,
                    aircraftType: record.aircraftType,
                    route: record.route,
                    passengers: 0,
                    lastPosReportTs: 0,
                  };
                  localStore.toggleModal();
                });
              },
            }}
            columns={columns}
            dataSource={FlightStore.bookedFlights}
            style={{
              height: '100%',
            }}
            pagination={{ pageSize: 2, showSizeChanger: false }}
          />
        </PageHeader>
      </Row>
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
    </StyledBooked>
  ));
}

export default Booked;
