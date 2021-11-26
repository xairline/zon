import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.dark.css';

import { HashRouter } from 'react-router-dom';

import App from './app/app';
declare global {
  interface Window {
    electron?: any;
    tb?:any;
  }
}

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
