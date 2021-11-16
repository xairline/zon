import { makeObservable, observable, runInAction } from 'mobx';
import { AllConditions, Engine } from 'json-rules-engine';
import {
  DATAREF_FEQ,
  FlightData,
  FlightState,
  Rules,
  XPlaneData,
} from '@zon/xplane-data';
import axios from 'axios';
import runways from './runways.json';
// const runwayData: any[] = runways as any[];
// console.log(runwayData.filter((runway) => runway.airport_ident === 'CYOW'));
class DatarefStore {
  @observable
  public isXPlaneConnected: boolean;
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
    this.isXPlaneConnected = false;
    this?.ws?.close();
    window.electron.logger.info('websocket closed');
    this?.engine?.stop();
    window.electron.logger.info('rules engine stopped');

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

  private connect() {
    this.rules = new Rules(this.flightData);
    this.engine = new Engine(this.rules.getRules());
    const ws = new WebSocket('ws://localhost:4444');
    let cruiseCounter = 0;
    let climbCounter = 0;
    let descendCounter = 0;
    let landingDataFeq = false;
    let timeDelta = 0;

    ws.onmessage = (msg) => {
      runInAction(async () => {
        if (msg.data === 'xplane closed') {
          this.isXPlaneConnected = false;
          this.resetTracking();
          return;
        }
        try {
          this.isXPlaneConnected = true;
          const flightDataArray: any[] = XPlaneData.processRawData(msg.data);

          const {
            aircraftRegistration,
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
          } = flightDataArray[flightDataArray.length - 1];
          this.dataref.vs = vs;
          this.dataref.gs = gs;
          this.dataref.ias = ias;
          this.dataref.elevation = elevation;
          this.dataref.aircraftRegistration = aircraftRegistration;
          this.dataref.aircraftType = aircraftType;
          this.dataref.fuelWeight = fuelWeight;
          this.dataref.payloadWeight = totalWeight - fuelWeight - emptyWeight;
          this.dataref.emptyWeight = emptyWeight;

          if (!this.flightData.state) {
            XPlaneData.changeStateTo(
              this.flightData,
              'parked',
              Date.now(),
              `fuel: ${XPlaneData.dataRoundup(fuelWeight)} kg`
            );
            this.flightData.startTime = Date.now();
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
            timeDelta =
              parseInt(`${this.flightData.startTime}`) -
              parseInt(flightDataArray[0].ts);
          }
          if (timeDelta === 0) {
            return;
          }

          this.posReport(lat, lng, heading, elevation, gs);
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
            } = flightDataArray[i];
            const timestamp = Math.round(ts + timeDelta);
            const { results } = await this.engine.run({
              dataref: {
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
              },
            });
            // eslint-disable-next-line no-loop-func
            results.forEach((result) => {
              const myResult: any = (result.conditions as AllConditions).all.filter(
                (condition: any) => condition.path === '$.ts'
              );
              XPlaneData.changeStateTo(
                this.flightData,
                result.event.type as FlightState,
                myResult[0].factResult,
                `fuel: ${Math.round(fuelWeight)} kg`
              );
              if (result.event.type === 'takeoff') {
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
              this.posReport(lat, lng, heading, elevation, gs, true);
            });

            if (this.flightData.state === 'climb') {
              if (vs < 500 / 196.85 && vs > -500 / 196.85) {
                cruiseCounter++;
                if (cruiseCounter > 30 * DATAREF_FEQ) {
                  XPlaneData.changeStateTo(
                    this.flightData,
                    'cruise',
                    timestamp,
                    `fuel: ${Math.round(fuelWeight)} kg`
                  );
                  this.posReport(lat, lng, heading, elevation, gs);
                  cruiseCounter = 0;
                }
              } else {
                cruiseCounter = 0;
              }
            }

            if (this.flightData.state === 'cruise') {
              if (vs > 500 / 196.85) {
                climbCounter++;
                if (climbCounter > 30 * DATAREF_FEQ) {
                  XPlaneData.changeStateTo(
                    this.flightData,
                    'climb',
                    timestamp,
                    `fuel: ${Math.round(fuelWeight)} kg`
                  );
                  this.posReport(lat, lng, heading, elevation, gs);
                  climbCounter = 0;
                }
              } else {
                climbCounter = 0;
              }
            }

            if (this.flightData.state === 'cruise') {
              if (vs < -500 / 196.85 && elevation < 20000 / 3.28) {
                descendCounter++;
                if (descendCounter > 60 * DATAREF_FEQ) {
                  XPlaneData.changeStateTo(
                    this.flightData,
                    'descend',
                    timestamp,
                    `fuel: ${XPlaneData.dataRoundup(fuelWeight)} kg`
                  );
                  this.posReport(lat, lng, heading, elevation, gs);
                  descendCounter = 0;
                }
              } else {
                descendCounter = 0;
              }
            }

            if (this.flightData.state === 'landing') {
              if (!landingDataFeq) {
                this.ws?.send('Landing dataref freq');
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
                this.flightData
              );
              if (n1 < 1 && gs < 1) {
                XPlaneData.changeStateTo(
                  this.flightData,
                  'engine stopped',
                  timestamp,
                  `fuel: ${XPlaneData.dataRoundup(fuelWeight)} kg`
                );
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
                      this.trackingFlight.destination = res.data[0].ident;
                    });
                  });
                this.posReport(lat, lng, heading, elevation, gs);

                await this.createReport();
                this.resetTracking();
              }
            }
          }
        } catch (e) {
          window.electron.logger.error(e);
        }
      });
    };

    return ws;
  }
  posReport(
    lat: number,
    lng: number,
    heading: number,
    elevation: number,
    gs: number,
    foreeUpdate = false
  ) {
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
      }
      window.electron.logger.info('POS reported');
    } catch (error) {
      window.electron.logger.error('Failed to report POS');
      window.electron.logger.error(error);
    }
  }
  resetTracking() {
    runInAction(() => {
      this.isXPlaneConnected = false;
      this?.ws?.close();
      window.electron.logger.info('websocket closed');
      this?.engine?.stop();
      window.electron.logger.info('rules engine stopped');
      this.flightData = XPlaneData.initFlightData();
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

  private async createReport() {
    try {
      const timeOut = new Date(
        this.flightData.events
          .find((value) => value.indexOf('engine started') !== -1)
          .split(' -')[0]
      ).getTime();
      const timeOff = new Date(
        this.flightData.events
          .find((value) => value.indexOf('takeoff') !== -1)
          .split(' -')[0]
      ).getTime();
      const timeOn = this.flightData.endTime;
      const timeIn = new Date(
        this.flightData.events
          .find((value) => value.indexOf('engine stopped') !== -1)
          .split(' -')[0]
      ).getTime();
      const fuelOut = XPlaneData.dataRoundup(
        this.flightData.events
          .find((value) => value.indexOf('engine started') !== -1)
          .split('fuel: ')[1]
          .split(' kg')[0]
      );
      const fuelOff = XPlaneData.dataRoundup(
        this.flightData.events
          .find((value) => value.indexOf('takeoff') !== -1)
          .split('fuel: ')[1]
          .split(' kg')[0]
      );
      const fuelOn = XPlaneData.dataRoundup(this.flightData.fuelOn);
      const fuelIn = XPlaneData.dataRoundup(
        this.flightData.events
          .find((value) => value.indexOf('engine stopped') !== -1)
          .split('fuel: ')[1]
          .split(' kg')[0]
      );
      const flightReqTemplate = {
        number: this.trackingFlight.flightNumber,
        aircraftType: this.dataref.aircraftType,
        aircraftRegistration: this.dataref.aircraftRegistration,
        departure: this.trackingFlight.departure,
        destination: this.trackingFlight.destination,
        route: this.trackingFlight.route,
        timeOut: this.toIsoStringWithOffset(timeOut), // engine start
        timeOff: this.toIsoStringWithOffset(timeOff), // takeoff
        timeOn: this.toIsoStringWithOffset(timeOn), // land
        timeIn: this.toIsoStringWithOffset(timeIn), // engine stop
        totalBlockTime: XPlaneData.dataRoundup(
          (timeIn - timeOut) / 1000 / 60 / 60
        ), // from engine start to engine stop
        totalFlightTime:
          XPlaneData.dataRoundup(
            (parseInt(`${timeOn}`) - timeOff) / 1000 / 60 / 60
          ) * 10, // from takeoff to land
        dryOperatingWeight: this.dataref.emptyWeight,
        payloadWeight: this.dataref.payloadWeight,
        pax: this.trackingFlight.passengers,
        fuelOut,
        fuelOff,
        fuelOn,
        fuelIn,
        landingRate: this.flightData.landingData.vs,
      };
      const res = await axios
        .post('https://zonexecutive.com/action.php/acars/openfdr/flight', {
          flight: flightReqTemplate,
        })
        .catch((e: any) => {
          throw e;
        });
      localStorage.setItem('lastFlight', res.data.data.id);
      localStorage.setItem(
        'lastFlightLanding',
        JSON.stringify(this.flightData.landingData)
      );
      window.electron.logger.info('PIREP filed');
    } catch (error) {
      window.electron.logger.error('Failed to file final report');
      window.electron.logger.error(error);
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
