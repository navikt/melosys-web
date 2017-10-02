import React from 'react';
import PT from 'prop-types';
import Hovedside from './containers/hovedside';

function App({children}) {
  return (
    <div className="App">
      <Hovedside>
        {children}
      </Hovedside>
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
