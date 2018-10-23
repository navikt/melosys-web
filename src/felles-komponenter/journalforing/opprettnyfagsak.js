import React, { Component } from 'react';

import { connect } from 'react-redux';
import { change } from 'redux-form';

import PT from 'prop-types';

import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';

import './opprettnyfagsak.css';
import LandVelger from '../skjema/landvelger';
import * as Utils from '../../utils/utils';
import * as Konstanter from '../../constants';

class OpprettNyFagSak extends Component {
  state = { spinner: {} };
  toggleSpinn = (navn, spin) => ({ spinner: { ...this.state.spinner, [navn]: spin } });
  spinner = async (navn, ms = 1000) => {
    this.setState(this.toggleSpinn(navn, true));
    await Utils.delay(ms);
    this.setState(this.toggleSpinn(navn, false));
  };

  erGyldigOrgnummer = verdi => verdi.length === Konstanter.ANTALL_TALL_I_ORGNR;

  sjekkArbeidsgiver = async verdi => {
    const { erGyldigOrgnummer } = this;
    const { settFeltInnhold, hentOgVisRepresentant } = this.props;
    if (erGyldigOrgnummer(verdi)) {
      await this.spinner('representantNavn');
      await hentOgVisRepresentant(verdi);
    } else {
      await settFeltInnhold('representantNavn', '');
    }
  };

  IDFeltTastOppHandler = async event => {
    const { id: opprinneligFeltID, value } = event.target;
    if (opprinneligFeltID === 'representantID') { await this.sjekkArbeidsgiver(value); }
  };

  render() {
    const { spinner: { representantNavn: visArbeidsgiverSpinner } } = this.state;

    const { opprettFagsak } = this.props;
    return (
      <div className="opprettnysak">
        <Nav.Systemtittel>Opprett ny sak</Nav.Systemtittel>
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.Input feltNavn="representantID" label="Representantens organisasjonsnummer" onKeyUp={this.IDFeltTastOppHandler} />
            <Skjema.Input feltNavn="representantNavn" label="Representantens navn" disabled />
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
  }
}

OpprettNyFagSak.propTypes = {
  opprettFagsak: PT.func.isRequired,
};


const mapDispatchToProps = dispatch => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(change('journalforing', feltNavn, verdi)),
});

export default connect(null, mapDispatchToProps)(OpprettNyFagSak);
