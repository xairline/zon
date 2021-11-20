export type FlightState =
  | 'parked'
  | 'engine started'
  | 'taxi'
  | 'takeoff'
  | 'climb'
  | 'cruise'
  | 'descend'
  | 'landing'
  | 'RTO'
  | 'engine stopped'
  | undefined;

export interface LandingData {
  vs: number;
  gForce: number;
  data: any[];
}

interface SimTime {
  system: number;
  sim: number;
}

export interface FlightData {
  state: FlightState;
  landingData: LandingData;
  timeOn: SimTime;
  timeOff: SimTime;
  timeOut: SimTime;
  timeIn: SimTime;
  fuelOn: number;
  fuelOff: number;
  fuelOut: number;
  fuelIn: number;
  events: any[];
  violationEvents: any[];
  rules: any[];
}
