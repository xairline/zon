import SquirrelEvents from './app/events/squirrel.events';
import ElectronEvents from './app/events/electron.events';
import UpdateEvents from './app/events/update.events';
import { app, BrowserWindow } from 'electron';
import App from './app/app';
import { XPlaneClient } from './XPlaneClient';
import {
  DATAREF_BATCH_SIZE,
  DATAREF_FEQ,
  DATAREF_FEQ_LANDING,
  DATAREF_STR,
} from '@zon/xplane-data';
import * as http from 'http';

const port = 4444;
const server = http.createServer();

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
        console.debug(`${results.length} - sent`);
        results = [];
      }
      timer = setTimeout(() => {
        connected = false;
        requestDataRef(0);
        ws.send('xplane closed');
        if (timer) {
          clearTimeout(timer);
        }
        console.log('X plane is closed');
      }, 20000);
    },
    debug: false,
  });
  const requestDataRef = (freq: number) => {
    Object.keys(DATAREF_STR).forEach((key) => {
      xPlane.requestDataRef(DATAREF_STR[key], freq);
    });
    if (connected) {
      console.log(`set dataref freq: ${freq}`);
    }
  };

  setInterval(function () {
    if (!connected) {
      if (xPlane.client) {
        xPlane.client.close();
        xPlane.client = null;
      }
      xPlane.initConnection();
      requestDataRef(0);
      requestDataRef(DATAREF_FEQ);
      console.log('reconnect to xplane ...');
    }
  }, 3000);

  // Handle all messages from users.
  ws.on('message', function (msgStr) {
    requestDataRef(DATAREF_FEQ_LANDING);
  });
  // What to do when client disconnect?
  ws.on('close', function (connection) {
    if (xPlane.client) {
      requestDataRef(0);
      xPlane.client.close();
      xPlane.client = null;
    }
  });
});
//start our server
server.listen(port, () => {
  console.log(`Data stream server started on port ${port}`);
});
