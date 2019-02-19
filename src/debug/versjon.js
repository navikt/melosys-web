/* eslint-disable */
import React, { Component } from 'react';
import classnames from 'classnames';

import Clipboard from './clipboard';

import './versjon.css';

class Versjon extends Component {
  state = { visVersjonDetaljer: false };

  toggleVersjon = () => {
    this.setState({ visVersjonDetaljer: !this.state.visVersjonDetaljer });
  };

  versjon = () => (process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : '(ukjent)');
  byggTidspunkt = () => process.env.REACT_APP_BUILD_DATETIME || '(ukjent)';
  byggVersjon = () => process.env.REACT_APP_BUILD_VERSION || '(ukjent)';
  branchVersjon = () => process.env.REACT_APP_BRANCH_NAME || '(lokal)';

  copyToClipBoard = () => {
    const versionString = `Versjon: ${this.versjon()}, Byggetidspunkt: ${this.byggTidspunkt()}, Byggeversjon: ${this.byggVersjon()}, Branch: ${this.branchVersjon()}`; // eslint-disable-line max-len
    Clipboard.copy(versionString);
  };

  render() {
    const versjonKlasse = classnames({ App__versjonering: true, 'App__versjonering--vis': this.state.visVersjonDetaljer });
    const versjonInnhold = this.state.visVersjonDetaljer ?
      <div className="versjonInnhold">
        <dl>
          <dt>Build time:</dt><dd>{this.byggTidspunkt()}</dd>
          <dt>Build version:</dt><dd>{this.byggVersjon()}</dd>
          <dt>Branch:</dt><dd>{this.branchVersjon()}</dd>
        </dl>
        <button className="App__versjonering__kopierknapp" onClick={this.copyToClipBoard}>Klikk for å kopiere versjonsinfo</button>
      </div>
      : null;

    return (
      <div className={versjonKlasse} onClick={this.toggleVersjon}>
        <button className="App__versjonering__ekspandknapp">
          {this.versjon()}
        </button>
        { versjonInnhold }
      </div>
    );
  }
}

export default Versjon;
