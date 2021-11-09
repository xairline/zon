import { DATAREF_FEQ_LANDING, FlightData, FlightState } from '..';
import { DATAREF_STR } from './xplane-data.constants';
import { LandingData } from './xplane-data.interfaces';

/**
 * totalFlights,
      totalLandingGForce,
      totalLandingVs,
 */
export class XPlaneData {
  static calcRevenue(
    numOfPassengers: number,
    flight_time: number,
    satisfication = 100
  ): number {
    return XPlaneData.dataRoundup(
      ((6 *
        numOfPassengers *
        XPlaneData.dataRoundup(flight_time / 1000 / 60) *
        satisfication) /
        100) *
        50
    );
  }
  static caclSatification(
    timeDelta: number,
    landingData: LandingData,
    data: any
  ) {
    let satification = 0;
    // time
    if (timeDelta < 20 * 1000 * 60) {
      satification += parseFloat(data.delayed_flight_penalty_20 || 0);
    } else if (timeDelta < 60 * 1000 * 60) {
      satification += parseFloat(data.delayed_flight_penalty_60 || 0);
    } else {
      satification += parseFloat(data.delayed_flight_penalty_120 || 0);
    }

    // g force
    if (landingData.gForce < 1.5) {
      satification += parseFloat(data.landing_g_force_penalty_1_5 || 0);
    } else if (landingData.gForce < 2) {
      satification += parseFloat(data.landing_g_force_penalty_2_0 || 0);
    } else {
      satification += parseFloat(data.landing_g_force_penalty_2_5 || 0);
    }

    // vs
    if (landingData.vs * -1 < 150) {
      satification += parseFloat(data.landing_vs_penalty_1_5 || 0);
    } else if (landingData.vs * -1 < 250) {
      satification += parseFloat(data.landing_vs_penalty_2_5 || 0);
    } else {
      satification += parseFloat(data.landing_vs_penalty_3_0 || 0);
    }

    return satification;
  }
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
  static randomGen(v1: number, v2: number): number {
    return XPlaneData.dataRoundup(Math.random() * (v2 - v1) + v1);
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

      result.push({
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
