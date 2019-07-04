/* eslint-disable */
import React, { useState, useEffect } from 'react';
import classnames from 'classnames';

import Clipboard from './clipboard';
import * as Api from '../services/api';
import * as Utils from '../utils';
import './versjon.css';

function Versjon() {
  const [visVersjonDetaljer, setVisVersjonDetaljer] = useState(false);
  const [serverInfo, setServerInfo] = useState({});

  const toggleVersjon = () => {
    setVisVersjonDetaljer(!visVersjonDetaljer);
  };

  const versjon = () => (process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : '(ukjent)');
  const byggTidspunkt = () => process.env.REACT_APP_BUILD_DATETIME || '(ukjent)';
  const byggVersjon = () => process.env.REACT_APP_BUILD_VERSION || '(ukjent)';
  const branchVersjon = () => process.env.REACT_APP_BRANCH_NAME || '(lokal)';

  const hentServerInfo = async () => {
    try {
      const serverinfo = await Api.ServerInfo.hentServerInfo();
      setServerInfo({...serverinfo});
    }
    catch (e) {
      Utils.logger.error(e);
    }
  };
  useEffect(() => {
    hentServerInfo();
  }, []);

  const copyToClipBoard = () => {
    const clientVersionString = `WEB; Versjon: ${versjon()}, Byggetidspunkt: ${byggTidspunkt()}, Byggeversjon: ${byggVersjon()}, Branch: ${branchVersjon()}`; // eslint-disable-line max-len
    const { namespace, cluster, branchName, veraUrl, longVersionHash} = serverInfo;
    const serverVersionString = `SERVER; Namespace: ${namespace}, Cluster: ${cluster} BranchName: ${branchName}, Vera: ${veraUrl}, VersionHash: ${longVersionHash}, Branch: ${branchVersjon()}`; // eslint-disable-line max-len
    const versionString = clientVersionString + '\n' + serverVersionString;
    Clipboard.copy(versionString);
  };

  const versjonKlasse = classnames({ App__versjonering: true, 'App__versjonering--vis': visVersjonDetaljer });
  const versjonInnhold = visVersjonDetaljer ?
    <div className="versjonInnhold">
      <dl>
        <dt>Web</dt><dd />
        <dt>Build time:</dt><dd>{byggTidspunkt()}</dd>
        <dt>Build version:</dt><dd>{byggVersjon()}</dd>
        <dt>Branch:</dt><dd>{branchVersjon()}</dd>
        <dt>&nbsp;</dt><dd />
        <dt>Server</dt><dd />
        <dt>Namespace:</dt><dd>{serverInfo.namespace}</dd>
        <dt>Cluster:</dt><dd>{serverInfo.cluster}</dd>
        <dt>BranchName:</dt><dd>{serverInfo.branchName}</dd>
        <dt>Vera:</dt><dd>{serverInfo.veraUrl}</dd>
        <dt>VersionHash:</dt><dd>{serverInfo.longVersionHash}</dd>
      </dl>
      <button className="App__versjonering__kopierknapp" onClick={copyToClipBoard}>Klikk for å kopiere versjonsinfo</button>
    </div>
    : null;

  return (
    <div className={versjonKlasse} onClick={toggleVersjon}>
      <button className="App__versjonering__ekspandknapp">
        {versjon()}
      </button>
      { versjonInnhold }
    </div>
  );
}

export default Versjon;
