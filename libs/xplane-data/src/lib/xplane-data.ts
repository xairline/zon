import { FlightData, FlightState } from '..';
import { DATAREF_STR } from './xplane-data.constants';
declare global {
  interface Window {
    electron?: any;
  }
}

export class XPlaneData {
  static initFlightData(): FlightData {
    return {
      state: undefined,
      timeOn: { system: 0, sim: 0 },
      timeOff: { system: 0, sim: 0 },
      timeOut: { system: 0, sim: 0 },
      timeIn: { system: 0, sim: 0 },
      fuelOn: 0,
      fuelOff: 0,
      fuelOut: 0,
      fuelIn: 0,
      landingData: {
        vs: 0,
        gForce: 0,
        data: [],
      },
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
      const fuelWeight = Math.round(flightDataRaw[DATAREF_STR.FUEL_WEIGHT]);
      const totalWeight = flightDataRaw[DATAREF_STR.TOTAL_WEIGHT];
      const emptyWeight = flightDataRaw[DATAREF_STR.EMPTY_WEIGHT];
      const heading = flightDataRaw[DATAREF_STR.HEADING];
      const paused = flightDataRaw[DATAREF_STR.PAUSED];
      const zuluTimeSec = flightDataRaw[DATAREF_STR.ZULU_TIME];
      const replayMode = flightDataRaw[DATAREF_STR.REPLAY_MODE];

      let ICAO = '';
      Object.keys(DATAREF_STR)
        .filter((d) => d.indexOf('ICAO') === 0)
        .map((key) => {
          ICAO +=
            flightDataRaw[DATAREF_STR[key]] !== 0
              ? String.fromCharCode(flightDataRaw[DATAREF_STR[key]])
              : '';
        });
      if (replayMode === 0) {
        result.push({
          paused,
          zuluTimeSec,
          fuelWeight,
          totalWeight,
          emptyWeight,
          aircraftType: ICAO,
          //aircraftRegistration: tail_number,
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
          heading,
        });
      }
    });
    return result;
  }
  static changeStateTo(
    flightData: FlightData,
    state: FlightState,
    ts: number,
    zuluTimeSec: number,
    fuel: number
  ) {
    if (flightData.state === state) {
      return;
    }

    if (state === 'engine started') {
      flightData.timeOut = { system: ts, sim: zuluTimeSec };
      flightData.fuelOut = fuel;
      window?.electron?.logger.info(
        `${state}: ${JSON.stringify(flightData.timeOut)} | ${
          flightData.fuelOut
        }`
      );
    }
    if (state === 'engine stopped') {
      flightData.timeIn = { system: ts, sim: zuluTimeSec };
      flightData.fuelIn = fuel;
      window?.electron?.logger.info(
        `${state}: ${JSON.stringify(flightData.timeIn)} | ${flightData.fuelIn}`
      );
    }
    if (state === 'takeoff') {
      flightData.timeOff = { system: ts, sim: zuluTimeSec };
      flightData.fuelOff = fuel;
      window?.electron?.logger.info(
        `${state}: ${JSON.stringify(flightData.timeOff)} | ${
          flightData.fuelOff
        }`
      );
    }
    window?.electron?.logger.info(
      `State machine: ${flightData.state} ===> ${state}`
    );
    flightData.state = state;
    flightData.events.push(
      `${new Date(ts).toISOString()} - ${flightData.state}`
    );
  }

  static calculateLandingData(
    gs: number,
    ts: number,
    vs: number,
    agl: number,
    gForce: number,
    gearForce: number,
    pitch: number,
    ias: number,
    fuel: number,
    zuleSec: number,
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
        ? ((vs* 0.00508 - lastVs* 0.00508) /
            ((ts - lastTs) / 1000) +
            9.8) /
          9.8
        : gForce;
    if (gForce > calculatedGForce) {
      calculatedGForce = gForce;
    }

    if (
      ias >= 30 &&
      (flightData.timeOn.system === 0 ||
        ts - flightData.timeOn.system < 30 * 1000)
    ) {
      flightData.landingData.data.push({
        ts,
        gForce: calculatedGForce,
        vs,
        agl,
        gearForce,
        pitch,
        ias,
      });
    }

    if (
      gearForce > 1000 &&
      (flightData.landingData.gForce === 0 ||
        ts - flightData.timeOn.system < 3000)
    ) {
      if (flightData.timeOn.system === 0) {
        flightData.timeOn.system = ts;
        flightData.timeOn.sim = zuleSec;
        flightData.fuelOn = fuel;
        window?.electron?.logger.info(
          `touchdown: ${JSON.stringify(flightData.timeOn)} | ${
            flightData.fuelOn
          }`
        );
      }
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
        Math.round(lastVs * 100) < Math.round(flightData.landingData.vs * 100)
          ? lastVs
          : flightData.landingData.vs;
    }
  }
}
