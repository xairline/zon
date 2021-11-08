import { makeObservable, observable } from 'mobx';
import { routes } from '../app/app';

class RouterStore {
  @observable
  public selectedMenuKey: number;

  constructor() {
    this.selectedMenuKey = 0;
    makeObservable(this);
  }

  getDefaultSelectedKeys(): string {
    const hashPath = window.location.hash.replace('#', '');
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].path === hashPath) {
        return `${i}`;
      }
    }
    return '';
  }
}
export const routerStore = new RouterStore();
