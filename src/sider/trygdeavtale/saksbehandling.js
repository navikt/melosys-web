import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PT from "prop-types";

import MKV from "../../melosyskodeverk";
import * as MPT from "../../proptypes";
import * as Nav from "../../utils/navFrontend";
import * as Utils from "../../utils";

import SideDialog from "../../felleskomponenter/sideDialog/sideDialog";
import { AvslaattSoknad, HenlagtSak } from "../eu_eøs/saksbehandling/komponenter/stegErstatter";
import SideOppsummering from "../../felleskomponenter/oppsummering/sideOppsummering";
import Behandlingsstatus from "../../felleskomponenter/behandlingsstatus";
import { SoknadMenypanelForm } from "../../felleskomponenter/menypanelForm";
import Behandlingsmeny from "../ftrl/saksbehandling/behandlingsmeny";

import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../ducks/behandlingsgrunnlag";
import { behandlingsresultatOperations, behandlingsresultatSelectors } from "../../ducks/behandlingsresultat";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { dokumenterOperations, dokumenterSelectors } from "../../ducks/dokumenter";
import { fagsakOperations, fagsakSelectors } from "../../ducks/fagsaker";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { menypanelOperations } from "../../ducks/menypanel";
import { formSelectors } from "../../ducks/form";

import Stegvelger from "./stegvelger";
import "./saksbehandling.css";

const behandlingsstatusMap = {
  [MKV.Koder.behandlinger.behandlingsstatus.VURDER_DOKUMENT]: [
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
      term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.SVAR_ANMODNING_MOTTATT]: [
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
      term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL]: [
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
      term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART]: [
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
      term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING]: [],
};

const Saksbehandling = ({
  annenBehandlingOppfriskes,
  apneTidligereBehandlinger,
  arbeidsland,
  behandlingOppfriskes,
  behandlingsgrunnlag,
  behandlingsgrunnlagMottaksdato,
  behandlingsgrunnlagPeriodeFom,
  behandlingsgrunnlagPeriodeTom,
  behandlingsresultat,
  behandlingstema,
  behandlingsstatus,
  dokumenter,
  dokumentOversikt,
  fagsak,
  fagsakStatusKode,
  hentBehandling,
  hentBehandlingsgrunnlag,
  hentBehandlingsresultat,
  hentDokumentOversikt,
  hentFagsaker,
  lagreOgLukk,
  location,
  match,
  oppfriskSaksopplysningerOgLastInnSaksopplysninger,
  oppsummering,
  person,
  redigerbart,
  resetBehandlingerState,
  resetBehandlingsgrunnlagState,
  resetFagsakState,
  skjulMenypanel,
  startOgVisOppfriskModal,
  soknadForm,
  tilForsiden,
  tilbakeleggOppgave,
  visAvslagSoknadDialogHandle,
  visAvsluttSakSomBortfaltDialogHandle,
  visHenleggDialogHandle,
  visOppfriskModal,
  visRevurderFagsakDialogHandle,
}) => {
  const [behandlingID, setBehandlingID] = useState(-1);
  const saksnummer = match?.params?.snr;

  const oppdaterBehandlingIDState = () => {
    const behandlingIDFraParam = Utils.queryString.getParam(location, "behandlingID");

    if (Utils._toInteger(behandlingIDFraParam) !== behandlingID) {
      setBehandlingID(Utils._toInteger(behandlingIDFraParam));
    }
  };

  const lastInnSaksopplysninger = async () => {
    const behandlingIDFraParam = Utils.queryString.getParam(location, "behandlingID");
    setBehandlingID(Utils._toInteger(behandlingIDFraParam));

    try {
      await hentFagsaker(saksnummer);
      const response = await hentBehandling(behandlingIDFraParam);
      const behandling = response.data;
      if (!behandling) return false;

      await hentBehandlingsresultat(behandlingIDFraParam);

      // Sjekk om saken er iferd under oppdatering
      if (behandlingOppfriskes) {
        visOppfriskModal();
        return false;
      }

      await hentBehandlingsgrunnlag(behandlingIDFraParam);
      await hentDokumentOversikt(saksnummer);
      return true;
    } catch (e) {
      Utils.logger.error(e);
    }
    return false;
  };

  useEffect(() => {
    oppdaterBehandlingIDState();
  });

  useEffect(() => {
    lastInnSaksopplysninger();
    return () => {
      resetBehandlingerState();
      resetBehandlingsgrunnlagState();
      resetFagsakState();
      skjulMenypanel();
    };
  }, []);

  if (Utils._isNil(redigerbart)) {
    return null;
  }

  if (!behandlingID || behandlingID < 0) {
    return null;
  }

  const erHenlagtSak = fagsakStatusKode === MKV.Koder.saksstatuser.HENLAGT;
  const erAvslaattSoknad =
    behandlingsresultat.behandlingsresultatTypeKode ===
    MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL;
  const visAvslaattSoknad = erAvslaattSoknad && !erHenlagtSak;
  const behandlingsgrunnlagErKlart = !(
    Object.keys(soknadForm).length === 0 || Object.keys(behandlingsgrunnlag).length === 0
  );
  const visStegVelger = !erHenlagtSak && !erAvslaattSoknad && behandlingsgrunnlagErKlart;

  return (
    <div className="saksbehandling">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7">
            {erHenlagtSak && <HenlagtSak behandlingsresultat={behandlingsresultat} />}
            {visAvslaattSoknad && <AvslaattSoknad behandlingsresultat={behandlingsresultat} />}
            {visStegVelger && (
              <Stegvelger
                redigerbart={redigerbart}
                annenBehandlingOppfriskes={annenBehandlingOppfriskes}
                oppfriskSaksopplysningerOgLastInnSaksopplysninger={oppfriskSaksopplysningerOgLastInnSaksopplysninger}
                tilForsiden={tilForsiden}
              />
            )}
            <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
          </Nav.Column>
          <Nav.Column xs="5">
            <SideOppsummering
              behandlingstema={behandlingstema}
              redigerbart={redigerbart}
              fagsak={fagsak}
              oppsummering={oppsummering}
              person={person}
              arbeidsland={arbeidsland}
              behandlingsgrunnlagPeriodeFom={behandlingsgrunnlagPeriodeFom}
              behandlingsgrunnlagPeriodeTom={behandlingsgrunnlagPeriodeTom}
              behandlingsgrunnlagMottaksdato={behandlingsgrunnlagMottaksdato}
              renderBehandlingsmeny={() => (
                <Behandlingsmeny
                  redigerbart={redigerbart}
                  lagreOgLukkHandle={lagreOgLukk}
                  tilbakeleggeHandle={tilbakeleggOppgave}
                  oppfriskSaksopplysningerHandle={visOppfriskModal}
                  visHenleggDialogHandle={visHenleggDialogHandle}
                  visAvsluttSakSomBortfaltDialogHandle={visAvsluttSakSomBortfaltDialogHandle}
                  visAvslagSoknadDialogHandle={visAvslagSoknadDialogHandle}
                  apneTidligereBehandlinger={apneTidligereBehandlinger}
                  visRevurderFagsakDialogHandle={visRevurderFagsakDialogHandle}
                  behandlingsstatus={behandlingsstatus}
                />
              )}
              renderBehandlingsstatus={() => (
                <Behandlingsstatus
                  behandlingID={behandlingID}
                  redigerbart={redigerbart}
                  oppsummering={oppsummering}
                  behandlingsstatusMap={behandlingsstatusMap}
                />
              )}
            />
            <SideDialog
              dokumentOversikt={dokumentOversikt}
              saksnummer={saksnummer}
              redigerbart={redigerbart}
              behandlingID={behandlingID}
              brevBestillingRedigerbartIArtikkel13
              brevBestillingRedigerbart={redigerbart}
              dokumenter={dokumenter}
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};

Saksbehandling.propTypes = {
  annenBehandlingOppfriskes: PT.bool.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  behandlingsgrunnlag: MPT.Behandlingsgrunnlag,
  behandlingsgrunnlagPeriodeFom: PT.string.isRequired,
  behandlingsgrunnlagPeriodeTom: PT.string.isRequired,
  behandlingsgrunnlagMottaksdato: PT.string.isRequired,
  behandlingsresultat: MPT.Behandlingsresultat.isRequired,
  behandlingstema: PT.string.isRequired,
  behandlingsstatus: PT.string.isRequired,
  dokumenter: PT.array.isRequired,
  dokumentOversikt: PT.array.isRequired,
  fagsak: MPT.Fagsak,
  fagsakStatusKode: PT.string.isRequired,
  location: PT.object.isRequired,
  match: PT.object.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  redigerbart: PT.bool,
  soknadForm: PT.object.isRequired,
  // Funcs
  apneTidligereBehandlinger: PT.func.isRequired,
  hentBehandling: PT.func.isRequired,
  hentBehandlingsgrunnlag: PT.func.isRequired,
  hentBehandlingsresultat: PT.func.isRequired,
  hentDokumentOversikt: PT.func.isRequired,
  hentFagsaker: PT.func.isRequired,
  lagreOgLukk: PT.func.isRequired,
  oppfriskSaksopplysningerOgLastInnSaksopplysninger: PT.func.isRequired,
  tilbakeleggOppgave: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  resetBehandlingerState: PT.func.isRequired,
  resetBehandlingsgrunnlagState: PT.func.isRequired,
  resetFagsakState: PT.func.isRequired,
  skjulMenypanel: PT.func.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
  visAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visOppfriskModal: PT.func.isRequired,
  visRevurderFagsakDialogHandle: PT.func.isRequired,
};

Saksbehandling.defaultProps = {
  behandlingsgrunnlag: {},
  fagsak: {},
  oppsummering: undefined,
  redigerbart: null,
};

const mapStateToProps = (state) => ({
  arbeidsland: behandlingsgrunnlagSelectors.SoknadslandKTSelector(state),
  behandlingsgrunnlag: behandlingsgrunnlagSelectors.BehandlingsgrunnlagDataSelector(state),
  behandlingsgrunnlagPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.PeriodeSelector(state).fom
  ),
  behandlingsgrunnlagPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.PeriodeSelector(state).tom
  ),
  behandlingsgrunnlagMottaksdato: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.MottaksdatoSelector(state)
  ),
  behandlingsresultat: behandlingsresultatSelectors.BehandlingsresultatSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingsstatus: behandlingerSelectors.BehandlingsstatusKodeSelector(state),
  dokumenter: dokumenterSelectors.AlleFysiskeDokumentSelector(state),
  dokumentOversikt: dokumenterSelectors.DokumentOversiktSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  fagsakStatusKode: fagsakSelectors.FagsakStatusSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  hentBehandling: (bid) => dispatch(behandlingerOperations.hentBehandling(bid)),
  hentBehandlingsgrunnlag: (bid) => dispatch(behandlingsgrunnlagOperations.hent(bid)),
  hentBehandlingsresultat: (bid) => dispatch(behandlingsresultatOperations.hent(bid)),
  hentDokumentOversikt: (saksnummer) => dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
  hentFagsaker: (saksnummer) => dispatch(fagsakOperations.hent(saksnummer)),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  resetBehandlingerState: () => dispatch(behandlingerOperations.resetBehandlingerState()),
  resetBehandlingsgrunnlagState: () => dispatch(behandlingsgrunnlagOperations.resetState()),
  skjulMenypanel: () => dispatch(menypanelOperations.skjulMenypanel()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Saksbehandling);
