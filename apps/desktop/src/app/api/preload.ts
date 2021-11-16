import { contextBridge, ipcRenderer } from 'electron';
import * as logger from 'electron-log';
contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,
  logger: logger.functions,
});
