import React from 'react';
import ReactDOM from 'react-dom';
import { Router as ReduxRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';

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
    <ReduxRouter history={routerHistory}>
      <App>
        <Routing />
      </App>
    </ReduxRouter>
  </ReduxProvider>,
  document.getElementById('root')
);

unregister();
