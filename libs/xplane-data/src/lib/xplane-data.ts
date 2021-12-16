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
        touchDown: 0,
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
      const simTimeSec = flightDataRaw[DATAREF_STR.SIM_TIME];
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
          simTimeSec,
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

  static processRawDataToOpenFDR(data: string): any[] {
    const flightDataRawArray: any[] = JSON.parse(data);
    const result: any[] = [];
    flightDataRawArray.forEach((flightDataRaw) => {
      const ts = flightDataRaw[DATAREF_STR.TS] * 1000;
      const replayMode = flightDataRaw[DATAREF_STR.REPLAY_MODE];
      // let ICAO = '';
      // Object.keys(DATAREF_STR)
      //   .filter((d) => d.indexOf('ICAO') === 0)
      //   .map((key) => {
      //     ICAO +=
      //       flightDataRaw[DATAREF_STR[key]] !== 0
      //         ? String.fromCharCode(flightDataRaw[DATAREF_STR[key]])
      //         : '';
      //   });
      if (replayMode === 0) {
        result.push({
          //ELAPSED_FLIGHT_TIME,

          ts,
          TOTAL_FLIGHT_TIME: flightDataRaw[DATAREF_STR.TOTAL_FLIGHT_TIME],
          FLIGHT_TIME_STAMP: flightDataRaw[DATAREF_STR.SIM_TIME],
          MAG_HEADING: Math.round(flightDataRaw[DATAREF_STR.HEADING_DEG]),
          HEIGHT: Math.round(flightDataRaw[DATAREF_STR.HEIGHT_FT]),
          ALTITUDE: Math.round(flightDataRaw[DATAREF_STR.ALTITUDE_FT]),
          VERTICAL_SPEED: Math.round(flightDataRaw[DATAREF_STR.VS]),
          IAS: Math.round(flightDataRaw[DATAREF_STR.IAS]),
          MACH: XPlaneData.dataRoundup(flightDataRaw[DATAREF_STR.MACH]),
          TAS: Math.round(flightDataRaw[DATAREF_STR.TAS]),
          PITCH_ANGLE: Math.round(flightDataRaw[DATAREF_STR.PITCH]),
          BANK_ANGLE: Math.round(flightDataRaw[DATAREF_STR.BANK_DEG]),
          ALPHA: Math.round(flightDataRaw[DATAREF_STR.ALPHA]),
          LOAD_FACTOR: Math.round(flightDataRaw[DATAREF_STR.LOAD_FACTOR_G]),
          MAG_TRACK: Math.round(
            flightDataRaw[DATAREF_STR.TRUE_TRACK] +
              flightDataRaw[DATAREF_STR.MAG_VAR]
          ),
          GROUND_SPEED: Math.round(flightDataRaw[DATAREF_STR.GS] * 1.9438445),
          LATITUDE: flightDataRaw[DATAREF_STR.LAT],
          LONGITUDE: flightDataRaw[DATAREF_STR.LNG],
          WIND_DIRECTION: Math.round(flightDataRaw[DATAREF_STR.WIND_DEG]),
          WIND_SPEED: Math.round(flightDataRaw[DATAREF_STR.WIND_KT]),
          OAT: Math.round(flightDataRaw[DATAREF_STR.OAT]),
          ENGINE_RUNNING: [
            Math.round(flightDataRaw[DATAREF_STR.ENG_RUNNING_1]),
            Math.round(flightDataRaw[DATAREF_STR.ENG_RUNNING_2]),
            Math.round(flightDataRaw[DATAREF_STR.ENG_RUNNING_3]),
            Math.round(flightDataRaw[DATAREF_STR.ENG_RUNNING_4]),
            Math.round(flightDataRaw[DATAREF_STR.ENG_RUNNING_5]),
            Math.round(flightDataRaw[DATAREF_STR.ENG_RUNNING_6]),
            Math.round(flightDataRaw[DATAREF_STR.ENG_RUNNING_7]),
            Math.round(flightDataRaw[DATAREF_STR.ENG_RUNNING_8]),
          ],
          ENGINE_LEVER: [
            Math.round(flightDataRaw[DATAREF_STR.ENG_THRO1] * 100),
            Math.round(flightDataRaw[DATAREF_STR.ENG_THRO2] * 100),
            Math.round(flightDataRaw[DATAREF_STR.ENG_THRO3] * 100),
            Math.round(flightDataRaw[DATAREF_STR.ENG_THRO4] * 100),
            Math.round(flightDataRaw[DATAREF_STR.ENG_THRO5] * 100),
            Math.round(flightDataRaw[DATAREF_STR.ENG_THRO6] * 100),
            Math.round(flightDataRaw[DATAREF_STR.ENG_THRO7] * 100),
            Math.round(flightDataRaw[DATAREF_STR.ENG_THRO8] * 100),
          ],
          ENGINE_POWER: [
            Math.round(flightDataRaw[DATAREF_STR.ENG_POWER1]),
            Math.round(flightDataRaw[DATAREF_STR.ENG_POWER2]),
            Math.round(flightDataRaw[DATAREF_STR.ENG_POWER3]),
            Math.round(flightDataRaw[DATAREF_STR.ENG_POWER4]),
            Math.round(flightDataRaw[DATAREF_STR.ENG_POWER5]),
            Math.round(flightDataRaw[DATAREF_STR.ENG_POWER6]),
            Math.round(flightDataRaw[DATAREF_STR.ENG_POWER7]),
            Math.round(flightDataRaw[DATAREF_STR.ENG_POWER8]),
          ],
          BRAKE_LEFT: Math.round(flightDataRaw[DATAREF_STR.BRAKE_LEFT] * 100),
          BRAKE_RIGHT: Math.round(flightDataRaw[DATAREF_STR.BRAKE_RIGHT] * 100),
          PARKING_BRAKE: Math.round(
            flightDataRaw[DATAREF_STR.BRAKE_PARKING] * 100
          ),
          GEAR_LEVER_DOWN:
            flightDataRaw[DATAREF_STR.GEAR_LEVER_DOWN] > 0 ? 1 : 0,
          PITCH_CONTROL: Math.round(
            flightDataRaw[DATAREF_STR.PITCH_CONTROL] * 100
          ),
          ROLL_CONTROL: Math.round(
            flightDataRaw[DATAREF_STR.ROLL_CONTROL] * 100
          ),
          YAW_CONTROL: Math.round(flightDataRaw[DATAREF_STR.YAW_CONTROL] * 100),
          FLAP_LEVER: Math.round(flightDataRaw[DATAREF_STR.FLAP_LEVER] * 100),
          SPEED_BRAKE_LEVER: Math.round(
            flightDataRaw[DATAREF_STR.SPEEDBRAKE_LEVER] * 100
          ),
          AUTOPILOT_ON: flightDataRaw[DATAREF_STR.AUTOPILOT] === 2 ? 1 : 0,
          WEIGHT: Math.round(flightDataRaw[DATAREF_STR.TOTAL_WEIGHT]),
          FUEL_WEIGHT: Math.round(flightDataRaw[DATAREF_STR.FUEL_WEIGHT]),
          CABIN_ALTITUDE: Math.round(flightDataRaw[DATAREF_STR.CABIN_ALT_FT]),
          CABIN_VERTICAL_SPEED: Math.round(
            flightDataRaw[DATAREF_STR.CAMBIN_VS_FT]
          ),
          //NAV1_ID: Math.round(flightDataRaw[DATAREF_STR]),
          NAV1_COURSE: Math.round(flightDataRaw[DATAREF_STR.NAV1_COURSE_DEG]),
          NAV1_SLOPE: Math.round(flightDataRaw[DATAREF_STR.NAV1_SLOPE_DEG]),
          NAV1_DME: Math.round(flightDataRaw[DATAREF_STR.NAV1_DME]),
          LOC_DEV: Math.round(flightDataRaw[DATAREF_STR.LOC_DEV_DOTS]),
          GLIDE_DEV: Math.round(flightDataRaw[DATAREF_STR.GLIDER_DEV_DOTS]),
        });
      }
    });
    return result;
  }

  static changeStateTo(
    flightData: FlightData,
    state: FlightState,
    ts: number,
    simTimeSec: number,
    fuel: number
  ) {
    if (flightData.state === state) {
      return;
    }

    if (state === 'Engine Started') {
      flightData.timeOut = { system: ts, sim: simTimeSec };
      flightData.fuelOut = fuel;
      window?.electron?.logger.info(
        `${state}: ${JSON.stringify(flightData.timeOut)} | ${
          flightData.fuelOut
        }`
      );
    }
    if (state === 'Engine Stopped') {
      flightData.timeIn = { system: ts, sim: simTimeSec };
      flightData.fuelIn = fuel;
      window?.electron?.logger.info(
        `${state}: ${JSON.stringify(flightData.timeIn)} | ${flightData.fuelIn}`
      );
    }
    if (state === 'Takeoff') {
      flightData.timeOff = { system: ts, sim: simTimeSec };
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
    lat: number,
    lng: number,
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
        ? ((vs * 0.00508 - lastVs * 0.00508) / ((ts - lastTs) / 1000) + 9.8) /
          9.8
        : gForce;
    if (gForce > calculatedGForce) {
      calculatedGForce = gForce;
    }

    if (
      ias >= 30 &&
      (flightData.timeOn.system === 0 ||
        ts - flightData.timeOn.system < 10 * 1000)
    ) {
      flightData.landingData.data.push({
        ts,
        gForce: calculatedGForce,
        vs,
        agl,
        gearForce,
        pitch,
        ias,
        lat,
        lng,
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
        flightData.landingData.touchDown = ts;
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
