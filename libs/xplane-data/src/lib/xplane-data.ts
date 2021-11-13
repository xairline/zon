import { DATAREF_FEQ_LANDING, FlightData, FlightState } from '..';
import { DATAREF_STR } from './xplane-data.constants';
import { LandingData } from './xplane-data.interfaces';

/**
 * totalFlights,
      totalLandingGForce,
      totalLandingVs,
 */
export class XPlaneData {
  static initFlightData(): FlightData {
    return {
      state: undefined,
      startTime: 0,
      endTime: 0,
      landingData: { vs: 0, gForce: 0, data: [] },
      events: [],
      violationEvents: [],
      rules: [],
    };
  }
  static dataRoundup(value: number): number {
    return Math.round(value * 100) / 100;
  }
  static processRawData(data: string): any[] {
    const flightDataRawArray: any[] = JSON.parse(data);
    const result: any[] = [];
    flightDataRawArray.forEach((flightDataRaw) => {
      const n1 = flightDataRaw[DATAREF_STR.N1];

      const gs = XPlaneData.dataRoundup(flightDataRaw[DATAREF_STR.GS]);
      const elevation = XPlaneData.dataRoundup(
        flightDataRaw[DATAREF_STR.ELEVATION]
      );
      const agl = XPlaneData.dataRoundup(flightDataRaw[DATAREF_STR.AGL]);
      const gForce = XPlaneData.dataRoundup(flightDataRaw[DATAREF_STR.G_FORCE]);
      const gearForce = flightDataRaw[DATAREF_STR.GEAR_FORCE];

      const vs = flightDataRaw[DATAREF_STR.VS];
      const ts = flightDataRaw[DATAREF_STR.TS] * 1000;
      const pitch = flightDataRaw[DATAREF_STR.PITCH];
      const ias = flightDataRaw[DATAREF_STR.IAS];

      const lat = flightDataRaw[DATAREF_STR.LAT];
      const lng = flightDataRaw[DATAREF_STR.LNG];
      const fuelWeight = flightDataRaw[DATAREF_STR.FUEL_WEIGHT];
      const totalWeight = flightDataRaw[DATAREF_STR.TOTAL_WEIGHT];
      const emptyWeight = flightDataRaw[DATAREF_STR.EMPTY_WEIGHT];

      let tail_number = '';
      Object.keys(DATAREF_STR)
        .filter((d) => d.indexOf('TAIL_NUMBER') === 0)
        .map((key) => {
          tail_number += String.fromCharCode(flightDataRaw[DATAREF_STR[key]]);
        });

      let ICAO = '';
      Object.keys(DATAREF_STR)
        .filter((d) => d.indexOf('ICAO') === 0)
        .map((key) => {
          ICAO += String.fromCharCode(flightDataRaw[DATAREF_STR[key]]);
        });

      result.push({
        fuelWeight,
        totalWeight,
        emptyWeight,
        aircraftType: ICAO,
        aircraftRegistration: tail_number,
        ts,
        gs,
        vs,
        gForce,
        agl,
        elevation,
        n1,
        gearForce,
        pitch,
        ias,
        lat,
        lng,
      });
    });
    return result;
  }
  static changeStateTo(flightData: FlightData, state: FlightState, ts: number) {
    flightData.state = state;
    flightData.events.push(
      `${new Date(ts).toISOString()} - ${flightData.state}`
    );
  }
  static calculateLandingData(
    ts: number,
    vs: number,
    agl: number,
    gForce: number,
    gearForce: number,
    pitch: number,
    ias: number,
    flightData: FlightData
  ) {
    const lastVs =
      flightData.landingData.data.length > 0
        ? flightData.landingData.data[flightData.landingData.data.length - 1].vs
        : 0;
    const lastTs =
      flightData.landingData.data.length > 0
        ? flightData.landingData.data[flightData.landingData.data.length - 1].ts
        : ts;
    let calculatedGForce: number =
      flightData.landingData.data.length > 0
        ? ((vs - lastVs) / ((ts - lastTs) / 1000) + 9.8) / 9.8
        : gForce;
    if (gForce > calculatedGForce) {
      calculatedGForce = gForce;
    }
    flightData.landingData.data.push({
      ts,
      gForce: calculatedGForce,
      vs,
      agl,
      gearForce,
      pitch,
      ias,
    });

    if (
      gearForce > 1000 &&
      (flightData.landingData.gForce === 0 || flightData.endTime - ts < 3000)
    ) {
      console.log(
        `Touch down: ${{
          ts,
          gForce: calculatedGForce,
          vs,
          agl,
          gearForce,
          pitch,
          ias,
        }}`
      );
      flightData.endTime = ts;
      // do not use the data at touch down time
      if (flightData.landingData.gForce === 0) {
        flightData.landingData.gForce = 1;
        return;
      }

      flightData.landingData.gForce =
        calculatedGForce > flightData.landingData.gForce
          ? calculatedGForce
          : flightData.landingData.gForce;
      flightData.landingData.vs =
        lastVs < flightData.landingData.vs
          ? this.dataRoundup(lastVs * 196.85)
          : flightData.landingData.vs;
    }
  }
}
