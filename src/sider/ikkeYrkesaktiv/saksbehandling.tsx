import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";

import * as Utils from "../../utils";
import Informasjonlinje from "../../felleskomponenter/informasjonlinje";
import { AvslaattPgaManglendeOpplysninger, HenlagtSak } from "../eu_eøs/saksbehandling/komponenter/stegErstatter";
import { SoknadMenypanelForm } from "../../felleskomponenter/menypanelForm";
import Oppsummering from "../../felleskomponenter/oppsummering";
import SideDialog, { defaultFaner } from "../../felleskomponenter/sideDialog";
import SaksoversiktLenke from "../../felleskomponenter/saksoversiktLenke";

import { EnkelStegvelger } from "../../felleskomponenter/enkelStegvelger";
import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { behandlingsresultatOperations, behandlingsresultatSelectors } from "../../ducks/behandlingsresultat";
import { behandlingerOperations } from "../../ducks/behandlinger";
import { fagsakOperations, fagsakSelectors } from "../../ducks/fagsaker";
import { feiletResponsOperations } from "../../ducks/feiletRespons";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { dokumenterOperations } from "../../ducks/dokumenter";
import { menypanelOperations } from "../../ducks/menypanel";

import { vilkarOperations } from "../../ducks/vilkar";
import { formSelectors } from "../../ducks/form";

import { MatchParams } from "../../@types";
import { alleSteg } from "./initialStegArray";
import "./saksbehandling.css";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../ducks/lovvalgsperioder";
import { kontrollOperations } from "../../ducks/kontroll";

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

  const dispatch = useDispatch();

  const land = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
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
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const soknadForm = useSelector(formSelectors.SoknadenFormSelector);

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
      await dispatch(fagsakOperations.hent(saksnr));
      const response = await dispatch(behandlingerOperations.hentBehandling(behandlingId));
      // @ts-ignore
      const behandling = response.data;
      if (!behandling) return false;

      await dispatch(behandlingsresultatOperations.hent(behandlingId));

      if (behandlingOppfriskes) {
        visOppfriskModal();
        return false;
      }

      await dispatch(mottatteOpplysningerOperations.hent(behandlingId));
      await dispatch(dokumenterOperations.hentDokumentOversikt(saksnr));
      await dispatch(lovvalgsperioderOperations.hent(behandlingId));
      setSaksopplysningerLastet(true);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    lastInnSaksopplysninger();

    return () => {
      dispatch(fagsakOperations.resetFagsakState());
      dispatch(vilkarOperations.resetState());
      dispatch(behandlingerOperations.resetBehandlingerState());
      dispatch(behandlingsresultatOperations.resetBehandlingsresultatState());
      dispatch(mottatteOpplysningerOperations.resetState());
      dispatch(feiletResponsOperations.resetFeiletRespons());
      dispatch(menypanelOperations.skjulMenypanel());
      dispatch(kontrollOperations.resetKontrollFeil());
    };
  }, []);

  useEffect(() => {
    oppdaterBehandlingIDState();
  });

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID || behandlingID < 0) return null;
  if (!saksopplysningerLastet) return null;

  const erHenlagtSak = fagsakStatusKode === MKV.Koder.saksstatuser.HENLAGT;
  const erAvslåttPgaManglendeOpplysninger =
    behandlingsresultat.behandlingsresultatTypeKode ===
    MKV.Koder.behandlinger.behandlingsresultattyper.AVSLAG_MANGLENDE_OPPL;
  const visAvslåttPgaManglendeOpplysninger = erAvslåttPgaManglendeOpplysninger && !erHenlagtSak;
  const mottatteOpplysningerErKlart = !(
    Object.keys(soknadForm).length === 0 || Object.keys(mottatteOpplysninger).length === 0
  );
  const visStegVelger = !erHenlagtSak && !erAvslåttPgaManglendeOpplysninger && mottatteOpplysningerErKlart;

  return (
    <>
      <Informasjonlinje />
      <div id="main-container" className="main-container">
        <div className="saksbehandling">
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
                  arbeidsland={MKV.KTObjects.land_iso2.filter((landkodeObjekt: KTObject) =>
                    land.includes(landkodeObjekt.kode)
                  )}
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
