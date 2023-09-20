import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps } from "react-router-dom";

import MKV from "../../melosyskodeverk";
import * as KV from "../../kodeverk";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../ducks/lovvalgsperioder";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { behandlingsresultatOperations, behandlingsresultatSelectors } from "../../ducks/behandlingsresultat";
import { feiletResponsOperations } from "../../ducks/feiletRespons";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { dokumenterOperations } from "../../ducks/dokumenter";
import { fagsakOperations, fagsakSelectors } from "../../ducks/fagsaker";

import { SoknadMenypanelForm } from "../../felleskomponenter/menypanelForm";
import SaksoversiktLenke from "../../felleskomponenter/saksoversiktLenke";
import Informasjonlinje from "../../felleskomponenter/informasjonlinje";
import SideDialog, { defaultFaner } from "../../felleskomponenter/sideDialog";
import { EnkelStegvelger } from "../../felleskomponenter/enkelStegvelger";
import Oppsummering from "../../felleskomponenter/oppsummering";

import { MatchParams } from "../../@types";
import { alleSteg } from "./initialStegArray";
import "./saksbehandling.css";
import { kontrollOperations } from "../../ducks/kontroll";
import { AvslaattPgaManglendeOpplysninger, HenlagtSak } from "../eu_eøs/saksbehandling/komponenter/stegErstatter";
import { menypanelOperations, menypanelSelectors } from "../../ducks/menypanel";

interface SaksbehandlingProps extends RouteComponentProps<MatchParams> {
  visOppfriskModal: () => void;
  behandlingOppfriskes: boolean;
  startOgVisOppfriskModal: () => void;
}

const Saksbehandling = ({
  location,
  match,
  visOppfriskModal,
  behandlingOppfriskes,
  startOgVisOppfriskModal,
}: SaksbehandlingProps) => {
  const dispatch = useDispatch();
  const [saksopplysningerLastet, setSaksopplysningerLastet] = useState(false);
  const saksnummer = match?.params?.saksnr;

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const fagstatus = useSelector(fagsakSelectors.FagsakStatusSelector);
  const behandlingsresultattype = useSelector(behandlingsresultatSelectors.BehandlingsresultatTypeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const avsenderland = useSelector(mottatteOpplysningerSelectors.AvsenderlandSelector);
  const lovvalgsland = useSelector(mottatteOpplysningerSelectors.LovvalgslandSelector);
  const registeropplysningerHentet = useSelector(behandlingerSelectors.RegisteropplysningerHentetSelector);
  const menypanelSynlig = useSelector(menypanelSelectors.MenypanelSynligSelector);

  const formatterDato = (dato: string | null) => Utils.dato.formatterDatoTilNorsk(dato, false, undefined);
  const mottatteOpplysningerFom = formatterDato(useSelector(mottatteOpplysningerSelectors.PeriodeFomSelector));
  const mottatteOpplysningerTom = formatterDato(useSelector(mottatteOpplysningerSelectors.PeriodeTomSelector));
  const lovvalgsperiodeFom = formatterDato(useSelector(lovvalgsperioderSelectors.FomDatoSelector));
  const lovvalgsperiodeTom = formatterDato(useSelector(lovvalgsperioderSelectors.TomDatoSelector));

  useEffect(() => {
    lastInnSaksopplysninger();

    return () => {
      dispatch(fagsakOperations.resetFagsakState());
      dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState());
      dispatch(behandlingerOperations.resetBehandlingerState());
      dispatch(mottatteOpplysningerOperations.resetState());
      dispatch(feiletResponsOperations.resetFeiletRespons());
      dispatch(kontrollOperations.resetKontrollFeil());
      dispatch(menypanelOperations.skjulMenypanel());
    };
  }, []);

  useEffect(() => {
    if (registeropplysningerHentet && !menypanelSynlig) {
      dispatch(menypanelOperations.visMenypanel());
    }
  }, [registeropplysningerHentet]);

  const lastInnSaksopplysninger = async () => {
    if (behandlingOppfriskes) {
      visOppfriskModal();
      return;
    }

    try {
      const behandlingIDFraParam = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));
      await dispatch(fagsakOperations.hent(saksnummer));
      await dispatch(behandlingerOperations.hentBehandling(behandlingIDFraParam));
      await dispatch(behandlingsresultatOperations.hent(behandlingIDFraParam));
      await dispatch(mottatteOpplysningerOperations.hent(behandlingIDFraParam));
      await dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer));
      await dispatch(lovvalgsperioderOperations.hent(behandlingIDFraParam));
      setSaksopplysningerLastet(true);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID) return null;
  if (!saksopplysningerLastet) return null;

  const erHenlagtSak = fagstatus === MKV.Koder.saksstatuser.HENLAGT;
  const erAvslåttPgaManglendeOpplysninger =
    behandlingsresultattype === MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL;
  const visAvslåttPgaManglendeOpplysninger = erAvslåttPgaManglendeOpplysninger && !erHenlagtSak;
  const visStegVelger = !erHenlagtSak && !erAvslåttPgaManglendeOpplysninger;

  return (
    <>
      <Informasjonlinje />
      <div id="main-container" className="main-container">
        <div className="unntaksregistrering_saksbehandling">
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="7">
                {erHenlagtSak && <HenlagtSak />}
                {visAvslåttPgaManglendeOpplysninger && <AvslaattPgaManglendeOpplysninger />}
                {visStegVelger && <EnkelStegvelger alleSteg={alleSteg} />}
                <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
              </Nav.Column>
              <Nav.Column xs="5">
                <Oppsummering
                  avsenderland={KV.kodeTilObjekt(avsenderland, MKV.KTObjects.land_iso2)}
                  lovvalgsland={KV.kodeTilObjekt(lovvalgsland, MKV.KTObjects.landkoder)}
                  lovvalgsperiodeFom={lovvalgsperiodeFom || mottatteOpplysningerFom}
                  lovvalgsperiodeTom={lovvalgsperiodeTom || mottatteOpplysningerTom}
                  mottatteOpplysningerPeriodeFom={mottatteOpplysningerFom}
                  mottatteOpplysningerPeriodeTom={mottatteOpplysningerTom}
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
