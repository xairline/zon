import axios from 'axios';
import { makeObservable, observable, runInAction } from 'mobx';
import 'reflect-metadata';

export class FlightStore {
  @observable
  public bookedFlights: any[];

  @observable
  public scheduledFlights: any[];

  @observable
  public pastFlights: any[];

  constructor() {
    this.bookedFlights = [];
    this.scheduledFlights = [];
    this.pastFlights = [];
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
      .get(
        'https://zonexecutive.com/action.php/acars/openfdr/schedule?offset=0&limit=300'
      )
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

  public async loadPastFlights() {
    const res = await axios
      .get('https://zonexecutive.com/action.php/acars/openfdr/flight')
      .catch((e: any) => {
        throw e;
      });
    runInAction(() => {
      let myKey = 0;
      this.pastFlights = Object.values(res.data.data.flights).map(
        (value: any) => {
          myKey++;
          return { ...value, key: myKey };
        }
      );
    });
  }
}
export const flightStore = new FlightStore();
