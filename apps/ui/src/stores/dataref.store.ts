import { makeObservable, observable, runInAction } from 'mobx';
import { Engine } from 'json-rules-engine';
import { DATAREF_FEQ, FlightData, XPlaneData } from '@zon/xplane-data';

class DatarefStore {
  @observable
  public isDatarefWsConnected: boolean;
  @observable
  public isXPlaneConnected: boolean;
  @observable
  public flightData!: FlightData;

  private ws: WebSocket;
  private engine!: Engine;

  constructor() {
    this.isDatarefWsConnected = false;
    this.isXPlaneConnected = false;
    this?.ws?.close();
    console.log('websocket closed');
    this?.engine?.stop();
    console.log('rules engine stopped');
    this.ws = this.connect();

    makeObservable(this);
  }

  private connect() {
    // this.rules = new Rules(this.selectedFlight.aircraft, this.flightData);
    // this.engine = new Engine(this.rules.getRules());
    const ws = new WebSocket('ws://localhost:4444');
    setInterval(function () {
      ws.send('ping');
    }, 5000);
    let cruiseCounter = 0;
    let climbCounter = 0;
    let descendCounter = 0;
    let landingDataFeq = false;
    let timeDelta = 0;
    // const currentFlight = this.selectedFlight as RemoteFlight;
    // const livemapData = {
    //   airline: airlineStore.activeAirline?.id as string,
    //   flight_number: currentFlight.name,
    //   route: `${currentFlight.departure} - ${currentFlight.arrival}`,
    //   latitude: 0,
    //   longitude: 0,
    // };
    // let livemapId = 0;
    // livemapApi
    //   .getManyBaseLivemapControllerLivemap(undefined, undefined, [
    //     `airline||$eq||${airlineStore.pilotId as string}`,
    //   ])
    //   .then((res) => {
    //     const livemaps: Livemap[] = res.data as Livemap[];
    //     if (livemaps.length === 0) {
    //       livemapApi
    //         .createOneBaseLivemapControllerLivemap(livemapData)
    //         .then(({ data }) => {
    //           livemapId = data.id as number;
    //           console.log('created live flight');
    //         })
    //         .catch((e) => {
    //           console.log(e);
    //         });
    //     } else {
    //       livemapId = livemaps[0].id as number;
    //       console.log(`livemap id: ${livemapId}`);
    //     }
    //   });

    ws.onmessage = (msg) => {
      runInAction(async () => {
        try {
          if (msg.data === 'pong') {
            this.isDatarefWsConnected = true;
            return;
          }
          this.isXPlaneConnected = true;
          if (!this.flightData) {
            this.flightData = XPlaneData.initFlightData();
          }
          if (!this.flightData?.state) {
            XPlaneData.changeStateTo(this.flightData, 'parked', Date.now());
            this.flightData.startTime = Date.now();
          }
          const flightDataArray: any[] = XPlaneData.processRawData(msg.data);
          if (timeDelta === 0) {
            timeDelta =
              parseInt(`${this.flightData.startTime}`) -
              parseInt(flightDataArray[0].ts);
          }
          // // update lat and lat
          // if (livemapId !== 0) {
          //   const { lat, lng, ias, gs, vs, elevation } = flightDataArray[
          //     flightDataArray.length - 1
          //   ];
          //   livemapApi
          //     .updateOneBaseLivemapControllerLivemap(livemapId, {
          //       ...livemapData,
          //       latitude: lat,
          //       longitude: lng,
          //       flight_data: JSON.stringify({ ias, gs, vs, elevation }),
          //     })
          //     .then(() => {
          //       console.log('live flight updated');
          //     })
          //     .catch((e) => logger.error(e));
          // }

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
            results.forEach((result) => {
              if (result.name) {
                this.engine.removeRule(result.name);
              }
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
                this.ws?.close();
                console.log('websocket closed');
                this.engine.stop();
                console.log('rules engine stopped');
                //await this.createReport();
                XPlaneData.changeStateTo(this.flightData, 'stop', timestamp);
                this.flightData = XPlaneData.initFlightData();
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
