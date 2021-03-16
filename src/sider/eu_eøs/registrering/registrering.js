/* eslint no-alert:off, consistent-return:off */
import React from "react";
import PT from "prop-types";
import { connect } from "react-redux";

import * as Utils from "../../../utils";
import * as Routing from "../../../routing";
import * as Nav from "../../../utils/navFrontend";
import * as MPT from "../../../proptypes";

import SideDialog from "../../../felleskomponenter/sideDialog/sideDialog";
import SideOppsummering from "../../../felleskomponenter/sideOppsummering";
import Behandlingsmeny from "./komponenter/behandlingsmeny";
import { fagsakOperations, fagsakSelectors } from "../../../ducks/fagsaker";
import { behandlingerOperations, behandlingerSelectors } from "../../../ducks/behandlinger";
import { avklartefaktaOperations, avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { oppgaverOperations } from "../../../ducks/oppgaver";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { dokumenterSelectors } from "../../../ducks/dokumenter";

import "./registrering.css";


const Registrering = (props) => {
  const {
    match: {
      params: { snr },
    },
    tilForsiden,
    tilbakeleggOppgave,
    location,
    hentAvklartefakta,
    hentBehandling,
    hentFagsaker,
    hentLovvalgsperioder,
    vurderingBegrunnelser,
    sed,
    redigerbart,
    Saksopplysninger,
    behandlingstema,
    fagsak,
    oppsummering,
    person,
    lovvalgsperiodeFom,
    lovvalgsperiodeTom,
    lovvalgsland,
    visOppfriskModal,
    behandlingOppfriskes,
    dokumentOversikt,
    dokumenter,
    startOgVisOppfriskModal,
  } = props;

  const saksnummer = snr;
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));

  const lastInnSaksopplysninger = async () => {
    try {
      await Promise.all([
        hentBehandling(behandlingID),
        hentFagsaker(saksnummer),
        hentAvklartefakta(behandlingID),
        hentLovvalgsperioder(behandlingID),
      ]);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  React.useEffect(() => {
    lastInnSaksopplysninger();

    if (behandlingOppfriskes) {
      visOppfriskModal();
    }

    return () => props.resetFagsakState();
  }, []);

  const lagreOgLukk = () => {
    tilForsiden();
  };

  const tilbakeleggHandle = async () => {
    const venterPaaDokumentasjon = true;
    await tilbakeleggOppgave(behandlingID, venterPaaDokumentasjon);
    lagreOgLukk();
  };

  const apneTidligereBehandlinger = () => {
    sessionStorage.setItem("sokefrase", person.fnr);
    Routing.nyFane("sok");
  };

  if (Utils._isNil(redigerbart)) return null;

  return (
    <div className="registrering">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7">
            <Saksopplysninger
              redigerbart={redigerbart}
              behandlingID={behandlingID}
              sed={sed}
              vurderingBegrunnelser={vurderingBegrunnelser}
              tilForsiden={tilForsiden}
              startOgVisOppfriskModal={startOgVisOppfriskModal}
            />
          </Nav.Column>
          <Nav.Column xs="5">
            <SideOppsummering
              behandlingstema={behandlingstema}
              redigerbart={redigerbart}
              fagsak={fagsak}
              oppsummering={oppsummering}
              person={person}
              lovvalgsperiodeFom={lovvalgsperiodeFom}
              lovvalgsperiodeTom={lovvalgsperiodeTom}
              lovvalgsland={lovvalgsland}
              renderBehandlingsmeny={() => (
                <Behandlingsmeny
                  redigerbart={redigerbart}
                  lagreOgLukkHandle={lagreOgLukk}
                  tilbakeleggeHandle={tilbakeleggHandle}
                  apneTidligereBehandlinger={apneTidligereBehandlinger}
                  oppfriskSaksopplysningerHandle={visOppfriskModal}
                />
              )}
            />
            <SideDialog
              saksnummer={saksnummer}
              behandlingID={behandlingID}
              brevBestillingRedigerbart={redigerbart}
              brevBestillingRedigerbartIArtikkel13={redigerbart}
              redigerbart={redigerbart}
              dokumentOversikt={dokumentOversikt}
              dokumenter={dokumenter}
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};
Registrering.propTypes = {
  Saksopplysninger: PT.oneOfType([PT.object, PT.func]).isRequired,
  hentAvklartefakta: PT.func.isRequired,
  hentBehandling: PT.func.isRequired,
  hentFagsaker: PT.func.isRequired,
  hentLovvalgsperioder: PT.func.isRequired,
  resetFagsakState: PT.func.isRequired,
  tilbakeleggOppgave: PT.func.isRequired,
  redigerbart: PT.bool,
  avklartefakta: MPT.AvklartefaktaListe,
  vurderingBegrunnelser: PT.arrayOf(PT.string),
  fagsak: MPT.Fagsak,
  lovvalgsperioder: PT.array.isRequired, // TODO lag proptype
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  sed: MPT.Behandlinger.Saksopplysninger.SED,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  behandlingstema: PT.string.isRequired,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  tilForsiden: PT.func.isRequired,
  lovvalgsland: MPT.Kodeverk.isRequired,
  visOppfriskModal: PT.func.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  dokumentOversikt: PT.array.isRequired,
  dokumenter: PT.array.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
};
Registrering.defaultProps = {
  redigerbart: null,
  avklartefakta: [],
  fagsak: {},
  oppsummering: {},
  sed: {},
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
  vurderingBegrunnelser: [],
};
const mapStateToProps = (state) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  vurderingBegrunnelser: behandlingsresultatSelectors.KontrollresultatBegrunnelseKoderSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  sed: behandlingerSelectors.SEDSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeFomSelector(state)),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeTomSelector(state)),
  lovvalgsland: behandlingerSelectors.LovvalgslandSelector(state),
  dokumenter: dokumenterSelectors.AlleFysiskeDokumentSelector(state),
  dokumentOversikt: dokumenterSelectors.DokumentOversiktSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  hentAvklartefakta: (behandlingID) => dispatch(avklartefaktaOperations.hent(behandlingID)),
  hentBehandling: (behandlingID) => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentFagsaker: (saksnummer) => dispatch(fagsakOperations.hent(saksnummer)),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  hentLovvalgsperioder: (behandlingID) => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
  tilbakeleggOppgave: (oppgaveID, venterPaaDokumentasjon) =>
    oppgaverOperations.tilbakelegg(oppgaveID, venterPaaDokumentasjon),
});

export default connect(mapStateToProps, mapDispatchToProps)(Registrering);
