import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import Informasjonlinje from "../../../felleskomponenter/informasjonlinje";
import { VirksomhetMelding } from "../../../felleskomponenter/alertmeldinger";
import { SoknadMenypanelForm } from "../../../felleskomponenter/menypanelForm";
import Oppsummering from "../../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../../felleskomponenter/saksoversiktLenke";
import SideDialog, { defaultTabs, tabsUtenBucOgSed } from "../../../felleskomponenter/sideDialog";
import { EnkelStegvelger } from "../../../felleskomponenter/enkelStegvelger";
import { AvslaattPgaManglendeOpplysninger, HenlagtSak } from "../../eu_eøs/saksbehandling/komponenter/stegErstatter";
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
import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from "../../../ducks/medlemskapsperioder";
import { oppsummertfaktaOperations } from "../../../ducks/oppsummertfakta";
import { vilkarOperations } from "../../../ducks/vilkar";
import { menypanelOperations, menypanelSelectors } from "../../../ducks/menypanel";
import { feiletResponsOperations } from "../../../ducks/feiletRespons";
import { alleStegYrkesaktivFlyt } from "./stegLister/stegListeYrkesaktivFlyt";
import "./saksbehandling.css";
import { kontrollOperations } from "../../../ducks/kontroll";
import { resetInkluderSiste5Aar } from "../../../ducks/modaler/operations";
import { setErFullmektigEndret } from "../../../ducks/menypanel/operations";
import { alleStegManglendeInnbetalingFlyt } from "./stegLister/stegListeManglendeInnbetalingFlyt";
import { fakturaserierOperations } from "../../../ducks/fakturaserier";
import { alleStegIkkeYrkesaktivFlyt } from "./stegLister/stegListeIkkeYrkesaktivFlyt";

const mapStateToProps = (state: RootState) => ({
  arbeidsland: mottatteOpplysningerSelectors.SoknadslandkoderSelector(state),
  hovedpartRolle: fagsakSelectors.HovedpartRolleSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  mottatteOpplysninger: mottatteOpplysningerSelectors.MottatteOpplysningerDataSelector(state),
  mottatteOpplysningerPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeSelector(state).fom
  ),
  mottatteOpplysningerPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeSelector(state).tom
  ),
  behandlingsresultatType: behandlingsresultatSelectors.BehandlingsresultatTypeSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  fagsakStatusKode: fagsakSelectors.FagsakStatusSelector(state),
  landkoder: landkoderSelectors.LandkoderFraSakstypeSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  soknadForm: formSelectors.SoknadFormSelector(state),
  registeropplysningerHentet: behandlingerSelectors.RegisteropplysningerHentetSelector(state),
  menypanelSynlig: menypanelSelectors.MenypanelSynligSelector(state),
  samletMedlemskapsperiodeSelector: medlemskapsperioderSelectors.SamletInnvilgetMedlemskapsperiodeSelector(state),
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
  hentVilkår: (behandlingId: number) => dispatch(vilkarOperations.hent(behandlingId)),
  resetVilkarState: () => dispatch(vilkarOperations.resetState()),
  resetOppsummertFaktaState: () => dispatch(oppsummertfaktaOperations.resetOppsummertFakta()),
  resetMedlemskapsperiodeState: () => dispatch(medlemskapsperioderOperations.resetMedlemskapsperioder()),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  resetBehandlingerState: () => dispatch(behandlingerOperations.resetBehandlingerState()),
  resetMottatteOpplysningerState: () => dispatch(mottatteOpplysningerOperations.resetState()),
  visMenypanel: () => dispatch(menypanelOperations.visMenypanel()),
  skjulMenypanel: () => dispatch(menypanelOperations.skjulMenypanel()),
  resetFeiletrespons: () => dispatch(feiletResponsOperations.resetFeiletRespons()),
  resetKontrollFeil: () => dispatch(kontrollOperations.resetKontrollFeil()),
  resetFakturaInformasjon: () => dispatch(fakturaserierOperations.resetFakturaserier()),
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
  hovedpartRolle,
  behandlingOppfriskes,
  mottatteOpplysninger,
  mottatteOpplysningerPeriodeFom,
  mottatteOpplysningerPeriodeTom,
  behandlingsresultatType,
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
  hentVilkår,
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
  visMenypanel,
  skjulMenypanel,
  soknadForm,
  startOgVisOppfriskModal,
  visOppfriskModal,
  resetFeiletrespons,
  resetKontrollFeil,
  registeropplysningerHentet,
  menypanelSynlig,
  samletMedlemskapsperiodeSelector,
  behandlingstype,
  behandlingstema,
  resetFakturaInformasjon,
}: Props & PropsFromRedux) => {
  const [behandlingID, setBehandlingID] = useState(-1);
  const [saksopplysningerLastet, setSaksopplysningerLastet] = useState(false);

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
      await hentVilkår(behandlingId);
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
      resetKontrollFeil();
      resetInkluderSiste5Aar();
      resetFakturaInformasjon();
      skjulMenypanel();
      setErFullmektigEndret(false);
    };
  }, []);

  useEffect(() => {
    oppdaterBehandlingIDState();
  });

  useEffect(() => {
    if (registeropplysningerHentet && !menypanelSynlig) {
      visMenypanel();
    }
  }, [registeropplysningerHentet]);

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID || behandlingID < 0) return null;
  if (!saksopplysningerLastet) return null;

  const hentStegArray = () => {
    if (behandlingstema === MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV) {
      return alleStegIkkeYrkesaktivFlyt;
    }
    if (behandlingstype === MKV.Koder.behandlinger.behandlingstyper.MANGLENDE_INNBETALING_TRYGDEAVGIFT) {
      return alleStegManglendeInnbetalingFlyt;
    }
    return alleStegYrkesaktivFlyt;
  };

  const erHenlagtSak = fagsakStatusKode === MKV.Koder.saksstatuser.HENLAGT;
  const erAvslåttPgaManglendeOpplysninger =
    behandlingsresultatType === MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL;
  const visAvslåttPgaManglendeOpplysninger = erAvslåttPgaManglendeOpplysninger && !erHenlagtSak;
  const mottatteOpplysningerErKlart = !(
    Object.keys(soknadForm).length === 0 || Object.keys(mottatteOpplysninger).length === 0
  );
  const visStegVelger = !erHenlagtSak && !erAvslåttPgaManglendeOpplysninger && mottatteOpplysningerErKlart;

  const hovedpartErVirksomhet = hovedpartRolle === MKV.Koder.aktoersroller.VIRKSOMHET;

  return (
    <>
      <Informasjonlinje />
      <div className="main-container">
        <div className="ftrl_saksbehandling">
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="7">
                <main id="main-container">
                  {!hovedpartErVirksomhet ? (
                    <>
                      {erHenlagtSak && <HenlagtSak />}
                      {visAvslåttPgaManglendeOpplysninger && <AvslaattPgaManglendeOpplysninger />}
                      {visStegVelger && <EnkelStegvelger alleSteg={hentStegArray()} />}
                    </>
                  ) : (
                    <VirksomhetMelding />
                  )}
                </main>
                <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
              </Nav.Column>
              <Nav.Column xs="5">
                <Oppsummering
                  arbeidsland={landkoder?.filter((landkodeObjekt) => arbeidsland.includes(landkodeObjekt.kode))}
                  mottatteOpplysningerPeriodeFom={mottatteOpplysningerPeriodeFom}
                  mottatteOpplysningerPeriodeTom={mottatteOpplysningerPeriodeTom}
                  medlemskapsperiodeFom={Utils.dato.formatterDatoTilNorsk(samletMedlemskapsperiodeSelector?.fom)}
                  medlemskapsperiodeTom={Utils.dato.formatterDatoTilNorsk(samletMedlemskapsperiodeSelector?.tom)}
                />
                <SaksoversiktLenke />
                <SideDialog tabs={hovedpartErVirksomhet ? tabsUtenBucOgSed : defaultTabs} />
              </Nav.Column>
            </Nav.Row>
          </Nav.Container>
        </div>
      </div>
    </>
  );
};

export default connector(Saksbehandling);
