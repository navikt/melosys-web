import { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HGrid } from "@navikt/ds-react";

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
import { medlemskapsperioderSelectors } from "../../../ducks/medlemskapsperioder";
import "./saksbehandling.css";
import { FellesHandlersContext } from "../../../contexts";
import { SoknadMenypanelForm } from "../../../felleskomponenter/menypanelForm";
import { CollapsiblePanel } from "../../../felleskomponenter/collapsiblePanel";
import Oppsummering from "../../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../../felleskomponenter/saksoversiktLenke";
import SideDialog, { defaultTabs } from "../../../felleskomponenter/sideDialog";

interface Props extends RouteComponentProps<MatchParams> {
  behandlingOppfriskes: boolean;
  startOgVisOppfriskModal: (inkluderSiste5aar?: boolean | undefined) => void;
  visOppfriskModal: () => void;
}

function Saksbehandling({ match, location }: Props) {
  const dispatch = useDispatch();

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const registeropplysningerHentet = useSelector(behandlingerSelectors.RegisteropplysningerHentetSelector);
  const innvilgetMedlemskapsperiode = useSelector(
    medlemskapsperioderSelectors.SamletInnvilgetMedlemskapsperiodeSelector,
  );

  const { startOgVisOppfriskModal, visOppfriskModal, behandlingOppfriskes } = useContext(FellesHandlersContext) as any;

  const [behandlingID, setBehandlingID] = useState(-1);
  const [saksopplysningerLastet, setSaksopplysningerLastet] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(true);

  const oppdaterBehandlingIDState = () => {
    const behandlingIDFraParam = Utils.queryString.getParam(location, "behandlingID");

    if (Utils._toInteger(behandlingIDFraParam) !== behandlingID) {
      setBehandlingID(Utils._toInteger(behandlingIDFraParam));
    }
  };

  const lastInnSaksopplysninger = async () => {
    const { saksnr } = match.params;

    try {
      dispatch(fagsakOperations.hent(saksnr));

      const response = dispatch(behandlingerOperations.hentBehandling(behandlingID));
      // @ts-expect-error generisk beskrivelse
      const behandling = response.data;

      if (!behandling) return false;

      dispatch(behandlingsresultatOperations.hent(behandlingID));

      if (behandlingOppfriskes) {
        visOppfriskModal();
        return false;
      }

      dispatch(mottatteOpplysningerOperations.hent(behandlingID));
      dispatch(dokumenterOperations.hentDokumentOversikt(saksnr));
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
    if (behandlingID !== -1) {
      lastInnSaksopplysninger();
    }
  }, [behandlingID]);

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
                medlemskapsperiodeFom={Utils.dato.formatterDatoTilNorsk(innvilgetMedlemskapsperiode?.fom)}
                medlemskapsperiodeTom={Utils.dato.formatterDatoTilNorsk(innvilgetMedlemskapsperiode?.tom)}
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
