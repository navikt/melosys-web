import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import PT from "prop-types";

import MKV from "../../melosyskodeverk";
import * as MPT from "../../proptypes";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import Informasjonlinje from "../../felleskomponenter/informasjonlinje";
import SideDialog, { defaultFaner, fanerUtenBucOgSed } from "../../felleskomponenter/sideDialog/sideDialog";
import { AvslaattSoknad, HenlagtSak } from "../eu_eøs/saksbehandling/komponenter/stegErstatter";
import Oppsummering from "../../felleskomponenter/oppsummering/oppsummering";
import SaksoversiktLenke from "../../felleskomponenter/saksoversiktLenke";
import { SoknadMenypanelForm } from "../../felleskomponenter/menypanelForm";

import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../ducks/behandlingsgrunnlag";
import { behandlingsresultatOperations, behandlingsresultatSelectors } from "../../ducks/behandlingsresultat";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { dokumenterOperations, dokumenterSelectors } from "../../ducks/dokumenter";
import { fagsakOperations, fagsakSelectors } from "../../ducks/fagsaker";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../ducks/lovvalgsperioder";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { menypanelOperations } from "../../ducks/menypanel";
import { landkoderOperations } from "../../ducks/landkoder";
import { formSelectors } from "../../ducks/form";

import Stegvelger from "./stegvelger";
import "./saksbehandling.css";

const Saksbehandling = ({
  annenBehandlingOppfriskes,
  arbeidsland,
  behandlingstype,
  behandlingGjelder,
  behandlingOppfriskes,
  behandlingsgrunnlag,
  behandlingsgrunnlagMottaksdato,
  behandlingsgrunnlagPeriodeFom,
  behandlingsgrunnlagPeriodeTom,
  behandlingsresultat,
  dokumenter,
  dokumentOversikt,
  fagsak,
  fagsakStatusKode,
  hentBehandling,
  hentBehandlingsgrunnlag,
  hentBehandlingsresultat,
  hentDokumentOversikt,
  hentLandkoder,
  hentLovvalgsperiode,
  hentFagsaker,
  location,
  match,
  oppfriskOgLastInnSaksopplysninger,
  oppsummering,
  redigerbart,
  resetBehandlingerState,
  resetBehandlingsgrunnlagState,
  resetFagsakState,
  skjulMenypanel,
  startOgVisOppfriskModal,
  soknadForm,
  tilForsiden,
  visOppfriskModal,
  lovvalgsperiodeTom,
}) => {
  const [behandlingID, setBehandlingID] = useState(-1);
  const [behandlingIDHarEndretSeg, setBehandlingIDHarEndretSeg] = useState(false);
  const [saksopplysningerLastet, setSaksopplysningerLastet] = useState(false);
  const saksnummer = match?.params?.snr;

  const handleNyVurdering = (skalHenteBehandling, nyVurderingBehandlingID) => {
    if (skalHenteBehandling) hentBehandling(nyVurderingBehandlingID);
    setBehandlingIDHarEndretSeg(false);
  };
  const debouncedHandleNyVurdering = useCallback(Utils._debounce(handleNyVurdering, 500), []);

  const oppdaterBehandlingIDState = () => {
    const behandlingIDFraParam = Utils.queryString.getParam(location, "behandlingID");

    if (Utils._toInteger(behandlingIDFraParam) !== behandlingID) {
      if (behandlingID !== -1) setBehandlingIDHarEndretSeg(true);
      setBehandlingID(Utils._toInteger(behandlingIDFraParam));
    } else if (behandlingIDHarEndretSeg) {
      debouncedHandleNyVurdering(!redigerbart, behandlingIDFraParam);
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

      if (behandlingOppfriskes) {
        visOppfriskModal();
        return false;
      }

      await hentBehandlingsgrunnlag(behandlingIDFraParam);
      await hentDokumentOversikt(saksnummer);
      await hentLovvalgsperiode(behandlingIDFraParam);
      setSaksopplysningerLastet(true);
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
    hentLandkoder();

    return () => {
      resetFagsakState();
      resetBehandlingerState();
      resetBehandlingsgrunnlagState();
      skjulMenypanel();
    };
  }, []);

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID || behandlingID < 0) return null;
  if (!saksopplysningerLastet) return null;

  const erHenlagtSak = fagsakStatusKode === MKV.Koder.saksstatuser.HENLAGT;
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const erAvslaattSoknad =
    behandlingsresultat.behandlingsresultatTypeKode ===
      MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL && !erNyVurdering;
  const visAvslaattSoknad = erAvslaattSoknad && !erHenlagtSak;
  const behandlingsgrunnlagErKlart = !(
    Object.keys(soknadForm).length === 0 || Object.keys(behandlingsgrunnlag).length === 0
  );
  const behandlingGjelderVirksomhet = behandlingGjelder === MKV.Koder.aktoersroller.VIRKSOMHET;

  const visStegVelger =
    !erHenlagtSak &&
    !erAvslaattSoknad &&
    behandlingsgrunnlagErKlart &&
    !behandlingIDHarEndretSeg &&
    !behandlingGjelderVirksomhet;

  return (
    <>
      <Informasjonlinje />
      <div id="main-container" className="main-container">
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
                    oppfriskOgLastInnSaksopplysninger={oppfriskOgLastInnSaksopplysninger}
                    tilForsiden={tilForsiden}
                  />
                )}
                <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
              </Nav.Column>
              <Nav.Column xs="5">
                <Oppsummering
                  oppsummering={oppsummering}
                  fagsak={fagsak}
                  arbeidsland={arbeidsland}
                  mottattDato={behandlingsgrunnlagMottaksdato}
                  lovvalgsperiodeFom={behandlingsgrunnlagPeriodeFom}
                  lovvalgsperiodeTom={lovvalgsperiodeTom || behandlingsgrunnlagPeriodeTom}
                  behandlingsgrunnlagPeriodeFom={behandlingsgrunnlagPeriodeFom}
                  behandlingsgrunnlagPeriodeTom={behandlingsgrunnlagPeriodeTom}
                />
                <SaksoversiktLenke />
                <SideDialog
                  dokumentOversikt={dokumentOversikt}
                  saksnummer={saksnummer}
                  redigerbart={redigerbart}
                  behandlingID={behandlingID}
                  dokumenter={dokumenter}
                  faner={behandlingGjelderVirksomhet ? fanerUtenBucOgSed : defaultFaner}
                />
              </Nav.Column>
            </Nav.Row>
          </Nav.Container>
        </div>
      </div>
    </>
  );
};

Saksbehandling.propTypes = {
  annenBehandlingOppfriskes: PT.bool.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  behandlingGjelder: PT.string.isRequired,
  behandlingstype: PT.string.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  behandlingsgrunnlag: MPT.Behandlingsgrunnlag,
  behandlingsgrunnlagPeriodeFom: PT.string.isRequired,
  behandlingsgrunnlagPeriodeTom: PT.string.isRequired,
  behandlingsgrunnlagMottaksdato: PT.string.isRequired,
  behandlingsresultat: MPT.Behandlingsresultat.isRequired,
  dokumenter: PT.array.isRequired,
  dokumentOversikt: PT.array.isRequired,
  fagsak: MPT.Fagsak,
  fagsakStatusKode: PT.string.isRequired,
  location: PT.object.isRequired,
  match: PT.object.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering,
  redigerbart: PT.bool,
  soknadForm: PT.object.isRequired,
  // Funcs
  hentBehandling: PT.func.isRequired,
  hentBehandlingsgrunnlag: PT.func.isRequired,
  hentBehandlingsresultat: PT.func.isRequired,
  hentDokumentOversikt: PT.func.isRequired,
  hentLandkoder: PT.func.isRequired,
  hentLovvalgsperiode: PT.func.isRequired,
  hentFagsaker: PT.func.isRequired,
  oppfriskOgLastInnSaksopplysninger: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  resetBehandlingerState: PT.func.isRequired,
  resetBehandlingsgrunnlagState: PT.func.isRequired,
  resetFagsakState: PT.func.isRequired,
  skjulMenypanel: PT.func.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
  visOppfriskModal: PT.func.isRequired,
  lovvalgsperiodeTom: PT.string.isRequired,
};

Saksbehandling.defaultProps = {
  behandlingsgrunnlag: {},
  fagsak: {},
  oppsummering: undefined,
  redigerbart: null,
};

const mapStateToProps = (state) => ({
  arbeidsland: behandlingsgrunnlagSelectors.SoknadslandKTSelector(state),
  behandlingGjelder: behandlingerSelectors.BehandlingGjelderSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
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
  dokumenter: dokumenterSelectors.AlleFysiskeDokumentSelector(state),
  dokumentOversikt: dokumenterSelectors.DokumentOversiktSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  fagsakStatusKode: fagsakSelectors.FagsakStatusSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state)),
});

const mapDispatchToProps = (dispatch) => ({
  hentBehandling: (bid) => dispatch(behandlingerOperations.hentBehandling(bid)),
  hentBehandlingsgrunnlag: (bid) => dispatch(behandlingsgrunnlagOperations.hent(bid)),
  hentBehandlingsresultat: (bid) => dispatch(behandlingsresultatOperations.hent(bid)),
  hentDokumentOversikt: (saksnummer) => dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
  hentLandkoder: () => dispatch(landkoderOperations.hentLandkoder()),
  hentLovvalgsperiode: (bid) => dispatch(lovvalgsperioderOperations.hent(bid)),
  hentFagsaker: (saksnummer) => dispatch(fagsakOperations.hent(saksnummer)),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  resetBehandlingerState: () => dispatch(behandlingerOperations.resetBehandlingerState()),
  resetBehandlingsgrunnlagState: () => dispatch(behandlingsgrunnlagOperations.resetState()),
  skjulMenypanel: () => dispatch(menypanelOperations.skjulMenypanel()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Saksbehandling);
