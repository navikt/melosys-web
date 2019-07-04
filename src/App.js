import React from 'react';
import PT from 'prop-types';

import Rammeverk from './sider/rammeverk';

import Versjon from './debug/versjon';

function App({ children }) {
  return (
    <div className="App">
      <Rammeverk>{children}</Rammeverk>
      <Versjon />
    </div>
  );
}

App.defaultProps = {
  children: null,
  routes: null,
};

App.propTypes = {
  children: PT.node,
  routes: PT.node,
};

App.defaultProps = {
  children: undefined,
};
export default App;
