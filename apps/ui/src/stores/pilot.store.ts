import axios from 'axios';
import { makeObservable, observable, runInAction } from 'mobx';
import 'reflect-metadata';
import util from 'util';
export class PilotStore {
  @observable
  public isLoggedIn: boolean;
  @observable
  public version: string;

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
    try {
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
        window.electron.logger.info('=== Logged into ZonExecutive ===');
        runInAction(() => {
          this.isLoggedIn = true;
          this.username = username;
          axios.defaults.headers.common['X-openFDR-Username'] = username;
          axios.defaults.headers.common['X-openFDR-Password'] = password;
          localStorage.setItem('username', username);
          localStorage.setItem('password', password);
        });
      }
      this.version = await window.electron.getAppVersion();
    } catch (e) {
      window.electron.logger.error('Login failed');
      window.electron.logger.error(e);
      window.electron.logger.error(util.inspect(e));
      window.electron.logger.error(e.stack);
    }
  }
}
export const pilotStore = new PilotStore();
