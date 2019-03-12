/* eslint-disable */
import React, { useState } from 'react';
import classnames from 'classnames';

import Clipboard from './clipboard';

import './versjon.css';

const Versjon  = props => {
  const [visVersjonDetaljer, setState] = useState(false);

  const toggleVersjon = () => {
    setState(!visVersjonDetaljer);
  };

  const versjon = () => (process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : '(ukjent)');
  const byggTidspunkt = () => process.env.REACT_APP_BUILD_DATETIME || '(ukjent)';
  const byggVersjon = () => process.env.REACT_APP_BUILD_VERSION || '(ukjent)';
  const branchVersjon = () => process.env.REACT_APP_BRANCH_NAME || '(lokal)';

  const copyToClipBoard = () => {
    const versionString = `Versjon: ${versjon()}, Byggetidspunkt: ${byggTidspunkt()}, Byggeversjon: ${byggVersjon()}, Branch: ${branchVersjon()}`; // eslint-disable-line max-len
    Clipboard.copy(versionString);
  };


  const versjonKlasse = classnames({ App__versjonering: true, 'App__versjonering--vis': visVersjonDetaljer });
  const versjonInnhold = visVersjonDetaljer ?
    <div className="versjonInnhold">
      <dl>
        <dt>Build time:</dt><dd>{byggTidspunkt()}</dd>
        <dt>Build version:</dt><dd>{byggVersjon()}</dd>
        <dt>Branch:</dt><dd>{branchVersjon()}</dd>
      </dl>
      <button className="App__versjonering__kopierknapp" onClick={copyToClipBoard}>Klikk for å kopiere versjonsinfo</button>
    </div>
    : null;
  const innhold = (
    <div className={versjonKlasse} onClick={toggleVersjon}>
      <button className="App__versjonering__ekspandknapp">
        {versjon()}
      </button>
      { versjonInnhold }
    </div>
  );
  return innhold;
};

export default Versjon;
