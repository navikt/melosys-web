import React, { useState } from 'react';

import { connect } from 'react-redux';
import { change } from 'redux-form';

import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/';

import './opprettnyfagsak.css';
import LandVelger from '../skjema/landvelger';
import * as Utils from '../../utils';
import * as Konstanter from '../../constants';

const OpprettNyFagSak = props => {
  const [spinner, setState] = useState({});
  const toggleSpinn = (navn, spin) => ({ ...spinner, [navn]: spin });
  const spinn = async (navn, ms = 1000) => {
    setState(toggleSpinn(navn, true));
    await Utils.delay(ms);
    setState(toggleSpinn(navn, false));
  };

  const erGyldigOrgnummer = verdi => verdi.length === Konstanter.ANTALL_TALL_I_ORGNR;

  const sjekkArbeidsgiver = async verdi => {
    const { settFeltInnhold, hentOgVisRepresentant } = props;
    if (erGyldigOrgnummer(verdi)) {
      await spinn('representantNavn');
      await hentOgVisRepresentant(verdi);
    } else {
      await settFeltInnhold('representantNavn', '');
    }
  };

  const IDFeltTastOppHandler = async event => {
    const { id: opprinneligFeltID, value } = event.target;
    if (opprinneligFeltID === 'representantID') { await sjekkArbeidsgiver(value); }
  };

  const { sakstyper, behandlingstyper, opprettFagsak } = props;
  const { representantNavn: visArbeidsgiverSpinner } = spinner;
  return (
    <div className="opprettnysak">
      <Nav.Systemtittel>Opprett ny sak</Nav.Systemtittel>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Select feltNavn="sakstype" bredde="fullbredde" label="Sakstype" disabled>
            { sakstyper.map(elem => (<option key={elem.kode} value={elem.kode}>{elem.term}</option>)) }
          </Skjema.Select>
        </Nav.Column>
        <Nav.Column xs="6">
          <Skjema.Select feltNavn="opprettnysak_behandlingstype" bredde="fullbredde" label="Behandlingstype">
            {
              behandlingstyper &&
              behandlingstyper
                .filter(elem => (elem.kode !== MKV.Koder.behandlinger.typer.ANKE && elem.kode !== MKV.Koder.behandlinger.typer.KLAGE))
                .map(elem => (<option key={elem.kode} value={elem.kode}>{elem.term}</option>))
            }
          </Skjema.Select>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input feltNavn="representantID" label="Fullmektigens organisasjonsnummer" onKeyUp={IDFeltTastOppHandler} />
          <Skjema.Input feltNavn="representantNavn" label="Organisasjonsnavn" disabled />
          <Skjema.Input feltNavn="representantKontaktPerson" label="Kontaktperson hos fullmektig" />
          { visArbeidsgiverSpinner && <Nav.NavFrontendSpinner className="sok__spinner" /> }
        </Nav.Column>
      </Nav.Row>
      <Nav.Fieldset legend="Soknadperiode:" className="opprettnysak__soknadsperiode">
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.Input datoFelt label="Fra" feltNavn="journalforingPeriodeFraOgMed" />
          </Nav.Column>
          <Nav.Column xs="6">
            <Skjema.Input datoFelt label="Til" feltNavn="journalforingPeriodeTilOgMed" />
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
      <Nav.Fieldset legend="Land:">
        <Nav.Row>
          <Nav.Column xs="12">
            <LandVelger feltNavn="journalforingOppholdsLand" multiLand />
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
      <div className="opprettnysak__knapper">
        <Nav.Knapp className="knapp" onClick={opprettFagsak}>Opprett ny sak</Nav.Knapp>
      </div>
    </div>
  );
};

OpprettNyFagSak.propTypes = {
  opprettFagsak: PT.func.isRequired,
  settFeltInnhold: PT.func.isRequired,
  hentOgVisRepresentant: PT.func.isRequired,
  behandlingstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  sakstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
};


const mapDispatchToProps = dispatch => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(change('journalforing', feltNavn, verdi)),
});

export default connect(null, mapDispatchToProps)(OpprettNyFagSak);
