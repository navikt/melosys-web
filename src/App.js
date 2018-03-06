import React from 'react';
import PT from 'prop-types';
import Rammeverk from './sider/rammeverk';

function App({ children }) {
  return (
    <div className="App">
      <Rammeverk>{children}</Rammeverk>
      <dl>
        <dt>Versjon</dt><dd>{process.env.REACT_APP_VERSION}</dd>
        <dt>Build time</dt><dd>{process.env.REACT_APP_DATETIME}</dd>
        <dt>Build version</dt><dd>{process.env.REACT_APP_BUILD_VERSION}</dd>
        <dt>Branch</dt><dd>{process.env.REACT_APP_BRANCH_NAME}</dd>
      </dl>
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
