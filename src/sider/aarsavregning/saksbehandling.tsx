import { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as Nav from "../../navFrontend";

import * as Utils from "../../utils";
import Informasjonlinje from "../../felleskomponenter/informasjonlinje";
import { SoknadMenypanelForm } from "../../felleskomponenter/menypanelForm";
import SideDialog, { defaultTabs } from "../../felleskomponenter/sideDialog";
import SaksoversiktLenke from "../../felleskomponenter/saksoversiktLenke";

import { EnkelStegvelger } from "../../felleskomponenter/enkelStegvelger";
// import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { behandlingsresultatOperations } from "../../ducks/behandlingsresultat";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { fagsakOperations } from "../../ducks/fagsaker";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { dokumenterOperations } from "../../ducks/dokumenter";
import { menypanelOperations } from "../../ducks/menypanel";

import { MatchParams } from "../../@types";
import { alleSteg } from "./initialStegArray";
import { FellesHandlersContext } from "../../contexts";

interface Props extends RouteComponentProps<MatchParams> {
  behandlingOppfriskes: boolean;
  startOgVisOppfriskModal: (inkluderSiste5aar?: boolean | undefined) => void;
  visOppfriskModal: () => void;
}

const Saksbehandling = ({ match, location }: Props) => {
  const [behandlingID, setBehandlingID] = useState(-1);
  const [saksopplysningerLastet, setSaksopplysningerLastet] = useState(false);

  const dispatch = useDispatch();

  /* const land = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector); TODO kommentert ut for å brute force oss inn i flyten før opprettelse av behandling er på plass
  const mottatteOpplysningerPeriodeFom = useSelector((state) =>
    Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerSelectors.PeriodeSelector(state).fom)
  );
  const mottatteOpplysningerPeriodeTom = useSelector((state) =>
    Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerSelectors.PeriodeSelector(state).tom)
  );*/
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const registeropplysningerHentet = useSelector(behandlingerSelectors.RegisteropplysningerHentetSelector);

  const { startOgVisOppfriskModal, visOppfriskModal, behandlingOppfriskes } = useContext(FellesHandlersContext) as any;

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

      // await dispatch(mottatteOpplysningerOperations.hent(behandlingId));
      await dispatch(dokumenterOperations.hentDokumentOversikt(saksnr));
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
      dispatch(behandlingerOperations.resetBehandlingerState());
      dispatch(behandlingsresultatOperations.resetBehandlingsresultatState());
      // dispatch(mottatteOpplysningerOperations.resetState());
      dispatch(dokumenterOperations.resetDokument());
    };
  }, []);

  useEffect(() => {
    oppdaterBehandlingIDState();
  });

  useEffect(() => {
    dispatch(menypanelOperations.visMenypanel());
  }, [registeropplysningerHentet]);

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID || behandlingID < 0) return null;
  if (!saksopplysningerLastet) return null;

  return (
    <>
      <Informasjonlinje />
      <div className="main-container">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="7">
              <main id="main-container">
                <EnkelStegvelger alleSteg={alleSteg} />
              </main>
              <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
            </Nav.Column>
            <Nav.Column xs="5">
              <SaksoversiktLenke />
              <SideDialog tabs={defaultTabs} />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    </>
  );
};

export default Saksbehandling;
