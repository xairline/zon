export type FlightState =
  | 'parked'
  | 'engine started'
  | 'taxi'
  | 'takeoff'
  | 'climb'
  | 'cruise'
  | 'descend'
  | 'landing'
  | 'engine stopped'
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
