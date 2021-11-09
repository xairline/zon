import { action, makeObservable, observable, runInAction } from 'mobx';
import 'reflect-metadata';
const axios = require('axios');

export class PilotStore {
  @observable
  public isLoggedIn: boolean;

  public username: string;

  constructor() {
    this.isLoggedIn = false;
    this.username = localStorage.getItem('username') as string;
    if (this.username?.length > 0) {
      this.login(this.username, localStorage.getItem('password') as string);
    }
    makeObservable(this);
  }

  public async login(username: string, password: string) {
    const res = await axios
      .get('https://zonexecutive.com/action.php/acars/openfdr/booking', {
        headers: {
          'X-openFDR-Username': username,
          'X-openFDR-Password': password,
        },
      })
      .catch((e: Error) => {
        throw e;
      });
    if (res.status === 200) {
      runInAction(() => {
        this.isLoggedIn = true;
        this.username = username;
        axios.defaults.headers.common['X-openFDR-Username'] = username;
        axios.defaults.headers.common['X-openFDR-Password'] = password;
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
      });
    }
  }
}
export const pilotStore = new PilotStore();
