export type FlightState =
  | 'parked'
  | 'taxi'
  | 'takeoff'
  | 'climb'
  | 'cruise'
  | 'descend'
  | 'landing'
  | 'stop'
  | undefined;

export interface LandingData {
  vs: number;
  gForce: number;
  data: any[];
}

export interface FlightData {
  state: FlightState;
  landingData: LandingData;
  startTime: number;
  endTime: number;

  events: any[];
  violationEvents: any[];
  rules: any[];
}
