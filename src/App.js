import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import Rammeverk from './sider/rammeverk';

import Versjon from './debug/versjon';

import { datalastingOperations } from './ducks/datalasting';

export function App({
  children,
  lastAppdata,
}) {
  useEffect(() => {
    lastAppdata();
  }, []);

  return (
    <div className="App">
      <Rammeverk>{children}</Rammeverk>
      <Versjon />
    </div>
  );
}

App.propTypes = {
  children: PT.node,
  lastAppdata: PT.func.isRequired,
};

App.defaultProps = {
  children: undefined,
};

const mapDispatchToProps = dispatch => ({
  lastAppdata: () => dispatch(datalastingOperations.lastAppdata()),
});

export default connect(null, mapDispatchToProps)(App);
