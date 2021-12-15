import { notification } from 'antd';
import { NotificationPlacement } from 'antd/lib/notification';
import axios from 'axios';
import { makeObservable, observable, runInAction } from 'mobx';
import 'reflect-metadata';
import util from 'util';
export class PilotStore {
  @observable
  public isLoggedIn: boolean;
  @observable
  public version: string;
  @observable
  public remoteVersion: string;
  @observable
  public offline: boolean;

  public username: string;

  constructor() {
    this.isLoggedIn = false;
    this.offline = false;
    this.username = localStorage.getItem('username') as string;
    window.electron.getAppVersion().then((res) => {
      this.version = res;
      this.remoteVersion = this.version;
    });
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
        // get remote version
        const remoteVersion = await axios.get(
          'https://api.github.com/repos/xairline/zon/releases/latest'
        );

        runInAction(() => {
          this.remoteVersion = remoteVersion.data.tag_name;
          if (this.remoteVersion !== 'v' + this.version) {
            const args = {
              message: 'New version is available',
              description: `${this.remoteVersion}`,
              placement: 'bottomRight' as NotificationPlacement,
            };
            notification.info(args);
          }
        });

        const offlinePireps = await window.electron.loadOfflinePirep();
        if (offlinePireps.length > 0) {
          notification.success({
            message: 'Offline PIREP found',
            duration: 0,
            description: `You have ${offlinePireps.length} offline PIREPS to sync`,
          });

          const delay = (ms) => new Promise((res) => setTimeout(res, ms));
          for (const offlinePirep of offlinePireps) {
            offlinePirep.content.remarks = 'Offline sync';
            axios
              .post(
                'https://zonexecutive.com/action.php/acars/openfdr/flight',
                {
                  flight: offlinePirep.content,
                }
              )
              .then(async (res) => {
                await window.electron.deleteOfflinePirep(offlinePirep.path);
                window.electron.logger.info(`PIREP sync'ed`);
                notification.success({
                  message: `PIREP Sync'ed Successfully - ${res.data.data.id}`,
                  duration: 0,
                  description: `${offlinePirep.content.number}: ${offlinePirep.content.departure} - ${offlinePirep.content.destination}`,
                });
              })
              .catch((e: any) => {
                window.electron.logger.error(
                  `Sync failed: ${offlinePirep.content.number}: ${offlinePirep.content.departure} - ${offlinePirep.content.destination}`
                );
                window.electron.logger.error(e);
                window.electron.logger.error(util.inspect(e));
                window.electron.logger.error(e.stack);
                notification.error({
                  message: `PIREP Sync'ed Failed`,
                  duration: 0,
                  description: `${offlinePirep.content.number}: ${offlinePirep.content.departure} - ${offlinePirep.content.destination}`,
                });
              });
            await delay(70 * 1000);
          }
        }
      }
    } catch (e) {
      window.electron.logger.error('Login failed');
      window.electron.logger.error(e);
      window.electron.logger.error(util.inspect(e));
      window.electron.logger.error(e.stack);
    }
  }
}
export const pilotStore = new PilotStore();
