import { makeObservable, observable, runInAction } from 'mobx';
import { Engine } from 'json-rules-engine';
import {
  DATAREF_FEQ,
  DATAREF_FEQ_LANDING,
  FlightData,
  FlightState,
  IPirep,
  Rules,
  XPlaneData,
} from '@zon/xplane-data';
import { notification } from 'antd';
import util from 'util';
import axios from 'axios';
import Worker from '../worker';
// import runways from './runways.json';
// const runwayData: any[] = runways as any[];
// console.log(runwayData.filter((runway) => runway.airport_ident === 'CYOW'));

const worker = new Worker();

let CruiseCounter = 0;
let ClimbCounter = 0;
let DescentCounter = 0;
let TakeoffCounter = 0;
let reportFiled = false;
class DatarefStore {
  @observable
  public lastDataref: number;
  @observable
  public lastWsPing: number;
  @observable
  public flightData!: FlightData;
  @observable
  public trackingFlight!: {
    flightNumber: string;
    departure: string;
    destination: string;
    route: string;
    aircraftType: string;
    lastPosReportTs?: number;
    passengers: number;
  };
  @observable
  public dataref!: any;

  private ws: WebSocket;
  private engine!: Engine;
  public rules!: Rules;

  constructor() {
    this?.ws?.close();
    window.electron.logger.info('websocket closed - constructor');
    this?.engine?.stop();
    window.electron.logger.info('rules Engine Stopped');

    this.trackingFlight = {
      flightNumber: 'ZE999',
      departure: '',
      destination: '',
      aircraftType: 'TBD',
      route: 'DCT',
      lastPosReportTs: 0,
      passengers: 0,
    };
    this.flightData = XPlaneData.initFlightData();
    this.dataref = {
      vs: 0,
      gs: 0,
      ias: 0,
      elevation: 0,
      aircraftRegistration: '',
      aircraftType: '',
    };

    this.ws = this.connect();
    makeObservable(this);
  }

  public isXPlaneConnected() {
    return Date.now() - this.lastDataref < 12 * 1000;
  }

  private connect() {
    this.rules = new Rules(this.flightData);
    this.engine = new Engine(this.rules.getRules());
    const ws = new WebSocket('ws://localhost:4444');
    let landingDataFeq = false;
    let normalDataFeq = false;
    let timeDelta = 0;
    let lastRecvTs = 0;
    ws.onopen = (msg) => {
      window.electron.logger.info(msg);
      window.electron.logger.info('Connected to backend');
      setInterval(function () {
        ws.send('ping');
      }, 5000);
    };
    ws.onclose = (msg) => {
      window.electron.logger.info(msg);
      window.electron.logger.info('Backend closed');
    };
    ws.onmessage = (msg) => {
      if (msg.data === 'pong') {
        runInAction(() => {
          this.lastWsPing = Date.now();
        });
        return;
      }
      runInAction(async () => {
        if (msg.data === 'xplane closed') {
          if (this.flightData.state === 'Parked') {
            this.resetTracking();
          }
          window.electron.logger.info('XPlane disconnected/closed');
          return;
        }
        try {
          this.lastDataref = Date.now();
          const flightDataArray: any[] = XPlaneData.processRawData(msg.data);
          worker.processData(
            msg.data,
            localStorage.getItem('username') as string,
            localStorage.getItem('password') as string
          );

          const {
            aircraftType,
            vs,
            gs,
            ias,
            elevation,
            fuelWeight,
            totalWeight,
            emptyWeight,
            lat,
            lng,
            heading,
            paused,
            zuluTimeSec: latestZuleTimeSec,
          } = flightDataArray[flightDataArray.length - 1];
          if (
            this.dataref.aircraftType !== '' &&
            this.dataref.aircraftType !== aircraftType &&
            this.dataref.aircraftType !== 'A21N'
          ) {
            // switching aircraft, reset tracking
            window.electron.logger.info(`Load new plane: ${aircraftType}`);
            this.resetTracking();
            return;
          }

          this.displayLatestDataref(
            vs,
            gs,
            ias,
            elevation,
            aircraftType,
            fuelWeight,
            totalWeight - fuelWeight - emptyWeight,
            emptyWeight
          );

          // intial state set to Parked
          if (!this.flightData.state) {
            XPlaneData.changeStateTo(
              this.flightData,
              'Parked',
              Date.now(),
              latestZuleTimeSec,
              Math.round(fuelWeight)
            );
            // get nearest airport
            axios
              .get(
                `https://ourairports.com/airports.json?min_lat=${
                  lat - 0.03
                }&min_lon=${lng - 0.03}&max_lat=${lat + 0.03}&max_lon=${
                  lng + 0.03
                }&strict=true&limit=1`
              )
              .then((res) => {
                runInAction(() => {
                  this.trackingFlight.departure = res?.data[0]?.ident;
                  window.electron.logger.info(
                    `Nearest Airport: ${res?.data[0]?.ident}`
                  );
                });
              });
            timeDelta =
              parseInt(`${Date.now()}`) - parseInt(flightDataArray[0].ts);
          }

          if (timeDelta === 0) {
            return;
          }

          this.posReport(lat, lng, heading, elevation, gs, paused);

          for (let i = 0; i < flightDataArray.length; i++) {
            const {
              ts,
              vs,
              agl,
              gs,
              gForce,
              gearForce,
              pitch,
              ias,
              n1,
              fuelWeight,
              elevation,
              paused,
              zuluTimeSec: currentZuluTimeSec,
            } = flightDataArray[i];
            // make sure we ignore older data
            if (ts < lastRecvTs) {
              window?.electron?.logger.warn(`dataref is too old`);
              continue;
            } else {
              lastRecvTs = ts;
            }
            const timestamp = Math.round(ts + timeDelta);
            const datarefNow = {
              ts: timestamp,
              vs,
              agl,
              gs,
              gForce,
              gearForce,
              pitch,
              ias,
              n1,
              elevation,
              state: this.flightData.state,
            };
            const { results } =
              paused !== 1
                ? await this.engine.run({
                    dataref: datarefNow,
                  })
                : { results: [] };
            // eslint-disable-next-line no-loop-func
            results.forEach((result) => {
              const nextState = result.event.type as FlightState;

              // set poll freq to 5hz after landing phase
              if (
                this.flightData.state === 'Landing' &&
                !normalDataFeq &&
                nextState === 'Taxi'
              ) {
                this.ws?.send(`${DATAREF_FEQ}`);
                normalDataFeq = true;
              }
              const stateChanged = this.changeState(
                nextState,
                timestamp,
                currentZuluTimeSec,
                fuelWeight
              );
              this.posReport(
                lat,
                lng,
                heading,
                elevation,
                gs,
                paused,
                stateChanged
              );
              if (stateChanged) {
                window?.electron?.logger.info(
                  `State change: ${util.inspect(datarefNow)}`
                );
              }
              //get Takeoff airport
              if (result.event.type === 'Takeoff') {
                axios
                  .get(
                    `https://ourairports.com/airports.json?min_lat=${
                      lat - 0.03
                    }&min_lon=${lng - 0.03}&max_lat=${lat + 0.03}&max_lon=${
                      lng + 0.03
                    }&strict=true&limit=1`
                  )
                  .then((res) => {
                    runInAction(() => {
                      this.trackingFlight.departure = res.data[0].ident;
                    });
                  });
              }
            });

            if (this.flightData.state === 'Landing') {
              if (!landingDataFeq) {
                this.ws?.send(`${DATAREF_FEQ_LANDING}`);
                landingDataFeq = true;
              }
              XPlaneData.calculateLandingData(
                gs,
                timestamp,
                vs,
                agl,
                gForce,
                gearForce,
                pitch,
                ias,
                fuelWeight,
                currentZuluTimeSec,
                lat,
                lng,
                this.flightData
              );
            }
            if (this.flightData.state === 'Engine Stopped') {
              XPlaneData.changeStateTo(
                this.flightData,
                'Engine Stopped',
                timestamp,
                currentZuluTimeSec,
                Math.round(fuelWeight)
              );
              this.posReport(lat, lng, heading, elevation, gs, paused);
              await this.createReport(lat, lng);
            }
          }
        } catch (e) {
          window.electron.logger.error(e);
          window.electron.logger.error(util.inspect(e));
          window.electron.logger.error(e.stack);
        }
      });
    };

    return ws;
  }

  private changeState(
    nextState: FlightState,
    timestamp: number,
    zuluTimeSec: number,
    fuelWeight: number
  ): boolean {
    let res = false;
    if (
      nextState !== 'Climb' &&
      nextState !== 'Descent' &&
      nextState !== 'Cruise' &&
      nextState !== 'Takeoff'
    ) {
      XPlaneData.changeStateTo(
        this.flightData,
        nextState as FlightState,
        timestamp,
        zuluTimeSec,
        Math.round(fuelWeight)
      );
      res = true;
    } else {
      CruiseCounter = nextState === 'Cruise' ? CruiseCounter + 1 : 0;
      ClimbCounter = nextState === 'Climb' ? ClimbCounter + 1 : 0;
      DescentCounter = nextState === 'Descent' ? DescentCounter + 1 : 0;
      TakeoffCounter = nextState === 'Takeoff' ? TakeoffCounter + 1 : 0;
      if (
        CruiseCounter > 20 * DATAREF_FEQ &&
        this.flightData.state !== nextState
      ) {
        XPlaneData.changeStateTo(
          this.flightData,
          'Cruise',
          timestamp,
          zuluTimeSec,
          Math.round(fuelWeight)
        );
        res = true;
        CruiseCounter = 0;
      }
      if (
        ClimbCounter > 10 * DATAREF_FEQ &&
        this.flightData.state !== nextState
      ) {
        XPlaneData.changeStateTo(
          this.flightData,
          'Climb',
          timestamp,
          zuluTimeSec,
          Math.round(fuelWeight)
        );
        res = true;
        ClimbCounter = 0;
      }
      if (
        DescentCounter > 20 * DATAREF_FEQ &&
        this.flightData.state !== nextState
      ) {
        XPlaneData.changeStateTo(
          this.flightData,
          'Descent',
          timestamp,
          zuluTimeSec,
          Math.round(fuelWeight)
        );
        res = true;
        DescentCounter = 0;
      }

      if (
        TakeoffCounter > 8 * DATAREF_FEQ &&
        this.flightData.state !== nextState
      ) {
        XPlaneData.changeStateTo(
          this.flightData,
          'Takeoff',
          timestamp,
          zuluTimeSec,
          Math.round(fuelWeight)
        );
        res = true;
        TakeoffCounter = 0;
      }
    }

    return res;
  }

  private displayLatestDataref(
    vs: number,
    gs: number,
    ias: number,
    elevation: number,
    aircraftType: string,
    fuelWeight: number,
    payloadWeight: number,
    emptyWeight: number
  ) {
    this.dataref.vs = vs;
    this.dataref.gs = gs;
    this.dataref.ias = ias;
    this.dataref.elevation = elevation;
    this.dataref.aircraftType =
      this.dataref.aircraftType !== 'A21N' ? aircraftType : 'A21N';
    this.dataref.fuelWeight = fuelWeight;
    this.dataref.payloadWeight = payloadWeight;
    this.dataref.emptyWeight = emptyWeight;
  }

  private posReport(
    lat: number,
    lng: number,
    heading: number,
    elevation: number,
    gs: number,
    paused: number,
    foreeUpdate = false
  ) {
    // skip pos report when sim is paused
    if (paused === 1) {
      return;
    }

    try {
      // POS report
      if (
        Date.now() - this.trackingFlight.lastPosReportTs > 3 * 60 * 1000 ||
        foreeUpdate
      ) {
        const posReprotTemplate = {
          latitudeDeg: XPlaneData.dataRoundup(lat),
          longitudeDeg: XPlaneData.dataRoundup(lng),
          headingDeg: XPlaneData.dataRoundup(heading),
          altitudeFt: Math.round(elevation * 3.28),
          speedGS: Math.round(gs * 1.9438),
          phase: this.flightData.state,
        };
        const req = {
          flight: {
            number: this.trackingFlight.flightNumber,
            aircraftType: this.dataref.aircraftType,
            departure: this.trackingFlight.departure,
            destination: this.trackingFlight.destination,
          },
          sample: posReprotTemplate,
        };
        axios
          .post('https://zonexecutive.com/action.php/acars/openfdr/flight', req)
          .catch((e: any) => {
            throw e;
          });
        this.trackingFlight.lastPosReportTs = Date.now();
        // window.electron.logger.info(
        //   `POS reported - ${JSON.stringify({
        //     lat,
        //     lng,
        //     heading,
        //     elevation,
        //     gs,
        //   })}`
        // );
      }
    } catch (error) {
      window.electron.logger.error('Failed to report POS');
      window.electron.logger.error(util.inspect(error));
      window.electron.logger.error(error.stack);
    }
  }

  public resetTracking() {
    runInAction(() => {
      this?.ws?.close();
      window.electron.logger.info('websocket closed - reset func');
      this?.engine?.stop();
      window.electron.logger.info('rules Engine Stopped');
      this.flightData = XPlaneData.initFlightData();

      CruiseCounter = 0;
      ClimbCounter = 0;
      DescentCounter = 0;
      TakeoffCounter = 0;

      reportFiled = false;

      this.trackingFlight = {
        flightNumber: 'ZE999',
        departure: '',
        destination: '',
        aircraftType: 'TBD',
        route: 'DCT',
        lastPosReportTs: 0,
        passengers: 0,
      };
      this.dataref = {
        vs: 0,
        gs: 0,
        ias: 0,
        elevation: 0,
        aircraftRegistration: '',
        aircraftType: '',
      };
      this.ws = this.connect();
      window.electron.logger.info('Tracking State Reset');
    });
  }

  private async createReport(lat, lng: number) {
    if (reportFiled) {
      return this;
    }
    reportFiled = true;
    let flightReqTemplate: IPirep;
    try {
      const timeOut = this.flightData.timeOut.system;
      const timeOff = this.flightData.timeOff.system;
      const timeOn = this.flightData.timeOn.system;
      const timeIn = this.flightData.timeIn.system;
      const fuelOut = this.flightData.fuelOut;
      const fuelOff = this.flightData.fuelOff;
      const fuelOn = this.flightData.fuelOn;
      const fuelIn = this.flightData.fuelIn;

      const response =
        (await axios
          .get(
            `https://ourairports.com/airports.json?min_lat=${
              lat - 0.03
            }&min_lon=${lng - 0.03}&max_lat=${lat + 0.03}&max_lon=${
              lng + 0.03
            }&strict=true&limit=1`
          )
          .catch((e) => {
            window.electron.logger.info(`Failed to get nearest airport`);
          })) || null;
      this.trackingFlight.destination =
        response?.data[0]?.ident || this.trackingFlight.destination;

      /**
       * xplane zule time sec is sec of the day
       * so we need to hanld the case where a flight
       * landed "UTC next day"
       */
      this.flightData.timeIn.sim =
        this.flightData.timeIn.sim < this.flightData.timeOut.sim
          ? this.flightData.timeIn.sim + 24 * 60 * 60
          : this.flightData.timeIn.sim;
      this.flightData.timeOn.sim =
        this.flightData.timeOn.sim < this.flightData.timeOff.sim
          ? this.flightData.timeOn.sim + 24 * 60 * 60
          : this.flightData.timeOn.sim;

      flightReqTemplate = {
        number: this.trackingFlight.flightNumber,
        aircraftType: this.dataref.aircraftType,
        //aircraftRegistration: this.dataref.aircraftRegistration,
        departure: this.trackingFlight.departure,
        destination: this.trackingFlight.destination,
        route: this.trackingFlight.route,
        timeOut: this.toIsoStringWithOffset(timeOut), // engine start
        timeOff: this.toIsoStringWithOffset(timeOff), // Takeoff
        timeOn: this.toIsoStringWithOffset(timeOn), // land
        timeIn: this.toIsoStringWithOffset(timeIn), // engine stop
        totalBlockTime: XPlaneData.dataRoundup(
          (this.flightData.timeIn.sim - this.flightData.timeOut.sim) / 60 / 60
        ), // from engine start to engine stop 79572.2734375 77769.1015625
        totalFlightTime: XPlaneData.dataRoundup(
          (this.flightData.timeOn.sim - this.flightData.timeOff.sim) / 60 / 60
        ), // from Takeoff to land
        dryOperatingWeight: this.dataref.emptyWeight,
        payloadWeight: this.dataref.payloadWeight,
        pax: this.trackingFlight.passengers,
        fuelOut,
        fuelOff,
        fuelOn,
        fuelIn,
        landingRate: Math.round(this.flightData.landingData.vs),
      };

      const res = await axios
        .post('https://zonexecutive.com/action.php/acars/openfdr/flight', {
          flight: flightReqTemplate,
        })
        .catch((e: any) => {
          throw e;
        });
      localStorage.setItem('lastFlight', res.data.data.id);
      window.electron.logger.info('PIREP filed');
      notification.success({
        message: 'PIREP Filed successfully',
        duration: 0,
        description: `${flightReqTemplate.number}: ${flightReqTemplate.departure} - ${flightReqTemplate.destination}`,
      });
    } catch (error) {
      window.electron.logger.error('Failed to file final report');
      window.electron.logger.error(util.inspect(error));
      window.electron.logger.error(error.stack);
      // store pirep for future submission
      const pirepFile = await window.electron.savePirep(flightReqTemplate);
      window.electron.logger.info(`PIREP stored: ${pirepFile}`);

      notification.warning({
        message: 'PIREP Failed',
        duration: 0,
        description: `${flightReqTemplate.number}: ${flightReqTemplate.departure} - ${flightReqTemplate.destination}`,
      });
    } finally {
      // store landing data
      localStorage.setItem(
        'lastFlightLandingData',
        JSON.stringify(this.flightData.landingData)
      );
      this.resetTracking();
    }
  }

  private toIsoStringWithOffset(utc) {
    const date = new Date(0); // The 0 there is the key, which sets the date to the epoch
    date.setUTCSeconds(parseInt(`${utc}`) / 1000);
    const tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = function (num) {
        const norm = Math.floor(Math.abs(num));
        return (norm < 10 ? '0' : '') + norm;
      };

    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds()) +
      dif +
      pad(tzo / 60) +
      ':' +
      pad(tzo % 60)
    );
  }
}
export const datarefStore = new DatarefStore();
