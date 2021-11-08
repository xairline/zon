import { action, makeObservable, observable, runInAction } from 'mobx';
import 'reflect-metadata';
const axios = require('axios').default;

export class PilotStore {
  @observable
  public isLoggedIn: boolean;

  public username: string;

  constructor() {
    this.isLoggedIn = false;
    this.username = 'Not Logged In';
    makeObservable(this);
  }

  public async login(username: string, password: string) {
    const bodyFormData = new FormData();
    bodyFormData.append('email', username);
    bodyFormData.append('password', password);
    bodyFormData.append('redir', 'index.php/crew/profile/private');
    bodyFormData.append('action', 'login');
    bodyFormData.append('submit', 'Log In');
    const res = await axios({
      method: 'post',
      url: 'https://zonexecutive.com/index.php/login',
      data: bodyFormData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (
      res.request.responseURL ===
      'https://zonexecutive.com/index.php/crew/profile/private'
    ) {
      runInAction(() => {
        this.isLoggedIn = true;
        this.username = username;
      });
    }
  }
}
export const pilotStore = new PilotStore();
