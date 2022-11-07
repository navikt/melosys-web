import React, { Component } from "react";
import { connect } from "react-redux";
import PT from "prop-types";
import { withRouter } from "react-router-dom";

import MKV from "../../../melosyskodeverk";
import * as Utils from "../../../utils";
import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";
import * as Api from "../../../services/api";

import Informasjonlinje from "../../../felleskomponenter/informasjonlinje";
import SideDialog, { defaultFaner, fanerUtenBucOgSed } from "../../../felleskomponenter/sideDialog";
import { Saksopplysninger } from "./komponenter/saksopplysninger";
import Oppsummering from "../../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../../felleskomponenter/saksoversiktLenke";
import { VirksomhetMelding } from "../../../felleskomponenter/alertmeldinger";

import { fagsakOperations, fagsakSelectors } from "../../../ducks/fagsaker";
import { behandlingsresultatOperations } from "../../../ducks/behandlingsresultat";
import { behandlingerOperations, behandlingerSelectors } from "../../../ducks/behandlinger";
import { anmodningsperioderOperations, anmodningsperioderSelectors } from "../../../ducks/anmodningsperioder";
import { vilkarOperations, vilkarSelectors } from "../../../ducks/vilkar";
import { avklartefaktaOperations, avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { saksopplysningerSelectors } from "../../../ducks/saksopplysninger";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { behandlingsperioderOperations, behandlingsperioderSelectors } from "../../../ducks/behandlingsperioder";
import { formSelectors } from "../../../ducks/form";
import { datalastingOperations } from "../../../ducks/datalasting";
import { dokumenterOperations } from "../../../ducks/dokumenter";
import { anmodningsperiodesvarOperations } from "../../../ducks/anmodningsperiodesvar";
import { landkoderOperations } from "../../../ducks/landkoder";
import { feiletResponsOperations } from "../../../ducks/feiletRespons";

import "./saksbehandling.css";

class Saksbehandling extends Component {
  state = {
    behandlingID: -1,
    saksopplysningerLastet: false,
  };

  async componentDidMount() {
    await this.lastInnSaksopplysninger();
    this.setSaksopplysningerLastet(true);
  }

  componentDidUpdate() {
    this.oppdaterBehandlingIDState();
  }

  componentWillUnmount() {
    this.props.resetFagsakState();
    this.props.resetBehandlingerState();
    this.props.resetAvklartefaktaState();
    this.props.resetLovvalgsperiode();
    this.props.resetVilkarState();
    this.props.resetMottatteOpplysningerState();
    this.props.resetBehandlingsPerioderState();
    this.props.resetFeiletrespons();
  }

  setSaksopplysningerLastet(lastet) {
    this.setState({ saksopplysningerLastet: lastet });
  }

  oppdaterBehandlingIDState = () => {
    const { location } = this.props;
    const behandlingID = Utils.queryString.getParam(location, "behandlingID");

    if (Utils._toInteger(behandlingID) !== this.state.behandlingID) {
      this.setState({ behandlingID: Utils._toInteger(behandlingID) });
    }
  };

  lastInnSaksopplysninger = async () => {
    const { match, location } = this.props;
    const { saksnr } = match.params;
    const behandlingID = Utils.queryString.getParam(location, "behandlingID");
    this.setState({ behandlingID: Utils._toInteger(behandlingID) });

    const {
      hentFagsaker,
      hentBehandling,
      hentBehandlingsresultat,
      hentMottatteOpplysninger,
      visOppfriskModal,
      behandlingOppfriskes,
      hentDokumentOversikt,
      hentAnmodningsperiodesvar,
      hentLandkoder,
    } = this.props;

    try {
      await hentFagsaker(saksnr);
      const response = await hentBehandling(behandlingID);
      const behandling = response.data;
      if (!behandling) return false;

      await hentBehandlingsresultat(behandlingID);

      // Sjekk om saken er iferd under oppdatering
      if (behandlingOppfriskes) {
        visOppfriskModal();
        return false;
      }

      await hentMottatteOpplysninger(behandlingID);
      await hentDokumentOversikt(saksnr);
      await hentLandkoder();

      const anmodningsperioderRes = await Api.Anmodningsperioder.hent(behandlingID);
      const anmodningsperiodeID = anmodningsperioderRes.anmodningsperioder[0]?.id;
      if (anmodningsperiodeID) await hentAnmodningsperiodesvar(anmodningsperiodeID);

      return true;
    } catch (e) {
      return false;
    }
  };

  lagreAvklartefaktaHandler = async () => {
    const { behandlingID } = this.state;
    const { sendAvklartefakta, avklartefakta } = this.props;

    return sendAvklartefakta(behandlingID, avklartefakta);
  };

  lagreLovvalgsperioderHandler = async () => {
    const { behandlingID } = this.state;
    const { sendLovvalgsperioder, lovvalgsperioder, anmodningsperioderErSendtUtlandet } = this.props;

    if (anmodningsperioderErSendtUtlandet) return;

    sendLovvalgsperioder(behandlingID, lovvalgsperioder);
  };

  lagreAnmodningsperioderHandler = async () => {
    const { behandlingID } = this.state;
    const { sendAnmodningsperioder, anmodningsperioder, anmodningsperioderErSendtUtlandet } = this.props;

    if (anmodningsperioderErSendtUtlandet) return;

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    sendAnmodningsperioder(behandlingID, {
      anmodningsperioder: anmodningsperioder.map(({ sendtUtland, ...beholdProperties }) => beholdProperties),
    });
  };

  oppdaterOgLagreBehandlingerHandler = async () => {
    const { skjema, artikkel16_skjema, oppdaterBehandlingerState, lagrePerioder } = this.props;
    await oppdaterBehandlingerState({ ...skjema, ...artikkel16_skjema });

    lagrePerioder();
  };

  render() {
    const {
      redigerbart,
      fagsak,
      oppsummering,
      lovvalgsperiodeFom,
      lovvalgsperiodeTom,
      visOppfriskModal,
      arbeidsland,
      hovedpartRolle,
      mottatteOpplysningerPeriodeFom,
      mottatteOpplysningerPeriodeTom,
      mottatteOpplysningerMottaksdato,
      tilForsiden,
      startOgVisOppfriskModal,
    } = this.props;
    const { behandlingID, saksopplysningerLastet } = this.state;

    if (Utils._isNil(redigerbart)) return null;
    if (!saksopplysningerLastet) return null;

    const hovedpartErVirksomhet = hovedpartRolle === MKV.Koder.aktoersroller.VIRKSOMHET;

    return (
      <>
        <Informasjonlinje />
        <div id="main-container" className="main-container">
          <div className="eueos_saksbehandling">
            <Nav.Container fluid>
              <Nav.Row>
                <Nav.Column xs="7">
                  {!hovedpartErVirksomhet ? (
                    <Saksopplysninger
                      behandlingID={behandlingID}
                      visOppfriskModal={visOppfriskModal}
                      lagreVilkarHandler={this.props.lagreVilkar}
                      lagreAvklartefaktaHandler={this.lagreAvklartefaktaHandler}
                      lagreLovvalgsperioderHandler={this.lagreLovvalgsperioderHandler}
                      lagreAnmodningsperioderHandler={this.lagreAnmodningsperioderHandler}
                      oppdaterOgLagreBehandlingerHandler={this.oppdaterOgLagreBehandlingerHandler}
                      tilForsiden={tilForsiden}
                      startOgVisOppfriskModal={startOgVisOppfriskModal}
                    />
                  ) : (
                    <VirksomhetMelding />
                  )}
                </Nav.Column>
                <Nav.Column xs="5">
                  <Oppsummering
                    oppsummering={oppsummering}
                    fagsak={fagsak}
                    arbeidsland={arbeidsland}
                    mottattDato={mottatteOpplysningerMottaksdato}
                    lovvalgsperiodeFom={lovvalgsperiodeFom}
                    lovvalgsperiodeTom={lovvalgsperiodeTom}
                    mottatteOpplysningerPeriodeFom={mottatteOpplysningerPeriodeFom}
                    mottatteOpplysningerPeriodeTom={mottatteOpplysningerPeriodeTom}
                  />
                  <SaksoversiktLenke />
                  <SideDialog faner={hovedpartErVirksomhet ? fanerUtenBucOgSed : defaultFaner} />
                </Nav.Column>
              </Nav.Row>
            </Nav.Container>
          </div>
        </div>
      </>
    );
  }
}

Saksbehandling.propTypes = {
  behandlingID: PT.number.isRequired,
  hovedpartRolle: PT.string.isRequired,
  redigerbart: PT.bool,
  avklartefakta: MPT.AvklartefaktaListe,
  fagsak: MPT.Fagsak,
  vilkar: PT.array, // TODO lag proptype
  behandlingsPeriode: PT.object.isRequired, // TODO lag proptype
  lovvalgsperioder: PT.array.isRequired, // TODO lag proptype
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  skjema: PT.object,
  artikkel16_skjema: PT.object,
  // Funcs
  hentFagsaker: PT.func.isRequired,
  hentBehandling: PT.func.isRequired,
  hentBehandlingsresultat: PT.func.isRequired,
  hentMottatteOpplysninger: PT.func.isRequired,
  hentLandkoder: PT.func.isRequired,
  resetFagsakState: PT.func.isRequired,
  resetBehandlingsresultatState: PT.func.isRequired,
  resetVilkarState: PT.func.isRequired,
  resetAvklartefaktaState: PT.func.isRequired,
  resetMottatteOpplysningerState: PT.func.isRequired,
  resetBehandlingerState: PT.func.isRequired,
  resetBehandlingsPerioderState: PT.func.isRequired,
  resetLovvalgsperiode: PT.func.isRequired,
  lagreVilkar: PT.func.isRequired,
  sendAvklartefakta: PT.func.isRequired,
  sendLovvalgsperioder: PT.func.isRequired,
  lagrePerioder: PT.func.isRequired,
  oppdaterVilkarState: PT.func.isRequired,
  oppdaterBehandlingerState: PT.func.isRequired,
  anmodningsperioder: PT.array,
  sendAnmodningsperioder: PT.func.isRequired,
  anmodningsperioderErSendtUtlandet: PT.bool.isRequired,
  resetSaksopplysninger: PT.func.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  mottatteOpplysningerPeriodeFom: PT.string.isRequired,
  mottatteOpplysningerPeriodeTom: PT.string.isRequired,
  mottatteOpplysningerMottaksdato: PT.string.isRequired,
  tilForsiden: PT.func.isRequired,
  visOppfriskModal: PT.func.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
  hentDokumentOversikt: PT.func.isRequired,
  hentAnmodningsperiodesvar: PT.func.isRequired,
  resetFeiletrespons: PT.func.isRequired,
};

Saksbehandling.defaultProps = {
  redigerbart: null,
  avklartefakta: [],
  fagsak: {},
  vilkar: [],
  skjema: {},
  anmodningsperioder: [],
  artikkel16_skjema: {},
  oppsummering: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
};
/** Mapper både fast tekst inn til de forskjellige panelene i tillegg til å
 * mappe verdier fra søknaden (soknad) ut til Redux Form via initialValue.
 * @param state
 */
const mapStateToProps = (state) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeFomSelector(state)),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeTomSelector(state)),
  oppfriskning: saksopplysningerSelectors.SaksopplysningerSelector(state),
  vilkar: vilkarSelectors.VilkarSelector(state),
  skjema: formSelectors.SoknadenFormSelector(state).values,
  artikkel16_skjema: formSelectors.Artikkel16AnmodningFormSelector(state).values,
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  behandlingsPeriode: behandlingsperioderSelectors.behandlingsPerioderSelector(state),
  anmodningsperioder: anmodningsperioderSelectors.AnmodningsperioderSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  hovedpartRolle: fagsakSelectors.HovedpartRolleSelector(state),
  anmodningsperioderErSendtUtlandet: anmodningsperioderSelectors.AnmodningsperioderErSendtUtlandetSelector(state),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  mottatteOpplysningerPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeSelector(state).fom
  ),
  mottatteOpplysningerPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeSelector(state).tom
  ),
  mottatteOpplysningerMottaksdato: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.MottaksdatoSelector(state)
  ),
});

const mapDispatchToProps = (dispatch) => ({
  hentFagsaker: (saksnummer) => dispatch(fagsakOperations.hent(saksnummer)),
  hentBehandling: (behandlingID) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentBehandlingsresultat: (bid) => dispatch(behandlingsresultatOperations.hent(bid)),
  hentMottatteOpplysninger: (bid) => dispatch(mottatteOpplysningerOperations.hent(bid)),
  hentDokumentOversikt: (saksnummer) => dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
  hentLandkoder: () => dispatch(landkoderOperations.hentLandkoder()),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  resetBehandlingsresultatState: () => dispatch(behandlingsresultatOperations.resetBehandlingsresultatState()),
  resetVilkarState: () => dispatch(vilkarOperations.resetState()),
  resetAvklartefaktaState: () => dispatch(avklartefaktaOperations.resetAvklartefaktaState()),
  resetMottatteOpplysningerState: () => dispatch(mottatteOpplysningerOperations.resetState()),
  resetLovvalgsperiode: () => dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState()),
  resetBehandlingerState: () => dispatch(behandlingerOperations.resetBehandlingerState()),
  resetBehandlingsPerioderState: () => dispatch(behandlingsperioderOperations.resetPerioderState()),
  sendAvklartefakta: (behandlingID, body) => dispatch(avklartefaktaOperations.send(behandlingID, body)),
  lagreVilkar: () => dispatch(vilkarOperations.lagre()),
  oppdaterVilkarState: (skjema) => dispatch(vilkarOperations.oppdaterState(skjema)),
  oppdaterBehandlingerState: (skjema) => dispatch(behandlingsperioderOperations.oppdaterPerioderState(skjema)),
  sendLovvalgsperioder: (behandlingID, body) => dispatch(lovvalgsperioderOperations.send(behandlingID, body)),
  lagrePerioder: () => dispatch(behandlingsperioderOperations.lagre()),
  sendAnmodningsperioder: (behandlingID, body) => dispatch(anmodningsperioderOperations.send(behandlingID, body)),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
  hentAnmodningsperiodesvar: (anmodningsperiodeID) =>
    dispatch(anmodningsperiodesvarOperations.hent(anmodningsperiodeID)),
  resetFeiletrespons: () => dispatch(feiletResponsOperations.resetFeiletRespons()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Saksbehandling));
