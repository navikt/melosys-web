import React, { Fragment } from 'react';
import PT from 'prop-types';
import MKV from 'melosys-kodeverk';

import * as Skjema from '../../../felleskomponenter/skjema/';
import * as Nav from '../../../utils/navFrontend';
import * as Konstanter from '../../../constants';
import * as KV from '../../../kodeverk';

import './avsendervelger.css';

const clsBehandlingsPanel = {
  background: 'lightgray',
  border: '1px solid #b7b1a9',
  borderRadius: '3px',
  margin: '0.5em 0.5em 0.5em 1.5em',
  padding: '0.25em 1.25em 0 1.25em',
};

export const AvsenderOrganisasjon = props => {
  const erGyldigOrgnummer = verdi => verdi.length === Konstanter.ANTALL_TALL_I_ORGNR;
  const sjekkArbeidsgiver = async verdi => {
    const { settFeltInnhold, hentOgVisRepresentant } = props;
    if (erGyldigOrgnummer(verdi)) {
      // TODO await this.spinner('representantNavn');
      await hentOgVisRepresentant(verdi);
    } else {
      await settFeltInnhold('representantNavn', '');
    }
  };
  const IDFeltTastOppHandler = async event => {
    const { id: opprinneligFeltID, value } = event.target;
    if (opprinneligFeltID === 'representantID') { await sjekkArbeidsgiver(value); }
  };
  return (
    <div style={clsBehandlingsPanel}>
      <Nav.typo.Element>Avsender firmanavn</Nav.typo.Element>
      <Skjema.Input feltNavn="representantID" label="Fullmektigens organisasjonsnummer" onKeyUp={IDFeltTastOppHandler} />
      <Skjema.Input feltNavn="representantNavn" label="Organisasjonsnavn" disabled />
    </div>
  );
};
AvsenderOrganisasjon.propTypes = {
  settFeltInnhold: PT.func.isRequired,
  hentOgVisRepresentant: PT.func.isRequired,
};

export const AvsenderUtenlanskTrygdemyndighet = ({
  utenlandskTrygdemyndighetLandkode, fullmektigLandEndret,
}) => (
  <div style={clsBehandlingsPanel}>
    <Skjema.LandVelger feltNavn="utenlandskTrygdemyndighetLandkode" label="Velg land" onChange={fullmektigLandEndret} />
    {
      utenlandskTrygdemyndighetLandkode &&
      <Fragment>
        <Nav.typo.Element>Avsender</Nav.typo.Element>
        <Nav.typo.Normaltekst>Trygdemyndighet i {KV.kodeTilTerm(utenlandskTrygdemyndighetLandkode, MKV.KTObjects.landkoder)}</Nav.typo.Normaltekst>
      </Fragment>
    }
  </div>
);

AvsenderUtenlanskTrygdemyndighet.propTypes = {
  utenlandskTrygdemyndighetLandkode: PT.string,
  fullmektigLandEndret: PT.func.isRequired,
};
AvsenderUtenlanskTrygdemyndighet.defaultProps = {
  utenlandskTrygdemyndighetLandkode: '',
};

export const AvsenderAnnet = () => (
  <div style={clsBehandlingsPanel}>
    <Skjema.Input
      feltNavn="avsenderNavn"
      label="Oppgi avsenders navn"
      placeholder="Skriv inn..."
    />
  </div>
);
