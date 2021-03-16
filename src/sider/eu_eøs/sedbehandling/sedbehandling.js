import React, { useEffect } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import MKV from "../../../melosyskodeverk";

import * as Nav from "../../../utils/navFrontend";
import * as Utils from "../../../utils";
import * as MPT from "../../../proptypes";

import SideDialog from "../../../felleskomponenter/sideDialog/sideDialog";
import SideOppsummering from "../../../felleskomponenter/sideOppsummering";
import Behandlingsmeny from "./komponenter/behandlingsmeny";

import { fagsakSelectors } from "../../../ducks/fagsaker";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { datalastingOperations } from "../../../ducks/datalasting";
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../../ducks/behandlingsgrunnlag";
import { dokumenterSelectors } from "../../../ducks/dokumenter";

import "./sedbehandling.css";

const SedBehandling = ({
  brevBestillingRedigerbart,
  brevBestillingRedigerbartIArtikkel13,
  match,
  behandlingstema,
  redigerbart,
  fagsak,
  oppsummering,
  person,
  oppholdsland,
  behandlingsgrunnlagPeriodeFom,
  behandlingsgrunnlagPeriodeTom,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  location,
  lastInnSaksopplysninger,
  resetSaksopplysninger,
  hentBehandlingsgrunnlag,
  lagreOgLukk,
  tilbakeleggOppgave,
  visHenleggDialogHandle,
  visAvsluttSakSomBortfaltDialogHandle,
  visAvslagSoknadDialogHandle,
  visOppfriskModal,
  behandlingOppfriskes,
  apneTidligereBehandlinger,
  dokumentOversikt,
  dokumenter,
}) => {
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));
  const {
    params: { snr: saksnummer },
  } = match;

  useEffect(() => {
    lastInnSaksopplysninger(saksnummer, behandlingID);

    if (behandlingOppfriskes) {
      visOppfriskModal();
    }

    return () => {
      resetSaksopplysninger();
    };
  }, []);

  const ikkeYrkesaktiv = behandlingstema === MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV;
  useEffect(() => {
    if (ikkeYrkesaktiv) {
      hentBehandlingsgrunnlag(behandlingID);
    }
  }, [behandlingstema]);

  return (
    <div className="sedbehandling">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7" />
          <Nav.Column xs="5">
            <SideOppsummering
              behandlingstema={behandlingstema}
              redigerbart={redigerbart}
              fagsak={fagsak}
              oppsummering={oppsummering}
              person={person}
              oppholdsland={ikkeYrkesaktiv ? oppholdsland : []}
              behandlingsgrunnlagPeriodeFom={ikkeYrkesaktiv ? behandlingsgrunnlagPeriodeFom : undefined}
              behandlingsgrunnlagPeriodeTom={ikkeYrkesaktiv ? behandlingsgrunnlagPeriodeTom : undefined}
              lovvalgsperiodeFom={lovvalgsperiodeFom}
              lovvalgsperiodeTom={lovvalgsperiodeTom}
              renderBehandlingsmeny={() => (
                <Behandlingsmeny
                  redigerbart={redigerbart}
                  lagreOgLukkHandle={lagreOgLukk}
                  tilbakeleggeHandle={tilbakeleggOppgave}
                  visHenleggDialogHandle={visHenleggDialogHandle}
                  apneTidligereBehandlinger={apneTidligereBehandlinger}
                  visAvsluttSakSomBortfaltDialogHandle={visAvsluttSakSomBortfaltDialogHandle}
                  visHenleggSak
                  visAvslagSoknadDialogHandle={visAvslagSoknadDialogHandle}
                  visOppfriskSaksopplysninger
                  oppfriskSaksopplysningerHandle={visOppfriskModal}
                />
              )}
            />
            <SideDialog
              behandlingID={behandlingID}
              saksnummer={saksnummer}
              brevBestillingRedigerbart={brevBestillingRedigerbart}
              brevBestillingRedigerbartIArtikkel13={brevBestillingRedigerbartIArtikkel13}
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

SedBehandling.propTypes = {
  brevBestillingRedigerbart: PT.bool.isRequired,
  brevBestillingRedigerbartIArtikkel13: PT.bool.isRequired,
  match: PT.object.isRequired,
  behandlingstema: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  fagsak: MPT.Fagsak,
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  oppholdsland: PT.arrayOf(MPT.Kodeverk),
  behandlingsgrunnlagPeriodeFom: PT.string,
  behandlingsgrunnlagPeriodeTom: PT.string,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  location: PT.object.isRequired,
  lastInnSaksopplysninger: PT.func.isRequired,
  resetSaksopplysninger: PT.func.isRequired,
  hentBehandlingsgrunnlag: PT.func.isRequired,
  lagreOgLukk: PT.func.isRequired,
  tilbakeleggOppgave: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  visOppfriskModal: PT.func.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  apneTidligereBehandlinger: PT.func.isRequired,
  dokumentOversikt: PT.array.isRequired,
  dokumenter: PT.array.isRequired,
};

SedBehandling.defaultProps = {
  fagsak: undefined,
  oppsummering: undefined,
  oppholdsland: [],
  behandlingsgrunnlagPeriodeFom: undefined,
  behandlingsgrunnlagPeriodeTom: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
};

const mapStateToProps = (state) => ({
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  oppholdsland: behandlingsgrunnlagSelectors.OppholdsLandKTSelector(state),
  behandlingsgrunnlagPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.PeriodeSelector(state).fom
  ),
  behandlingsgrunnlagPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.PeriodeSelector(state).tom
  ),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeFomSelector(state)),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeTomSelector(state)),
  brevBestillingRedigerbart: redigerbartSelectors.BrevBestillingRedigerbartSelector(state),
  brevBestillingRedigerbartIArtikkel13: redigerbartSelectors.BrevBestillingRedigerbartIArtikkel13Selector(state),
  dokumenter: dokumenterSelectors.AlleFysiskeDokumentSelector(state),
  dokumentOversikt: dokumenterSelectors.DokumentOversiktSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  lastInnSaksopplysninger: (saksnummer, behandlingID) =>
    dispatch(datalastingOperations.lastInnSaksopplysningerSedBehandling(saksnummer, behandlingID)),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
  hentBehandlingsgrunnlag: (behandlingID) => dispatch(behandlingsgrunnlagOperations.hent(behandlingID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SedBehandling);
