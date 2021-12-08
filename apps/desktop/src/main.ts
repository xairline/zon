import { DATAREF_BATCH_SIZE, DATAREF_FEQ, DATAREF_STR } from '@zon/xplane-data';
import { app, BrowserWindow } from 'electron';
import * as logger from 'electron-log';
import * as http from 'http';
import App from './app/app';
import ElectronEvents from './app/events/electron.events';
import SquirrelEvents from './app/events/squirrel.events';
import { XPlaneClient } from './XPlaneClient';

const port = 4444;
const server = http.createServer();
let myInterval;

export default class Main {
  static initialize() {
    if (SquirrelEvents.handleEvents()) {
      // squirrel event handled (except first run event) and app will exit in 1000ms, so don't do anything else
      app.quit();
    }
  }

  static bootstrapApp() {
    App.main(app, BrowserWindow);
  }

  static bootstrapAppEvents() {
    ElectronEvents.bootstrapElectronEvents();

    // initialize auto updater service
    if (!App.isDevelopmentMode()) {
      // UpdateEvents.initAutoUpdateService();
    }
  }
}

// handle setup events as quickly as possible
Main.initialize();

// bootstrap app
Main.bootstrapApp();
Main.bootstrapAppEvents();

// ws
// eslint-disable-next-line @typescript-eslint/no-var-requires
const WebSocket = require('ws');
const wss = new WebSocket.Server({ noServer: true });
server.on('upgrade', function upgrade(request, socket, head) {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request);
  });
});
wss.on('connection', function connection(ws, request) {
  // xplane
  let connected = false;
  let results: any[] = [];
  let timer;

  const xPlane = new XPlaneClient({
    dataRefCallback: (result) => {
      clearTimeout(timer);
      connected = true;
      results.push(result);
      if (results.length === DATAREF_BATCH_SIZE) {
        ws.send(JSON.stringify(results));
        results = [];
      }

      timer = setTimeout(() => {
        connected = false;
        ws.send('xplane closed');
        if (timer) {
          clearTimeout(timer);
        }
        logger.info('X plane is closed');
      }, 60000);
    },
    debug: false,
  });
  xPlane.initConnection();
  logger.info('initialize connection to xplane');

  const requestDataRef = (freq: number) => {
    Object.keys(DATAREF_STR).forEach((key) => {
      xPlane.requestDataRef(DATAREF_STR[key], freq);
    });
    if (connected) {
      logger.info(`set dataref freq: ${freq}`);
    }
  };

  clearInterval(myInterval);
  myInterval = setInterval(function () {
    if (!connected) {
      requestDataRef(DATAREF_FEQ);
      logger.info('reconnect to xplane ...');
    }
  }, 5000);

  // Handle all messages from users.
  ws.on('message', function (msgStr) {
    if (msgStr.toString() === 'ping') {
      ws.send('pong');
      return;
    }
    requestDataRef(parseInt(msgStr));
  });
  // What to do when client disconnect?
  ws.on('close', function (connection) {
    if (xPlane.client) {
      requestDataRef(0);
      xPlane.client.close();
      xPlane.client = null;
      logger.info(`backend: close udp client`);
    }
  });
});
//start our server
server.listen(port, () => {
  logger.info(`Data stream server started on port ${port}`);
});
