import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import moment from 'moment/moment';
import * as MKV from 'melosys-kodeverk';

import * as Utils from '../utils/';
import * as KV from '../kodeverk';
import * as Api from '../services/api';
import * as Nav from '../utils/navFrontend';

import * as MPT from '../proptypes/';
import EnkeltDato from '../komponenter/datoOmrade/enkeltDato';
import { formatterDatoTilNorsk } from '../utils/dato';
import { soknadSelectors } from '../ducks/soknad';
import { fagsakSelectors } from '../ducks/fagsaker/';
import { behandlingerOperations, behandlingerSelectors } from '../ducks/behandlinger/';
import { avklartefaktaSelectors } from '../ducks/avklartefakta';
import { KodeTermSelect } from './kodeTermSelect';
import Behandlingsmeny from './behandlingsmeny';

import './sideOppsummering.css';

class SideOppsummering extends Component {
  state = {
    behandlingsstatus: 'VELG',
    statusmelding: null,
  };

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
    const { oppdaterBehandlingsStatus, behandlingID } = this.props;
    const term = KV.kodeTilTerm(kode, MKV.KTObjects.behandlinger.status);
    const nyBehandlingsStatus = { kode, term };
    Api.Behandlingsperioder.oppdaterStatus(behandlingID, kode).then(() => {
      oppdaterBehandlingsStatus(nyBehandlingsStatus);
      this.oppdaterStatusMelding();
    });
    return true;
  };

  hentBehandlingsStatusValg = kode => {
    let endreStatusValg = [];

    switch (kode) {
      case MKV.Koder.behandlinger.status.VURDER_DOKUMENT:
        endreStatusValg = [
          { kode: MKV.Koder.behandlinger.status.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.status.AVVENT_DOK_UTL },
          { kode: MKV.Koder.behandlinger.status.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.status.AVVENT_DOK_PART },
        ];
        break;
      case MKV.Koder.behandlinger.status.AVVENT_DOK_UTL:
        endreStatusValg = [
          { kode: MKV.Koder.behandlinger.status.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.status.AVVENT_DOK_PART },
        ];
        break;
      case MKV.Koder.behandlinger.status.AVVENT_DOK_PART:
        endreStatusValg = [
          { kode: MKV.Koder.behandlinger.status.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.status.AVVENT_DOK_UTL },
        ];
        break;
      case MKV.Koder.behandlinger.status.UNDER_BEHANDLING:
        return [];
      default:
        return [];
    }

    endreStatusValg = [...endreStatusValg, { kode: MKV.Koder.behandlinger.status.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.status.UNDER_BEHANDLING }];
    return endreStatusValg;
  };

  apneTidligereBehandlinger = () => {
    const URI_SOK = `/sok/${this.props.person.fnr}`;
    window.open(URI_SOK);
  };

  render() {
    const {
      redigerbart,
      fagsak,
      oppsummering,
      person,
      soknadsperiodeFom,
      soknadsperiodeTom,
      behandlingstype,
    } = this.props;

    if (!oppsummering) return <div />;

    const {
      saksnummer,
      sakstype,
      saksstatus,
      registrertDato,
    } = fagsak;

    const {
      behandlingsstatus,
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
      visHenleggDialogHandle,
      visAvslaSoknadDialogHandle,
      arbeidsland,
      avsluttSakSomBortfalt,
      endreLovvalgsperiodeRedigerbart,
    } = this.props;

    const arbeidslandSetning = Utils.streng.arrayTilKonjunksjon(arbeidsland.map(land => land.term));
    let endreBehandlingsStatusValg = [];
    if (oppsummering.behandlingsstatus) endreBehandlingsStatusValg = this.hentBehandlingsStatusValg(oppsummering.behandlingsstatus.kode);

    return (
      <section aria-label="oppsummeringer" className="sideOppsummering panelSeksjon">
        <Nav.Panel className="saksbehandling__soknadSammendrag">
          <Nav.Row>
            <Nav.Column xs="12" md="12">
              <div className="oppsummering__menylinje">
                <Behandlingsmeny
                  lagreOgLukkHandle={lagreOgLukkHandle}
                  tilbakeleggeHandle={tilbakeleggeHandle}
                  oppfriskSaksopplysningerHandle={oppfriskSaksopplysningerHandle}
                  visHenleggDialogHandle={visHenleggDialogHandle}
                  avsluttSakSomBortfalt={avsluttSakSomBortfalt}
                  apneTidligereBehandlinger={this.apneTidligereBehandlinger}
                  redigerbart={endreLovvalgsperiodeRedigerbart}
                  visHenleggSak={behandlingstype !== MKV.Koder.behandlinger.typer.ENDRET_PERIODE}
                  visAvslaSoknadDialogHandle={visAvslaSoknadDialogHandle}
                />
              </div>
            </Nav.Column>
          </Nav.Row>
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
                <dd>{KV.objektTilTerm(sakstype)}</dd>
                <dt>Fullt navn:</dt>
                <dd>{sammensattNavn}</dd>
                <dt>Fnr / dnr:</dt>
                <dd>{fnr}</dd>
                <dt>Saksnummer:</dt>
                <dd>{saksnummer || '-'}</dd>
                <dt>Saksstatus:</dt>
                <dd>{KV.objektTilTerm(saksstatus)}</dd>
                <dt>Behandlingsstatus:</dt>
                <dd>{KV.objektTilTerm(behandlingsstatus)}</dd>
                <dt>Arbeidsland:</dt>
                <dd>{arbeidslandSetning}</dd>
                <dt>Søknadsperiode:</dt>
                <dd>{soknadsperiodeFom} - {soknadsperiodeTom}</dd>
                <dt>Behandling sist oppdatert:</dt>
                <dd><EnkeltDato dato={sisteOpplysningerHentetDato} visTidspunkt /></dd>
                <dt>Behandling registrert dato:</dt>
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
  behandlingID: PT.number.isRequired,
  behandlingstype: PT.string.isRequired,
  redigerbart: PT.bool,
  endreLovvalgsperiodeRedigerbart: PT.bool.isRequired,
  fagsak: MPT.Fagsak,
  oppsummering: MPT.Behandlinger.Oppsummering,
  avsluttSakSomBortfalt: PT.func.isRequired,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  soknadsperiodeFom: PT.string.isRequired,
  soknadsperiodeTom: PT.string.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  oppfriskSaksopplysningerHandle: PT.func.isRequired,
  lagreOgLukkHandle: PT.func.isRequired,
  tilbakeleggeHandle: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visAvslaSoknadDialogHandle: PT.func.isRequired,
  tilForsidenHandle: PT.func.isRequired,
  oppdaterBehandlingsStatus: PT.func.isRequired,
};
SideOppsummering.defaultProps = {
  redigerbart: false,
  fagsak: undefined,
  oppsummering: undefined,
};

const mapStateToProps = state => ({
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  endreLovvalgsperiodeRedigerbart: behandlingerSelectors.EndreLovvalgsPeriodeRedigerbartSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  soknadsperiodeFom: formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeSelector(state).fom),
  soknadsperiodeTom: formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeSelector(state).tom),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterBehandlingsStatus: behandlingsstatus => dispatch(behandlingerOperations.oppdaterBehandlingsStatus(behandlingsstatus)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SideOppsummering);
