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
  };
  @observable
  public dataref!: any;

  private ws: WebSocket;
  private engine!: Engine;
  public rules!: Rules;

  constructor() {
    this.isXPlaneConnected = false;
    this?.ws?.close();
    console.log('websocket closed');
    this?.engine?.stop();
    console.log('rules engine stopped');

    this.trackingFlight = {
      flightNumber: 'ZE999',
      departure: 'TBD',
      destination: 'TBD',
      aircraftType: 'TBD',
      route: 'DCT',
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
          } = flightDataArray[flightDataArray.length - 1];
          this.dataref.vs = vs;
          this.dataref.gs = gs;
          this.dataref.ias = ias;
          this.dataref.elevation = elevation;
          this.dataref.aircraftRegistration = aircraftRegistration;
          this.dataref.aircraftType = aircraftType;

          if (!this.flightData.state && flightDataArray[0].n1 === 0) {
            XPlaneData.changeStateTo(this.flightData, 'parked', Date.now());
            this.flightData.startTime = Date.now();
            timeDelta =
              parseInt(`${this.flightData.startTime}`) -
              parseInt(flightDataArray[0].ts);
          }
          if (timeDelta === 0) {
            return;
          }
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
                myResult[0].factResult
              );
            });

            if (this.flightData.state === 'climb') {
              if (vs < 500 / 196.85 && vs > -500 / 196.85) {
                cruiseCounter++;
                if (cruiseCounter > 30 * DATAREF_FEQ) {
                  XPlaneData.changeStateTo(
                    this.flightData,
                    'cruise',
                    timestamp
                  );
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
                  XPlaneData.changeStateTo(this.flightData, 'climb', timestamp);
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
                    timestamp
                  );
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
                timestamp,
                vs,
                agl,
                gForce,
                gearForce,
                pitch,
                ias,
                this.flightData
              );
              if (n1 < 1 && gs < 1) {
                XPlaneData.changeStateTo(
                  this.flightData,
                  'engine stopped',
                  timestamp
                );
                await this.createReport();
                this.flightData = XPlaneData.initFlightData();
                this.trackingFlight = {
                  flightNumber: 'ZE999',
                  departure: 'TBD',
                  destination: 'TBD',
                  aircraftType: 'TBD',
                  route: 'DCT',
                };
                this.dataref = {
                  vs: 0,
                  gs: 0,
                  ias: 0,
                  elevation: 0,
                  aircraftRegistration: '',
                  aircraftType: '',
                };
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      });
    };

    return ws;
  }

  private async createReport() {
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
      totalFlightTime: XPlaneData.dataRoundup(
        (parseInt(`${timeOn}`) - timeOff) / 1000 / 60 / 60
      ) * 10, // from takeoff to land
      dryOperatingWeight: 60000, //TODO: read from dataref on initil connect
      payloadWeight: 12000, //TODO: read from dataref on engine start
      pax: 123, //TODO: what to do there???
      fuelOut: 9000, //TODO: engine start
      fuelOff: 8800, //TODO: takeoff
      fuelOn: 3000, //TODO: land
      fuelIn: 2800, //TODO: engine shutdown
      landingRate: this.flightData.landingData.vs,
    };
    const res = await axios
      .post('https://zonexecutive.com/action.php/acars/openfdr/flight', {
        flight: flightReqTemplate,
      })
      .catch((e: any) => {
        throw e;
      });
    console.log(res);
    //todo create local landing data
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
