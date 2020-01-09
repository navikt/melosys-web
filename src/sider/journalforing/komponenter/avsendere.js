import React, { Fragment } from 'react';
import PT from 'prop-types';
import MKV from 'melosys-kodeverk';

import * as Skjema from '../../../felleskomponenter/skjema/';
import * as Nav from '../../../utils/navFrontend';
import * as Konstanter from '../../../constants';
import * as KV from '../../../kodeverk';

import './avsendervelger.css';

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
    <div className="avsender">
      <Skjema.Input feltNavn="avsenderID" label="Oppgi avsenders org.nr." onKeyUp={IDFeltTastOppHandler} />
      <Skjema.Input feltNavn="avsenderNavn" label="Organisasjonsnavn" disabled />
      {
        props.children
      }
    </div>
  );
};
AvsenderOrganisasjon.propTypes = {
  settFeltInnhold: PT.func.isRequired,
  hentOgVisRepresentant: PT.func.isRequired,
  children: PT.node,
};

AvsenderOrganisasjon.defaultProps = {
  children: null,
};

export const AvsenderFullmektig = ({ settFeltInnhold, hentOgVisRepresentant }) => {
  const fullmektigFor = [
    {
      kode: 'ARBEIDSGIVER',
      term: 'Arbeidsgiver',
    },
    {
      kode: 'ARBEIDSTAKER',
      term: 'Arbeidstaker',
    },
    {
      kode: 'ARBEIDSGIVER_OG_ARBEIDSTAKER',
      term: 'Både arbeidsgiver og arbeidstaker',
    },
  ];

  return (
    <AvsenderOrganisasjon settFeltInnhold={settFeltInnhold} hentOgVisRepresentant={hentOgVisRepresentant}>
      <Skjema.Select feltNavn="fullmektigFor" label="Hvem er dette fullmektig for">
        {
          fullmektigFor.map(({ kode, term }) => (
            <option key={kode} value={kode}>{term}</option>
          ))
        }
      </Skjema.Select>
    </AvsenderOrganisasjon>
  );
};

AvsenderFullmektig.propTypes = {
  settFeltInnhold: PT.func.isRequired,
  hentOgVisRepresentant: PT.func.isRequired,
};

export const AvsenderUtenlanskTrygdemyndighet = ({
  utenlandskTrygdemyndighetLandkode, fullmektigLandEndret,
}) => (
  <div className="avsender">
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
  <div className="avsender">
    <Skjema.Input
      feltNavn="avsenderNavn"
      label="Oppgi avsenders navn"
      placeholder="Skriv inn..."
    />
  </div>
);
