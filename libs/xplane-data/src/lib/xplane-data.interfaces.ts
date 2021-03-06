export type FlightState =
  | 'Parked'
  | 'Engine Started'
  | 'Taxi'
  | 'Takeoff'
  | 'Climb'
  | 'Cruise'
  | 'Descent'
  | 'Landing'
  | 'RTO'
  | 'Engine Stopped'
  | undefined;

export interface LandingData {
  vs: number;
  gForce: number;
  touchDown: number;
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
export interface IPirep {
  number: string;
  aircraftType: string;
  //aircraftRegistration: this.dataref.aircraftRegistration,
  departure: string;
  destination: string;
  route: string;
  timeOut: string; // engine start
  timeOff: string; // Takeoff
  timeOn: string; // land
  timeIn: string; // engine stop
  totalBlockTime: number;
  totalFlightTime: number; // from Takeoff to land
  dryOperatingWeight: number;
  payloadWeight: number;
  pax: number;
  fuelOut: number;
  fuelOff: number;
  fuelOn: number;
  fuelIn: number;
  landingRate: number;
  recordingId: string;
}
