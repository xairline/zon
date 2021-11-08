import { action, makeObservable, observable, runInAction } from 'mobx';
import 'reflect-metadata';

export class PilotStore {
  @observable
  public isLoggedIn: boolean;

  public username: string;

  constructor() {
    this.isLoggedIn = true;
    this.username = 'ZE1356';
  }
}
export const pilotStore = new PilotStore();
