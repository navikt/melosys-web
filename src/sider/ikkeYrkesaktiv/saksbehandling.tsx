import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import Informasjonlinje from "../../felleskomponenter/informasjonlinje";
import { AvslaattSoknad, HenlagtSak } from "../eu_eøs/saksbehandling/komponenter/stegErstatter";
import { SoknadMenypanelForm } from "../../felleskomponenter/menypanelForm";
import Oppsummering from "../../felleskomponenter/oppsummering";
import SideDialog, { defaultFaner } from "../../felleskomponenter/sideDialog";
import SaksoversiktLenke from "../../felleskomponenter/saksoversiktLenke";
import { EnkelStegvelger } from "../../felleskomponenter/enkelStegvelger";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { behandlingsresultatOperations, behandlingsresultatSelectors } from "../../ducks/behandlingsresultat";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { landkoderOperations, landkoderSelectors } from "../../ducks/landkoder";
import { fagsakOperations, fagsakSelectors } from "../../ducks/fagsaker";
import { folketrygdenkodeverkOperations } from "../../ducks/folketrygdenkodeverk";
import { medlemskapsperioderOperations } from "../../ducks/medlemskapsperioder";
import { oppsummertfaktaOperations } from "../../ducks/oppsummertfakta";
import { feiletResponsOperations } from "../../ducks/feiletRespons";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { dokumenterOperations } from "../../ducks/dokumenter";
import { menypanelOperations } from "../../ducks/menypanel";
import { vilkarOperations } from "../../ducks/vilkar";

import { useFeatureToggle } from "../../featuretoggle";
import { formSelectors } from "../../ducks/form";
import { MatchParams } from "../../@types";

import { alleSteg } from "./initialStegArray";
import "./saksbehandling.css";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../ducks/lovvalgsperioder";
import { MELOSYS_FOLKETRYGDEN_MVP } from "../../featuretoggle/toggleNavn";

interface Props extends RouteComponentProps<MatchParams> {
  behandlingOppfriskes: boolean;
  startOgVisOppfriskModal: () => void;
  visOppfriskModal: () => void;
}

const Saksbehandling = ({
  behandlingOppfriskes,
  startOgVisOppfriskModal,
  visOppfriskModal,
  match,
  location,
}: Props) => {
  const [behandlingID, setBehandlingID] = useState(-1);
  const [saksopplysningerLastet, setSaksopplysningerLastet] = useState(false);
  const folketrygdenToggle = useFeatureToggle(MELOSYS_FOLKETRYGDEN_MVP);

  const dispatch = useDispatch();

  const land = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const mottatteOpplysninger = useSelector(mottatteOpplysningerSelectors.MottatteOpplysningerDataSelector);
  const mottatteOpplysningerPeriodeFom = useSelector((state) =>
    Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerSelectors.PeriodeSelector(state).fom)
  );
  const mottatteOpplysningerPeriodeTom = useSelector((state) =>
    Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerSelectors.PeriodeSelector(state).tom)
  );
  const lovvalgsperiode = useSelector(lovvalgsperioderSelectors.LovvalgsperiodeSelector);
  const behandlingsresultat = useSelector(behandlingsresultatSelectors.BehandlingsresultatSelector);
  const fagsakStatusKode = useSelector(fagsakSelectors.FagsakStatusSelector);
  const landkoder = useSelector(landkoderSelectors.LandkoderFraSakstypeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const soknadForm = useSelector(formSelectors.SoknadenFormSelector);

  const hentBehandling = (behandlingId: number) => dispatch(behandlingerOperations.hentBehandling(behandlingId));
  const hentMottatteOpplysninger = (behandlingId: number) =>
    dispatch(mottatteOpplysningerOperations.hent(behandlingId));
  const hentBehandlingsresultat = (behandlingId: number) => dispatch(behandlingsresultatOperations.hent(behandlingId));
  const hentDokumentOversikt = (saksnummer: string) => dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer));
  const hentFagsaker = (saksnummer: string) => dispatch(fagsakOperations.hent(saksnummer));
  const hentFolketrygdenKodeverk = () => dispatch(folketrygdenkodeverkOperations.hentKodeverkForFolketrygden());
  const hentLandkoder = () => dispatch(landkoderOperations.hentLandkoder());
  const hentOppsummertFakta = (behandlingId: number) =>
    dispatch(oppsummertfaktaOperations.hentOppsummertFakta(behandlingId));
  const resetVilkarState = () => dispatch(vilkarOperations.resetState());
  const resetOppsummertFaktaState = () => dispatch(oppsummertfaktaOperations.resetOppsummertFakta());
  const resetMedlemskapsperiodeState = () => dispatch(medlemskapsperioderOperations.resetMedlemskapsperioder());
  const resetFagsakState = () => dispatch(fagsakOperations.resetFagsakState());
  const resetBehandlingerState = () => dispatch(behandlingerOperations.resetBehandlingerState());
  const resetMottatteOpplysningerState = () => dispatch(mottatteOpplysningerOperations.resetState());
  const skjulMenypanel = () => dispatch(menypanelOperations.skjulMenypanel());
  const resetFeiletrespons = () => dispatch(feiletResponsOperations.resetFeiletRespons());
  const hentLovvalgsperiode = (behandlingId: number) => dispatch(lovvalgsperioderOperations.hent(behandlingId));

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
      // @ts-ignore
      const behandling = response.data;
      if (!behandling) return false;

      await hentBehandlingsresultat(behandlingId);

      if (behandlingOppfriskes) {
        visOppfriskModal();
        return false;
      }

      await hentMottatteOpplysninger(behandlingId);
      await hentDokumentOversikt(saksnr);
      await hentLovvalgsperiode(behandlingId);
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
  if (!folketrygdenToggle) return null;

  const erHenlagtSak = fagsakStatusKode === MKV.Koder.saksstatuser.HENLAGT;
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const erAvslaattSoknad =
    behandlingsresultat.behandlingsresultatTypeKode ===
      MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL && !erNyVurdering;
  const visAvslaattSoknad = erAvslaattSoknad && !erHenlagtSak;
  const mottatteOpplysningerErKlart = !(
    Object.keys(soknadForm).length === 0 || Object.keys(mottatteOpplysninger).length === 0
  );
  const visStegVelger = !erHenlagtSak && !erAvslaattSoknad && mottatteOpplysningerErKlart;

  return (
    <>
      <Informasjonlinje />
      <div id="main-container" className="main-container">
        <div className="saksbehandling">
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="7">
                {erHenlagtSak && <HenlagtSak behandlingsresultat={behandlingsresultat} />}
                {visAvslaattSoknad && <AvslaattSoknad />}
                {visStegVelger && <EnkelStegvelger alleSteg={alleSteg} />}
                <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
              </Nav.Column>
              <Nav.Column xs="5">
                <Oppsummering
                  arbeidsland={landkoder && landkoder.filter((landkodeObjekt) => land.includes(landkodeObjekt.kode))}
                  lovvalgsperiodeFom={Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato, false, "")}
                  lovvalgsperiodeTom={Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato, false, "")}
                  mottatteOpplysningerPeriodeFom={mottatteOpplysningerPeriodeFom}
                  mottatteOpplysningerPeriodeTom={mottatteOpplysningerPeriodeTom}
                />
                <SaksoversiktLenke />
                <SideDialog faner={defaultFaner} />
              </Nav.Column>
            </Nav.Row>
          </Nav.Container>
        </div>
      </div>
    </>
  );
};

export default Saksbehandling;
