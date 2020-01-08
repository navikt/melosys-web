import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectedRouter } from 'connected-react-router';
import { Provider as ReduxProvider } from 'react-redux';

import * as Constants from './constants';
import './index.css';
import App from './App';
import loadInitialData from './startupDataLoader';

import createStore from './store';
import routerHistory from './history';
import Routing from './routing';
import { unregister } from './registerServiceWorker';

const store = createStore(routerHistory);
loadInitialData(store);


ReactDOM.render(
  <ReduxProvider store={store}>
    <ConnectedRouter basename={Constants.URL_BASENAME} history={routerHistory}>
      <App>
        <Routing />
      </App>
    </ConnectedRouter>
  </ReduxProvider>,
  document.getElementById('root')
);

unregister();
