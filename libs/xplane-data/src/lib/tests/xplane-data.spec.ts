import { XPlaneData } from '../xplane-data';
describe('XPlaneData tests', () => {
  it('should initialize successfully', () => {
    const flightData = XPlaneData.initFlightData();
    expect(flightData).toBeDefined;
  });

  it('should round up', () => {
    expect(XPlaneData.dataRoundup(2.00001)).toBe(2);
    expect(XPlaneData.dataRoundup(2)).toBe(2);
    expect(XPlaneData.dataRoundup(2.123)).toBe(2.12);
  });

  it('should process raw data from xplane', () => {
    const rawData = JSON.stringify([
      {
        'sim/cockpit2/engine/indicators/N1_percent[0]': 0,
        'sim/flightmodel/position/elevation': 33.310237884521484,
        'sim/flightmodel/position/groundspeed': 3.0556638108691914e-8,
        'sim/flightmodel/position/y_agl': 0.08873935043811798,
        'sim/flightmodel2/misc/gforce_normal': 0.9996433854103088,
        'sim/flightmodel/position/local_vy': -4.366387251764081e-9,
        'sim/flightmodel/forces/fnrml_gear': 1.00000000000123,
      },
    ]);
    const { gs, vs, gForce, agl, elevation, n1, gearForce } =
      XPlaneData.processRawData(rawData)[0];
    expect(gs).toEqual(0);
    expect(vs).toEqual(-4.366387251764081e-9);
    expect(gForce).toEqual(1);
    expect(agl).toEqual(0.09);
    expect(n1).toEqual(0);
    expect(elevation).toEqual(33.31);
    expect(gearForce).toEqual(1.00000000000123);
  });
});
