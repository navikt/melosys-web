import { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useSelector } from "react-redux";
import { HGrid } from "@navikt/ds-react";
import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";

import * as Utils from "../../../utils";
import Informasjonlinje from "../../../felleskomponenter/informasjonlinje";

import { EnkelStegvelger } from "../../../felleskomponenter/enkelStegvelger";
import { behandlingsresultatOperations } from "../../../ducks/behandlingsresultat";
import { behandlingerOperations, behandlingerSelectors } from "../../../ducks/behandlinger";

import { fagsakOperations } from "../../../ducks/fagsaker";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { dokumenterOperations } from "../../../ducks/dokumenter";
import { menypanelOperations } from "../../../ducks/menypanel";

import { MatchParams } from "../../../@types";
import { alleSteg } from "./initialStegArray";
import { mottatteOpplysningerOperations } from "../../../ducks/mottatteOpplysninger";
import "./saksbehandling.less";
import { FellesHandlersContext } from "../../../contexts";
import { SoknadMenypanelForm } from "../../../felleskomponenter/menypanelForm";
import { CollapsiblePanel } from "../../../felleskomponenter/collapsiblePanel";
import Oppsummering from "../../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../../felleskomponenter/saksoversiktLenke";
import SideDialog, { defaultTabs } from "../../../felleskomponenter/sideDialog";
import { useDispatch } from "../../../hooks/useDispatch";
import {
  helseutgiftDekkesPeriodeOperations,
  helseutgiftDekkesPeriodeSelector,
} from "../../../ducks/helseutgiftdekkesperiode";
import { oppsummertfaktaOperations } from "../../../ducks/oppsummertfakta";
import { fakturaserierOperations } from "../../../ducks/fakturaserier";

interface Props extends RouteComponentProps<MatchParams> {
  behandlingOppfriskes: boolean;
  startOgVisOppfriskModal: (inkluderSiste5aar?: boolean | undefined) => void;
  visOppfriskModal: () => void;
}

function Saksbehandling({ match, location }: Props) {
  const dispatch = useDispatch();

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const registeropplysningerHentet = useSelector(behandlingerSelectors.RegisteropplysningerHentetSelector);
  const helseutgiftDekkesPeriode = useSelector(helseutgiftDekkesPeriodeSelector.HelseutgiftDekkesPeriodeSelector);
  const { startOgVisOppfriskModal, visOppfriskModal, behandlingOppfriskes } = useContext(FellesHandlersContext) as any;

  const [behandlingID, setBehandlingID] = useState(-1);
  const [saksopplysningerLastet, setSaksopplysningerLastet] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(true);
  const saksnummer = match?.params?.saksnr;
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
      await dispatch(fagsakOperations.hent(saksnummer));

      const response = await dispatch(behandlingerOperations.hentBehandling(behandlingIDFraParam));

      const behandling = response.data;

      if (!behandling) return false;

      await dispatch(behandlingsresultatOperations.hent(behandlingIDFraParam));

      if (behandlingOppfriskes) {
        visOppfriskModal();
        return false;
      }

      await dispatch(oppsummertfaktaOperations.hentOppsummertFakta(Utils._toInteger(behandlingIDFraParam)));
      await dispatch(mottatteOpplysningerOperations.hent(behandlingIDFraParam));
      await dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer));
      await dispatch(
        helseutgiftDekkesPeriodeOperations.hentHelseutgiftDekkesPeriode(Utils._toInteger(behandlingIDFraParam)),
      );

      setSaksopplysningerLastet(true);

      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    oppdaterBehandlingIDState();
  });

  useEffect(() => {
    lastInnSaksopplysninger();

    return () => {
      dispatch(fagsakOperations.resetFagsakState());
      dispatch(behandlingerOperations.resetBehandlingerState());
      dispatch(behandlingsresultatOperations.resetBehandlingsresultatState());
      dispatch(mottatteOpplysningerOperations.resetState());
      dispatch(dokumenterOperations.resetDokument());
      dispatch(menypanelOperations.skjulMenypanel());
      dispatch(fakturaserierOperations.resetFakturaserier());
    };
  }, []);
  useEffect(() => {
    if (registeropplysningerHentet) {
      dispatch(menypanelOperations.visMenypanel());
    }
  }, [registeropplysningerHentet]);

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID || behandlingID < 0) return null;
  if (!saksopplysningerLastet) return null;

  return (
    <>
      <Informasjonlinje />
      <div className="main-container">
        <div className="eøs_pensjonist_saksbehandling">
          <HGrid
            columns={panelExpanded ? "minmax(0, 7fr) minmax(0, 5fr)" : "minmax(0, 1fr) 3rem"}
            gap="4"
            className="hgrid"
          >
            <div>
              <main id="main-container">
                <EnkelStegvelger alleSteg={alleSteg} />
              </main>
              <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
            </div>
            <CollapsiblePanel defaultExpanded={panelExpanded} onToggle={setPanelExpanded} direction="RIGHT">
              <Oppsummering
                helseDekkesPeriodeFom={Utils.dato.formatterDatoTilNorsk(helseutgiftDekkesPeriode?.data.fomDato)}
                helseDekkesPeriodeTom={Utils.dato.formatterDatoTilNorsk(helseutgiftDekkesPeriode?.data.tomDato)}
                bostedsland={KV.kodeTilObjekt(helseutgiftDekkesPeriode?.data.bostedLandkode, MKV.KTObjects.landkoder)}
              />
              <SaksoversiktLenke />
              <SideDialog tabs={defaultTabs} />
            </CollapsiblePanel>
          </HGrid>
        </div>
      </div>
    </>
  );
}

export default Saksbehandling;
