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
              if (gs < 30 / 1.9438 && gearForce > 0) {
                await this.createReport();
                XPlaneData.changeStateTo(this.flightData, 'stop', timestamp);
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
    const flightReqTemplate = {
      number: this.trackingFlight.flightNumber,
      aircraftType: this.dataref.aircraftType,
      aircraftRegistration: this.dataref.aircraftRegistration,
      departure: this.trackingFlight.departure,
      destination: this.trackingFlight.destination,
      route: this.trackingFlight.route,
      timeOut: '2012-01-18T11:45:00+01:00', // engine start
      timeOff: '2012-01-18T11:50:00+01:00', // takeoff
      timeOn: '2012-01-18T14:30:00+01:00', // land
      timeIn: '2012-01-18T14:45:00+01:00', // engine stop
      totalBlockTime: 2.5, // from engine start to engine stop
      totalFlightTime: 2.3, // from takeoff to land
      dryOperatingWeight: 60000, //TODO: read from dataref on initil connect
      payloadWeight: 12000, //TODO: read from dataref on engine start
      pax: 123, //TODO: what to do there???
      fuelOut: 9000, //engine start
      fuelOff: 8800, // takeoff
      fuelOn: 3000, // land
      fuelIn: 2800, // engine shutdown
    };
    const res = await axios
      .post('https://zonexecutive.com/action.php/acars/openfdr/flight', {
        flight: flightReqTemplate,
      })
      .catch((e: any) => {
        throw e;
      });
  }
}
export const datarefStore = new DatarefStore();
