import React from 'react';
import ReactDOM from 'react-dom';
//import { Provider as ReduxProvider } from 'react-redux';
import './index.css';
import App from './App';
//import { Router } from 'react-router-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';

//import createStore from './store';
//import history from './history';

//const store = createStore(history);
/*
ReactDOM.render(
  <ReduxProvider store={store}>
    <Router basename="melosys">
      <App/>
    </Router>
  </ReduxProvider>,
  document.getElementById('root')
);
*/
ReactDOM.render(
  <Router basename="melosys">
    <App/>
  </Router>,
  document.getElementById('root')
);
registerServiceWorker();
