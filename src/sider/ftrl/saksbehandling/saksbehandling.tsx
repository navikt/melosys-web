import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";

import { useFeatureToggle } from "../../../featuretoggle";
import Informasjonlinje from "../../../felleskomponenter/informasjonlinje";
import { VirksomhetMelding } from "../../../felleskomponenter/alertmeldinger";
import { SoknadMenypanelForm } from "../../../felleskomponenter/menypanelForm";
import Oppsummering from "../../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../../felleskomponenter/saksoversiktLenke";
import SideDialog, { defaultFaner, fanerUtenBucOgSed } from "../../../felleskomponenter/sideDialog";
import { EnkelStegvelger } from "../../../felleskomponenter/enkelStegvelger";
import { AvslaattSoknad, HenlagtSak } from "../../eu_eøs/saksbehandling/komponenter/stegErstatter";
import { MatchParams } from "../../../@types";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { fagsakOperations, fagsakSelectors } from "../../../ducks/fagsaker";
import { behandlingerOperations, behandlingerSelectors } from "../../../ducks/behandlinger";
import { behandlingsresultatOperations, behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { landkoderOperations, landkoderSelectors } from "../../../ducks/landkoder";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { formSelectors } from "../../../ducks/form";
import { dokumenterOperations } from "../../../ducks/dokumenter";
import { folketrygdenkodeverkOperations } from "../../../ducks/folketrygdenkodeverk";
import { medlemskapsperioderOperations } from "../../../ducks/medlemskapsperioder";
import { oppsummertfaktaOperations } from "../../../ducks/oppsummertfakta";
import { avklartefaktaOperations } from "../../../ducks/avklartefakta";
import { vilkarOperations } from "../../../ducks/vilkar";
import { menypanelOperations } from "../../../ducks/menypanel";
import { feiletResponsOperations } from "../../../ducks/feiletRespons";

import { alleSteg, alleStegGammel } from "./initialStegArray";
import "./saksbehandling.css";

const mapStateToProps = (state: RootState) => ({
  arbeidsland: mottatteOpplysningerSelectors.SoknadslandkoderSelector(state),
  hovedpartRolle: fagsakSelectors.HovedpartRolleSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  mottatteOpplysninger: mottatteOpplysningerSelectors.MottatteOpplysningerDataSelector(state),
  mottatteOpplysningerPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeSelector(state).fom
  ),
  mottatteOpplysningerPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeSelector(state).tom
  ),
  behandlingsresultat: behandlingsresultatSelectors.BehandlingsresultatSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  fagsakStatusKode: fagsakSelectors.FagsakStatusSelector(state),
  landkoder: landkoderSelectors.LandkoderFraSakstypeSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  skjema: formSelectors.SoknadenFormSelector(state).values,
  soknadForm: formSelectors.SoknadenFormSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentBehandling: (behandlingId: number) => dispatch(behandlingerOperations.hentBehandling(behandlingId)),
  hentMottatteOpplysninger: (behandlingId: number) => dispatch(mottatteOpplysningerOperations.hent(behandlingId)),
  hentBehandlingsresultat: (behandlingId: number) => dispatch(behandlingsresultatOperations.hent(behandlingId)),
  hentDokumentOversikt: (saksnummer: string) => dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
  hentFagsaker: (saksnummer: string) => dispatch(fagsakOperations.hent(saksnummer)),
  hentFolketrygdenKodeverk: () => dispatch(folketrygdenkodeverkOperations.hentKodeverkForFolketrygden()),
  hentLandkoder: () => dispatch(landkoderOperations.hentLandkoder()),
  hentMedlemskapsperioder: (behandlingId: number) =>
    dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingId)),
  hentOppsummertFakta: (behandlingId: number) => dispatch(oppsummertfaktaOperations.hentOppsummertFakta(behandlingId)),
  lagreAvklartefakta: () => dispatch(avklartefaktaOperations.lagre()),
  lagreVilkar: () => dispatch(vilkarOperations.lagre()),
  resetVilkarState: () => dispatch(vilkarOperations.resetState()),
  resetOppsummertFaktaState: () => dispatch(oppsummertfaktaOperations.resetOppsummertFakta()),
  resetMedlemskapsperiodeState: () => dispatch(medlemskapsperioderOperations.resetMedlemskapsperioder()),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  resetBehandlingerState: () => dispatch(behandlingerOperations.resetBehandlingerState()),
  resetMottatteOpplysningerState: () => dispatch(mottatteOpplysningerOperations.resetState()),
  skjulMenypanel: () => dispatch(menypanelOperations.skjulMenypanel()),
  resetFeiletrespons: () => dispatch(feiletResponsOperations.resetFeiletRespons()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props extends RouteComponentProps<MatchParams> {
  behandlingOppfriskes: boolean;
  startOgVisOppfriskModal: () => void;
  visOppfriskModal: () => void;
}

const Saksbehandling = ({
  arbeidsland,
  behandlingstype,
  hovedpartRolle,
  behandlingOppfriskes,
  mottatteOpplysninger,
  mottatteOpplysningerPeriodeFom,
  mottatteOpplysningerPeriodeTom,
  behandlingsresultat,
  fagsakStatusKode,
  hentBehandling,
  hentMottatteOpplysninger,
  hentBehandlingsresultat,
  hentDokumentOversikt,
  hentFagsaker,
  hentFolketrygdenKodeverk,
  hentLandkoder,
  hentMedlemskapsperioder,
  hentOppsummertFakta,
  landkoder,
  location,
  match,
  redigerbart,
  resetBehandlingerState,
  resetMottatteOpplysningerState,
  resetFagsakState,
  resetVilkarState,
  resetOppsummertFaktaState,
  resetMedlemskapsperiodeState,
  skjulMenypanel,
  soknadForm,
  startOgVisOppfriskModal,
  visOppfriskModal,
  resetFeiletrespons,
}: Props & PropsFromRedux) => {
  const [behandlingID, setBehandlingID] = useState(-1);
  const [saksopplysningerLastet, setSaksopplysningerLastet] = useState(false);
  const folketrygdenToggle = useFeatureToggle("melosys.folketrygden.mvp");
  const trygdeavgiftstegToggle = useFeatureToggle("melosys.ftrl.trygdeavgiftsteget");

  const oppdaterBehandlingIDState = () => {
    const behandlingIDFraParam = Utils.queryString.getParam(location, "behandlingID");

    if (Utils._toInteger(behandlingIDFraParam) !== behandlingID) {
      setBehandlingID(Utils._toInteger(behandlingIDFraParam));
    }
  };

  const lastInnSaksopplysninger = async () => {
    const { saksnr } = match.params;
    const behandlingIDFraParam = Utils.queryString.getParam(location, "behandlingID");

    try {
      const behandlingId = Utils._toInteger(behandlingIDFraParam);
      setBehandlingID(behandlingId);
      await hentFagsaker(saksnr);
      await hentFolketrygdenKodeverk();
      await hentOppsummertFakta(behandlingId);
      const response = await hentBehandling(behandlingId);
      const behandling = response.data;
      if (!behandling) return false;

      await hentBehandlingsresultat(behandlingId);

      if (behandlingOppfriskes) {
        visOppfriskModal();
        return false;
      }
      await hentMedlemskapsperioder(behandlingId);
      await hentMottatteOpplysninger(behandlingId);
      await hentDokumentOversikt(saksnr);
      setSaksopplysningerLastet(true);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    lastInnSaksopplysninger();
    hentLandkoder();

    return () => {
      resetFagsakState();
      resetVilkarState();
      resetOppsummertFaktaState();
      resetMedlemskapsperiodeState();
      resetBehandlingerState();
      resetMottatteOpplysningerState();
      resetFeiletrespons();
      skjulMenypanel();
    };
  }, []);

  useEffect(() => {
    oppdaterBehandlingIDState();
  });

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID || behandlingID < 0) return null;
  if (!saksopplysningerLastet) return null;
  if (folketrygdenToggle === "fetching" || folketrygdenToggle === "disabled") return null;

  const erHenlagtSak = fagsakStatusKode === MKV.Koder.saksstatuser.HENLAGT;
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const erAvslaattSoknad =
    behandlingsresultat.behandlingsresultatTypeKode ===
      MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL && !erNyVurdering;
  const visAvslaattSoknad = erAvslaattSoknad && !erHenlagtSak;
  const mottatteOpplysningerErKlart = !(
    Object.keys(soknadForm).length === 0 || Object.keys(mottatteOpplysninger).length === 0
  );
  const visStegVelger =
    !erHenlagtSak && !erAvslaattSoknad && mottatteOpplysningerErKlart && trygdeavgiftstegToggle !== "fetching";

  const hovedpartErVirksomhet = hovedpartRolle === MKV.Koder.aktoersroller.VIRKSOMHET;

  return (
    <>
      <Informasjonlinje />
      <div id="main-container" className="main-container">
        <div className="ftrl_saksbehandling">
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="7">
                {!hovedpartErVirksomhet ? (
                  <>
                    {erHenlagtSak && <HenlagtSak behandlingsresultat={behandlingsresultat} />}
                    {visAvslaattSoknad && <AvslaattSoknad />}
                    {visStegVelger && (
                      <EnkelStegvelger alleSteg={trygdeavgiftstegToggle === "enabled" ? alleSteg : alleStegGammel} />
                    )}
                  </>
                ) : (
                  <VirksomhetMelding />
                )}
                <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
              </Nav.Column>
              <Nav.Column xs="5">
                <Oppsummering
                  arbeidsland={
                    landkoder && landkoder.filter((landkodeObjekt) => arbeidsland.includes(landkodeObjekt.kode))
                  }
                  lovvalgsperiodeFom={mottatteOpplysningerPeriodeFom}
                  lovvalgsperiodeTom={mottatteOpplysningerPeriodeTom}
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
};

export default connector(Saksbehandling);
