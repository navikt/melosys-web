import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import moment from 'moment/moment';

import * as Api from '../services/api';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import EnkeltDato from './datoOmrade/enkeltDato';
import { kodeverkObjektTilTerm, kodeTilVerdi } from '../utils/kodeverk';
import { formatterDatoTilNorsk } from '../utils/dato';
import { soknadSelectors } from '../ducks/soknad';
import { KodeverkSelectors } from '../ducks/kodeverk';
import { fagsakOperations, fagsakSelectors } from '../ducks/fagsaker/';
import { avklartefaktaSelectors } from '../ducks/avklartefakta';
import { arrayTilKonjunksjon } from '../utils/streng';
import './sideOppsummering.css';

class SideOppsummering extends Component {
  state = { behandlingsstatus: 'VELG', statusmelding: null };
  onChange = event => {
    const { value } = event.currentTarget;
    this.setState({ behandlingsstatus: value, statusmelding: null });
  };

  overstyrSubmit = event => {
    event.preventDefault();
  };

  oppdaterStatusMelding = () => {
    const { behandlingsstatus } = this.state;
    const hhmm = moment().format('HH:mm');
    this.setState({ behandlingsstatus, statusmelding: `Behandlingstatus ble oppdatert ${hhmm}` });
  };
  sendOppdatering = () => {
    const { behandlingsstatus: kode } = this.state;
    if (kode === 'VELG') {
      return false;
    }
    const { behandlingsstatusKodeVerk, oppdaterBehandlingsStatus, oppsummering: { behandlingID } } = this.props;
    const term = kodeTilVerdi(kode, behandlingsstatusKodeVerk);
    const nystatus = { kode, term };
    Api.Behandlinger.oppdaterStatus(behandlingID, kode).then(() => {
      oppdaterBehandlingsStatus(nystatus);
      this.oppdaterStatusMelding();
    });
    return true;
  };

  render() {
    const {
      oppsummering,
      person,
      oppholdUtlandFom,
      oppholdUtlandTom,
      behandlingsstatusKodeVerk,
    } = this.props;

    if (!oppsummering) return <div />;

    const {
      saksnummer,
      sakstype,
      behandlingsstatus,
      registrertDato,
      sisteOpplysningerHentetDato,
    } = oppsummering;

    const {
      fnr,
      sammensattNavn,
    } = person;

    const {
      lagreOgLukkHandle,
      oppfriskSaksopplysningerHandle,
      tilbakeleggeHandle,
      gyldigeOppholdsLand,
    } = this.props;

    const gyldigeOppholdsLandSetning = arrayTilKonjunksjon(gyldigeOppholdsLand.map(land => land.term));

    return (
      <section aria-label="oppsummeringer" className="sideOppsummering panelSeksjon">
        <Nav.Panel className="saksbehandling__soknadSammendrag">
          {/* START BEHANDLINGSMENY */}
          <Nav.Row>
            <Nav.Column xs="12" md="12">
              <div className="oppsummering__menylinje">
                <Nav.EkspanderbartpanelBase ariaTittel="Behandlingsmeny" className="oppsummering__meny" heading={<div className="behandlingsmeny_title">Behandlingsmeny</div>}>
                  <div className="meny__innhold">
                    <Nav.Knapp type="hoved" mini className="innhold__element" onClick={lagreOgLukkHandle}>Lagre og lukk</Nav.Knapp>
                    <Nav.Knapp type="hoved" mini className="innhold__element" onClick={tilbakeleggeHandle}>Legg tilbake i kø</Nav.Knapp>
                    <Nav.Knapp type="hoved" mini className="innhold__element" onClick={oppfriskSaksopplysningerHandle}>Oppfrisk saksopplysninger</Nav.Knapp>
                  </div>
                </Nav.EkspanderbartpanelBase>
              </div>
            </Nav.Column>
          </Nav.Row>
          {/* END BEHANDLINGSMENY */}
          <Nav.Row>
            <Nav.Column xs="12" md="6">
              <Nav.Undertittel className="soknadSammendrag__header">Søknad</Nav.Undertittel>
            </Nav.Column>
          </Nav.Row>
          {/* START BEHANDLINGSSTATUS */}
          <Nav.Row>
            <Nav.Column xs="12">
              <dl aria-label="behandlingsinformasjon" className="oppsummering__detaljer--rad">
                <dt>Søknadstype:</dt>
                <dd>{kodeverkObjektTilTerm(sakstype)}</dd>
                <dt>Fullt navn:</dt>
                <dd>{sammensattNavn}</dd>
                <dt>Fnr / dnr:</dt>
                <dd>{fnr}</dd>
                <dt>Saksnummer:</dt>
                <dd>{saksnummer || '-'}</dd>
                <dt>Behandlingsstatus:</dt>
                <dd>{kodeverkObjektTilTerm(behandlingsstatus)}</dd>
                <dt>Oppholdsland:</dt>
                <dd>{gyldigeOppholdsLandSetning}</dd>
                <dt>Periode:</dt>
                <dd>{oppholdUtlandFom} - {oppholdUtlandTom}</dd>
                <dt>Sist oppdatert:</dt>
                <dd><EnkeltDato dato={sisteOpplysningerHentetDato} visTidspunkt /></dd>
                <dt>Registrert dato:</dt>
                <dd><EnkeltDato dato={registrertDato} /></dd>
              </dl>
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              <div className="oppsummering__behandlingsstatus">
                <form onSubmit={this.overstyrSubmit}>
                  <Nav.Select value={this.state.behandlingsstatus} onChange={this.onChange} label="Endre status på behandlingen:">
                    <option key="VELG" value="VELG">Velg...</option>
                    <option key="AVVENT_DOK_UTL" value="AVVENT_DOK_UTL">{kodeTilVerdi('AVVENT_DOK_UTL', behandlingsstatusKodeVerk)}</option>
                    <option key="AVVENT_DOK_PART" value="AVVENT_DOK_PART">{kodeTilVerdi('AVVENT_DOK_PART', behandlingsstatusKodeVerk)}</option>
                  </Nav.Select>
                  <Nav.Hovedknapp htmlType="submit" onClick={this.sendOppdatering}>Oppdater</Nav.Hovedknapp>
                  {this.state.statusmelding && <div><br /><Nav.AlertStripe type="suksess" className="varsel">{this.state.statusmelding}</Nav.AlertStripe></div>}
                </form>
              </div>
            </Nav.Column>
          </Nav.Row>
          {/* SLUTT BEHANDLINGSSTATUS */}
        </Nav.Panel>
      </section>
    );
  }
}

SideOppsummering.propTypes = {
  oppsummering: MPT.Oppsummering.isRequired,
  person: MPT.Person.isRequired,
  behandlingsstatusKodeVerk: PT.arrayOf(MPT.Kodeverk).isRequired,
  oppholdUtlandFom: PT.string.isRequired,
  oppholdUtlandTom: PT.string.isRequired,
  gyldigeOppholdsLand: PT.arrayOf(MPT.Kodeverk).isRequired,
  oppfriskSaksopplysningerHandle: PT.func.isRequired,
  lagreOgLukkHandle: PT.func.isRequired,
  tilbakeleggeHandle: PT.func.isRequired,
  oppdaterBehandlingsStatus: PT.func.isRequired,
};

const mapStateToProps = state => ({
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  person: fagsakSelectors.PersonSelector(state),
  oppholdUtlandFom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).fom),
  oppholdUtlandTom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).tom),
  gyldigeOppholdsLand: avklartefaktaSelectors.AvklartefaktaGyldigeOppholdLandSelector(state),
  behandlingsstatusKodeVerk: KodeverkSelectors.behandlingsStatusSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterBehandlingsStatus: status => dispatch(fagsakOperations.oppdaterBehandlingsStatus(status)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SideOppsummering);
