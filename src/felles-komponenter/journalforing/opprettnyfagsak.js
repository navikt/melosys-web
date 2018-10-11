import React, { Component } from 'react';

import PT from 'prop-types';

import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';

import './opprettnyfagsak.css';
import LandVelger from '../skjema/landvelger';
import * as Utils from '../../utils/utils';
import * as Konstanter from '../../constants';

class OpprettNyFagSak extends Component {
  state = { spinner: {} };
  /*
  async componentDidMount() {
    await this.oppdaterFelter(this.props, true);
  }

  async componentDidUpdate(prevProps) {
    await this.oppdaterFelter(prevProps);
  }
  oppdaterFelter = async (props, tvingOppdatering) => {
    const { arbeidsgiverID, representantID } = props.journalforingSkjemaVerdier;
  };
  */
  toggleSpinn = (navn, spin) => ({ spinner: { ...this.state.spinner, [navn]: spin } });
  spinner = async (navn, ms = 1000) => {
    this.setState(this.toggleSpinn(navn, true));
    await Utils.delay(ms);
    this.setState(this.toggleSpinn(navn, false));
  };

  erGyldigOrgnummer = verdi => verdi.length === Konstanter.ANTALL_TALL_I_ORGNR;
  sjekkArbeidsgiver = async verdi => {
    const { erGyldigOrgnummer } = this;
    const { settFeltInnhold, hentOgVisArbeidsgiver } = this.props;
    if (erGyldigOrgnummer(verdi)) {
      await this.spinner('arbeidsgiverNavn');
      await hentOgVisArbeidsgiver(verdi);
    } else {
      await settFeltInnhold('arbeidsgiverNavn');
    }
  };

  IDFeltTastOppHandler = async event => {
    const { id: opprinneligFeltID, value } = event.target;
    if (opprinneligFeltID === 'arbeidsgiverID') { await this.sjekkArbeidsgiver(value); }
  };

  render() {
    const { spinner: { arbeidsgiverNavn: visArbeidsgiverSpinner } } = this.state;

    const { opprettFagsak } = this.props;
    return (
      <div className="opprettnysak">
        <Nav.Systemtittel>Opprett ny sak</Nav.Systemtittel>
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.Input feltNavn="arbeidsgiverID" label="Representantens organisasjonsnummer" onKeyUp={this.IDFeltTastOppHandler} />
            <Skjema.Input feltNavn="arbeidsgiverNavn" label="Representantens navn" />
            { visArbeidsgiverSpinner && <Nav.NavFrontendSpinner className="informasjon__spinner" /> }
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
  }
}

OpprettNyFagSak.propTypes = {
  opprettFagsak: PT.func.isRequired,
};

export default OpprettNyFagSak;
