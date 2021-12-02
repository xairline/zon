import { IPirep } from '@zon/xplane-data';
import { contextBridge, ipcRenderer } from 'electron';
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
  deleteOfflinePirep: async (offlinePirepFile) => {
    const dataPath = await ipcRenderer.invoke('get-app-data-path');
    const pirepDirPath = path.join(dataPath, 'pirep');
    fs.unlinkSync(path.join(pirepDirPath, offlinePirepFile));
  },
  loadOfflinePirep: async () => {
    const dataPath = await ipcRenderer.invoke('get-app-data-path');
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath);
    }
    const pirepDirPath = path.join(dataPath, 'pirep');
    if (!fs.existsSync(pirepDirPath)) {
      fs.mkdirSync(pirepDirPath);
    }
    const offlinePirepFiles = fs.readdirSync(pirepDirPath);
    const offlinePireps: any[] = [];
    offlinePirepFiles.forEach((offlinePirepFile) => {
      if (offlinePirepFile.startsWith('.')) return;
      const tmpString = fs.readFileSync(
        path.join(pirepDirPath, offlinePirepFile),
        'utf8'
      );
      try {
        offlinePireps.push({
          content: JSON.parse(tmpString),
          path: offlinePirepFile,
        });
      } catch (e) {
        logger.info(`Invalid PIREP: ${offlinePirepFile}`);
        logger.info(e);
      }
    });
    return offlinePireps;
  },
});
