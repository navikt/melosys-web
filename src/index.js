import React from 'react';
import ReactDOM from 'react-dom';
import {Router as ReduxRouter} from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';

import './index.css';
import App from './App';

import createStore from './store';
import routerHistory from './history';
import registerServiceWorker from './registerServiceWorker';

const store = createStore(routerHistory);
window.msys = {store: store};
ReactDOM.render(
  <ReduxProvider store={store}>
    <ReduxRouter history={routerHistory}>
      <App/>
    </ReduxRouter>
  </ReduxProvider>,
  document.getElementById('root')
);

registerServiceWorker();
