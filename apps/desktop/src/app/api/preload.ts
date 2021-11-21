import { IPirep } from '@zon/xplane-data';
import { contextBridge, ipcRenderer, remote, app } from 'electron';
import * as logger from 'electron-log';
import * as fs from 'fs';
import * as path from 'path';
contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,
  logger: logger.functions,
  savePirep: async (pirep: IPirep) => {
    const dataPath = await ipcRenderer.invoke('get-app-data-path');
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath);
    }
    const pirepDirPath = path.join(dataPath, 'pirep');
    if (!fs.existsSync(pirepDirPath)) {
      fs.mkdirSync(pirepDirPath);
    }
    const pirepPath = path.join(pirepDirPath, `${Date.now()}`);
    fs.writeFileSync(pirepPath, JSON.stringify(pirep));
    return pirepPath;
  },
});
