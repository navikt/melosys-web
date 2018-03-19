import React, { Component } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import { Link } from 'react-router-dom';

import Clipboard from './clipboard';

import './versjon.css';

class Versjon extends Component {
  state = { visVersjonDetaljer: false }

  toggleVersjon = () => {
    this.setState({ visVersjonDetaljer: !this.state.visVersjonDetaljer });
  }

  versjon = () => process.env.REACT_APP_VERSION || '(ukjent)';
  byggTidspunkt = () => moment(process.env.REACT_APP_DATETIME).format('DD/MM/YYYY HH:mm') || '(ukjent)';
  byggVersjon = () => process.env.REACT_APP_BUILD_VERSION || '(ukjent)';
  branchVersjon = () => process.env.REACT_APP_BRANCH_NAME || '(lokal)';

  copyToClipBoard = () => {
    const versionString = `Versjon: ${this.versjon()}, Byggetidspunkt: ${this.byggTidspunkt()}, Byggeversjon: ${this.byggVersjon()}, Branch: ${this.branchVersjon()}`; // eslint-disable-line max-len
    Clipboard.copy(versionString);
  }

  render() {
    const versjonKlasse = classnames({ App__versjonering: true, 'App__versjonering--vis': this.state.visVersjonDetaljer });

    return (
      <div className={versjonKlasse}>
        <button className="App__versjonering__ekspandknapp" onClick={this.toggleVersjon}>
          <dl>
            <dt>Versjon:</dt><dd>{this.versjon()}</dd>
            <dt>Build time:</dt><dd>{this.byggTidspunkt()}</dd>
            <dt>Build version:</dt><dd>{this.byggVersjon()}</dd>
            <dt>Branch:</dt><dd>{this.branchVersjon()}</dd>
          </dl>
        </button>
        <button className="App__versjonering__kopierknapp" onClick={this.copyToClipBoard}>Klikk for å kopiere versjonsinfo</button>
        <Link to="/spark" className="App__versjonering__spark">Spark</Link>
      </div>
    );
  }
}

export default Versjon;
