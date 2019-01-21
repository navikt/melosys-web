import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import moment from 'moment/moment';
import { kodemap, kodeset } from 'melosys-kodeverk';

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
import { KodeTermSelect } from './kodeTermSelect';
import './sideOppsummering.css';

const termer = kodemap.behandlinger.behandlingsstatus;
const koder = kodeset.behandlinger.behandlingsstatus;

class SideOppsummering extends Component {
  state = {
    behandlingsstatus: 'VELG',
    statusmelding: null,
  };

  componentDidMount() {
    /* Sjekker for undefined da this.props.oppsummering.behandlingsstatus er undefined
     de første gangene komponenten rendres. */
    if (this.props.oppsummering.behandlingsstatus) {
      this.oppdaterValg(this.props.oppsummering.behandlingsstatus.kode);
    }
  }

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

  hentBehandlingsStatusValg = kode => {
    let endreStatusValg = [];

    switch (kode) {
      case koder.VURDER_DOKUMENT:
        endreStatusValg = [
          { kode: koder.AVVENT_DOK_UTL, term: termer.AVVENT_DOK_UTL },
          { kode: koder.AVVENT_DOK_PART, term: termer.AVVENT_DOK_PART },
        ];
        break;
      case koder.AVVENT_DOK_UTL:
        endreStatusValg = [
          { kode: koder.AVVENT_DOK_PART, term: termer.AVVENT_DOK_PART },
        ];
        break;
      case koder.AVVENT_DOK_PART:
        endreStatusValg = [
          { kode: koder.AVVENT_DOK_UTL, term: termer.AVVENT_DOK_UTL },
        ];
        break;
      case koder.UNDER_BEHANDLING:
        return [];
      default:
        return [];
    }

    endreStatusValg = [...endreStatusValg, { kode: koder.UNDER_BEHANDLING, term: termer.UNDER_BEHANDLING }];

    return endreStatusValg;
  };

  render() {
    const {
      redigerbart,
      oppsummering,
      person,
      oppholdUtlandFom,
      oppholdUtlandTom,
    } = this.props;

    if (!oppsummering) return <div />;

    const {
      saksnummer,
      sakstype,
      saksstatus,
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
      henleggHandle,
      gyldigeOppholdsLand,
    } = this.props;

    const gyldigeOppholdsLandSetning = arrayTilKonjunksjon(gyldigeOppholdsLand.map(land => land.term));
    let endreBehandlingsStatusValg = [];
    if (oppsummering.behandlingsstatus) endreBehandlingsStatusValg = this.hentBehandlingsStatusValg(oppsummering.behandlingsstatus.kode);

    return (
      <section aria-label="oppsummeringer" className="sideOppsummering panelSeksjon">
        <Nav.Panel className="saksbehandling__soknadSammendrag">
          {/* START BEHANDLINGSMENY */}
          <Nav.Row>
            <Nav.Column xs="12" md="12">
              <div className="oppsummering__menylinje">
                <Nav.EkspanderbartpanelBase ariaTittel="Behandlingsmeny" className="oppsummering__meny" heading={<div className="behandlingsmeny_title">Behandlingsmeny</div>}>
                  <div className="meny__innhold">
                    { redigerbart && <Nav.Knapp type="hoved" mini className="innhold__element" onClick={lagreOgLukkHandle}>Lagre og lukk</Nav.Knapp> }
                    <Nav.Knapp disabled={!redigerbart} type="hoved" mini className="innhold__element" onClick={tilbakeleggeHandle}>Legg tilbake i kø</Nav.Knapp>
                    <Nav.Knapp disabled={!redigerbart} type="hoved" mini className="innhold__element" onClick={oppfriskSaksopplysningerHandle}>Oppfrisk saksopplysninger</Nav.Knapp>
                    { !redigerbart && <Nav.Knapp type="hoved" mini className="innhold__element" onClick={henleggHandle}>Henlegg sak</Nav.Knapp> }
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
                <dt>Saksstatus:</dt>
                <dd>{kodeverkObjektTilTerm(saksstatus)}</dd>
                <dt>Behandlingsstatus:</dt>
                <dd>{kodeverkObjektTilTerm(behandlingsstatus)}</dd>
                <dt>Arbeids- / Oppholdsland:</dt>
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
                { endreBehandlingsStatusValg.length !== 0 &&
                  <form onSubmit={this.overstyrSubmit}>
                    <KodeTermSelect
                      koder={endreBehandlingsStatusValg}
                      value={this.state.behandlingsstatus}
                      onChange={this.onChange}
                      label="Endre status på behandlingen:"
                      redigerbar={redigerbart}
                    />
                    <Nav.Hovedknapp htmlType="submit" disabled={!redigerbart} onClick={this.sendOppdatering}>Oppdater</Nav.Hovedknapp>
                    {this.state.statusmelding && <div><br /><Nav.AlertStripe type="suksess" className="varsel">{this.state.statusmelding}</Nav.AlertStripe></div>}
                  </form>
                }
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
  redigerbart: PT.bool.isRequired,
  oppsummering: MPT.Oppsummering.isRequired,
  person: MPT.Person.isRequired,
  behandlingsstatusKodeVerk: PT.arrayOf(MPT.Kodeverk).isRequired,
  oppholdUtlandFom: PT.string.isRequired,
  oppholdUtlandTom: PT.string.isRequired,
  gyldigeOppholdsLand: PT.arrayOf(MPT.Kodeverk).isRequired,
  oppfriskSaksopplysningerHandle: PT.func.isRequired,
  lagreOgLukkHandle: PT.func.isRequired,
  tilbakeleggeHandle: PT.func.isRequired,
  henleggHandle: PT.func.isRequired,
  tilForsidenHandle: PT.func.isRequired,
  oppdaterBehandlingsStatus: PT.func.isRequired,
};

const mapStateToProps = state => ({
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
  person: fagsakSelectors.PersonSelector(state),
  oppholdUtlandFom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).fom),
  oppholdUtlandTom: formatterDatoTilNorsk(soknadSelectors.OppholdUtlandPeriodeSelector(state).tom),
  gyldigeOppholdsLand: avklartefaktaSelectors.AvklartefaktaGyldigeOppholdLandSelector(state),
  behandlingsstatusKodeVerk: KodeverkSelectors.behandlingsStatusSelector(state),
  redigerbart: fagsakSelectors.RedigerbartSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterBehandlingsStatus: status => dispatch(fagsakOperations.oppdaterBehandlingsStatus(status)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SideOppsummering);
