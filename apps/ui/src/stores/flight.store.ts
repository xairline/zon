import { action, makeObservable, observable, runInAction } from 'mobx';
import 'reflect-metadata';
import { PilotStore, pilotStore } from './pilot.store';
const axios = require('axios');

export class FlightStore {
  @observable
  public bookedFlights: any[];

  @observable
  public scheduledFlights: any[];

  constructor() {
    this.bookedFlights = [];
    this.scheduledFlights = [];
    makeObservable(this);
  }

  public async loadBookedFlights() {
    const res = await axios
      .get('https://zonexecutive.com/action.php/acars/openfdr/booking')
      .catch((e: any) => {
        throw e;
      });
    runInAction(() => {
      this.bookedFlights = Object.values(res.data.data.bookings).map(
        (value: any) => {
          return { ...value, key: value.flightNumber };
        }
      );
    });
  }

  public async loadScheduledFlights() {
    const res = await axios
      .get('https://zonexecutive.com/action.php/acars/openfdr/schedule?offset=0&limit=300')
      .catch((e: any) => {
        throw e;
      });
    runInAction(() => {
      this.scheduledFlights = Object.values(res.data.data.schedules).map(
        (value: any) => {
          return { ...value, key: value.flightNumber };
        }
      );
    });
  }
}
export const flightStore = new FlightStore();
