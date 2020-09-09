import React, { useState } from 'react';
import classnames from 'classnames';
import PT from 'prop-types';
import { DokumentOversikt, FysiskDokument } from 'Domene';

import * as Nav from '../../utils/navFrontend';
import * as Utils from '../../utils';

import SideDialogDokumenter from './sideDialogDokumenter';
import SideDialogBrevBestilling from './brevBestilling';
import SideDialogOpprettNyBuc from './sideDialogOpprettNyBuc';
import SideDialogBesvarSed from './sideDialogBesvarSed';
import SideDialogNotater from './sideDialogNotater/sideDialogNotater';

import './sideDialog.css';

interface FaneViserProps {
  navn: FaneNavn,
  saksnummer: string,
  behandlingID: number,
  brevBestillingRedigerbartIArtikkel13: boolean,
  brevBestillingRedigerbart: boolean,
  redigerbart: boolean,
  dokumentOversikt: DokumentOversikt[],
  dokumenter: FysiskDokument[],
}

export const FaneViser = ({
  navn,
  behandlingID,
  saksnummer,
  brevBestillingRedigerbartIArtikkel13,
  brevBestillingRedigerbart,
  redigerbart,
  dokumentOversikt,
  dokumenter,
}: FaneViserProps) => {
  switch (navn) {
    case 'dokumenter':
      return <SideDialogDokumenter dokumentOversikt={dokumentOversikt} />;
    case 'brevbestilling':
      return <SideDialogBrevBestilling
        behandlingID={behandlingID}
        redigerbart={brevBestillingRedigerbart}
        brevBestillingRedigerbartIArtikkel13={brevBestillingRedigerbartIArtikkel13}
      />;
    case 'sedbestilling':
      return <SideDialogOpprettNyBuc behandlingID={behandlingID} dokumenter={dokumenter} />;
    case 'besvarsed':
      return <SideDialogBesvarSed behandlingID={behandlingID} />;
    case 'notat':
      return <SideDialogNotater
        saksnummer={saksnummer}
        redigerbart={redigerbart}
      />;
    default:
      throw new Error('Navn er en påkrevd prop');
  }
};

type FaneNavn = 'sedbestilling' | 'dokumenter' | 'notat' | 'brevbestilling' | 'besvarsed';

type Fane = { navn: FaneNavn, tittel: string };

interface SideDialogProps {
  faner?: Fane[],
  saksnummer: string,
  behandlingID: number,
  brevBestillingRedigerbartIArtikkel13: boolean,
  brevBestillingRedigerbart: boolean,
  redigerbart: boolean,
  dokumentOversikt: DokumentOversikt[],
  dokumenter: FysiskDokument[],
}

const SideDialog = ({
  behandlingID,
  saksnummer,
  brevBestillingRedigerbart,
  brevBestillingRedigerbartIArtikkel13,
  redigerbart,
  dokumentOversikt,
  dokumenter,
  faner = [],
}: SideDialogProps) => {
  const [aktivFane, setAktivFane] = useState<FaneNavn>(faner[0].navn);

  return (
    <div className="dialog panelSeksjon">
      <Nav.Panel>
        <div className="dialog__meny" role="navigation">
          { faner.map(fane => (
            <button
              className={classnames({ meny__element: true, 'meny__element--aktiv': (fane.navn === aktivFane) })}
              key={Utils._uuid()}
              onClick={() => setAktivFane(fane.navn)}>{fane.tittel}
            </button>))}
        </div>
        <div>
          <FaneViser
            navn={aktivFane}
            behandlingID={behandlingID}
            saksnummer={saksnummer}
            brevBestillingRedigerbartIArtikkel13={brevBestillingRedigerbartIArtikkel13}
            brevBestillingRedigerbart={brevBestillingRedigerbart}
            redigerbart={redigerbart}
            dokumentOversikt={dokumentOversikt}
            dokumenter={dokumenter}
          />
        </div>
      </Nav.Panel>
    </div>
  );
};

SideDialog.propTypes = {
  faner: PT.arrayOf(PT.object),
  saksnummer: PT.string.isRequired,
  behandlingID: PT.number.isRequired,
  brevBestillingRedigerbartIArtikkel13: PT.bool.isRequired,
  brevBestillingRedigerbart: PT.bool.isRequired,
  redigerbart: PT.bool.isRequired,
  dokumentOversikt: PT.arrayOf(PT.object).isRequired,
  dokumenter: PT.arrayOf(PT.object).isRequired,
};

SideDialog.defaultProps = {
  faner: [
    { navn: 'dokumenter', tittel: 'Dokumenter' },
    { navn: 'notat', tittel: 'Notat' },
    { navn: 'brevbestilling', tittel: 'Send brev' },
    { navn: 'sedbestilling', tittel: 'Opprett ny BUC' },
    { navn: 'besvarsed', tittel: 'SED-utveksling' },
  ],
};

export default SideDialog;
