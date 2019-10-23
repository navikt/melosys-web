import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Skjema from '../../../felleskomponenter/skjema/';
import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes/';
import * as Utils from '../../../utils';
import * as Konstanter from '../../../constants';
import * as KV from '../../../kodeverk';
import { formSelectors } from '../../../ducks/form';

import LandVelger from '../../../felleskomponenter/skjema/landvelger';

import './opprettnyfagsak.css';

const uuid = require('uuid/v4');

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

  alleLovvalg = [
    ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004,
    ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009,
    ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004,
  ];

  art16 = [
    KV.kodeTilObjekt(
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1,
      MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004
    ),
    KV.kodeTilObjekt(
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_2,
      MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004
    ),
  ];

  render() {
    const { spinner: { representantNavn: visArbeidsgiverSpinner } } = this.state;
    const {
      sakstyper, behandlingstyper, opprettFagsak, journalforingSkjemaVerdier,
    } = this.props;

    const { opprettnysak_behandlingstype: valgtBehandlingstype } = journalforingSkjemaVerdier;

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
                  .filter(elem => (elem.kode !== MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE))
                  .map(elem => (<option key={elem.kode} value={elem.kode}>{elem.term}</option>))
              }
            </Skjema.Select>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.Input feltNavn="representantID" label="Fullmektigens organisasjonsnummer" onKeyUp={this.IDFeltTastOppHandler} />
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
              <LandVelger feltNavn="journalforingSoknadsland" multiLand />
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
        { valgtBehandlingstype === MKV.Koder.behandlinger.behandlingstyper.ANMODNING_OM_UNNTAK_HOVEDREGEL &&
          <Fragment>
            <Nav.Fieldset legend="Unntak fra lovvalgsland:">
              <Nav.Row>
                <Nav.Column xs="12">
                  <LandVelger label="Velg ett land:" feltNavn="journalforingUnntakFraLovvalgsland" multiLand={false} />
                </Nav.Column>
              </Nav.Row>
            </Nav.Fieldset>
            <Nav.Fieldset legend="Lovvalgsbestemmelse">
              <Nav.Row>
                <Nav.Column xs="12">
                  <Skjema.Select label="Artikkelen det gjelder:" feltNavn="journalforingLovvalgsbestemmelse">
                    { this.art16.map(kodeObjekt => <option key={uuid()} value={kodeObjekt.kode}>{kodeObjekt.term}</option>)}
                  </Skjema.Select>
                </Nav.Column>
              </Nav.Row>
            </Nav.Fieldset>
            <Nav.Fieldset legend="Unntak fra lovvalgsbestemmelse">
              <Nav.Row>
                <Nav.Column xs="12">
                  <Skjema.Select label="Artikkelen det søkes unntak fra:" feltNavn="journalforingUnntakFraLovvalgsbestemmelse">
                    { this.alleLovvalg.map(kodeObjekt => <option key={uuid()} value={kodeObjekt.kode}>{kodeObjekt.term}</option>)}
                  </Skjema.Select>
                </Nav.Column>
              </Nav.Row>
            </Nav.Fieldset>
          </Fragment>
        }
        <Skjema.Checkbox feltNavn="ikkeSendForvaltingsmelding" label="Jeg ønsker ikke å sende forvaltningsmelding" />
        <Skjema.Checkbox feltNavn="skalTilordnes" label="Legg til behandlingen i mine oppgaver" />
        <div className="opprettnysak__knapper">
          <Nav.Knapp className="knapp" onClick={opprettFagsak}>Opprett ny sak</Nav.Knapp>
        </div>
      </div>
    );
  }
}

OpprettNyFagSak.propTypes = {
  opprettFagsak: PT.func.isRequired,
  settFeltInnhold: PT.func.isRequired,
  hentOgVisRepresentant: PT.func.isRequired,
  behandlingstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  sakstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  journalforingSkjemaVerdier: PT.object,
};

OpprettNyFagSak.defaultProps = {
  journalforingSkjemaVerdier: {},
};

const mapStateToProps = state => ({
  journalforingSkjemaVerdier: formSelectors.JournalforingFormSelector(state).values,
});

const mapDispatchToProps = dispatch => ({
  settFeltInnhold: (feltNavn, verdi) => dispatch(change('journalforing', feltNavn, verdi)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OpprettNyFagSak);
