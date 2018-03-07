import React, { Component } from 'react';
import PT from 'prop-types';
import classnames from 'classnames';

import Rammeverk from './sider/rammeverk';

import './App.css';

class App extends Component {
  state = { visVersjonDetaljer: false }

  toggleVersjon = () => {
    this.setState({ visVersjonDetaljer: !this.state.visVersjonDetaljer });
  }

  render() {
    const { children } = this.props;
    const versjonKlasse = classnames({ App__versjonering: true, 'App__versjonering--vis': this.state.visVersjonDetaljer });
    return (
      <div className="App">
        <Rammeverk>{children}</Rammeverk>
        <button className="App__versjonering__knapp" onClick={this.toggleVersjon}>
          <dl className={versjonKlasse}>
            <dt>Versjon:</dt><dd>{process.env.REACT_APP_VERSION}</dd>
            <dt>Build time:</dt><dd>{process.env.REACT_APP_DATETIME}</dd>
            <dt>Build version:</dt><dd>{process.env.REACT_APP_BUILD_VERSION}</dd>
            <dt>Branch:</dt><dd>{process.env.REACT_APP_BRANCH_NAME}</dd>
          </dl>
        </button>
      </div>
    );
  }
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
