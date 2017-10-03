import React from 'react';
import PT from 'prop-types';
import Rammeverk from './containers/rammeverk';

function App({children}) {
  return (
    <div className="App">
      <Rammeverk>
        {children}
      </Rammeverk>
    </div>
  );
}

App.defaultProps = {
  children: null,
  routes: null,
};

App.propTypes = {
  children: PT.node,
};

App.defaultProps = {
  children: undefined,
};
export default App;
