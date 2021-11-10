import { makeObservable, observable, runInAction } from 'mobx';
import { AllConditions, Engine } from 'json-rules-engine';
import {
  DATAREF_FEQ,
  FlightData,
  FlightState,
  Rules,
  XPlaneData,
} from '@zon/xplane-data';

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
    };
    this.flightData = XPlaneData.initFlightData();
    this.dataref = {};
    this.dataref.vs = 0;
    this.dataref.gs = 0;
    this.dataref.ias = 0;
    this.dataref.elevation = 0;
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

          const { vs, gs, ias, elevation } = flightDataArray[
            flightDataArray.length - 1
          ];
          this.dataref.vs = vs;
          this.dataref.gs = gs;
          this.dataref.ias = ias;
          this.dataref.elevation = elevation;

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
                //await this.createReport();
                XPlaneData.changeStateTo(this.flightData, 'stop', timestamp);
                this.flightData = XPlaneData.initFlightData();
                this.trackingFlight = {
                  flightNumber: 'ZE999',
                  departure: 'TBD',
                  destination: 'TBD',
                };
                this.dataref = {};
                this.dataref.vs = 0;
                this.dataref.gs = 0;
                this.dataref.ias = 0;
                this.dataref.elevation = 0;
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
}
export const datarefStore = new DatarefStore();
