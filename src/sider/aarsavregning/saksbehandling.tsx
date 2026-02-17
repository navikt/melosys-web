import { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "../../hooks";
import * as Nav from "../../navFrontend";
import { HGrid } from "@navikt/ds-react";

import * as Utils from "../../utils";
import Informasjonlinje from "../../felleskomponenter/informasjonlinje";
import { SoknadMenypanelForm } from "../../felleskomponenter/menypanelForm";
import SideDialog, { defaultTabs } from "../../felleskomponenter/sideDialog";
import SaksoversiktLenke from "../../felleskomponenter/saksoversiktLenke";
import { CollapsiblePanel } from "../../felleskomponenter/collapsiblePanel";

import { EnkelStegvelger } from "../../felleskomponenter/enkelStegvelger";
import { behandlingsresultatOperations } from "../../ducks/behandlingsresultat";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { fagsakOperations } from "../../ducks/fagsaker";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { dokumenterOperations } from "../../ducks/dokumenter";
import { menypanelOperations } from "../../ducks/menypanel";

import { MatchParams } from "../../@types";
import { alleSteg } from "./initialStegArray";
import { FellesHandlersContext } from "../../contexts";
import { mottatteOpplysningerOperations } from "../../ducks/mottatteOpplysninger";
import Oppsummering from "../../felleskomponenter/oppsummering";
import { aarsavregningOperations } from "../../ducks/aarsavregning";
import { medlemskapsperioderSelectors } from "../../ducks/medlemskapsperioder";
import { useFeatureToggle } from "../../featuretoggle";
import { ÅRSAVREGNING, ÅRSAVREGNING_UTEN_FLYT } from "../../featuretoggle/toggleNavn";
import "./saksbehandling.less";
import { fakturaserierOperations } from "../../ducks/fakturaserier";

interface Props extends RouteComponentProps<MatchParams> {
  behandlingOppfriskes: boolean;
  startOgVisOppfriskModal: (inkluderSiste5aar?: boolean | undefined) => void;
  visOppfriskModal: () => void;
}

function Saksbehandling({ match, location }: Props) {
  const [behandlingID, setBehandlingID] = useState(-1);
  const [saksopplysningerLastet, setSaksopplysningerLastet] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(true);

  const dispatch = useDispatch();

  const innvilgetMedlemskapsperiode = useSelector(
    medlemskapsperioderSelectors.SamletInnvilgetMedlemskapsperiodeSelector,
  );
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);

  const registeropplysningerHentet = useSelector(behandlingerSelectors.RegisteropplysningerHentetSelector);

  const { startOgVisOppfriskModal, visOppfriskModal, behandlingOppfriskes } = useContext(FellesHandlersContext) as any;

  const erÅrsavregningToggleEnabled = useFeatureToggle(ÅRSAVREGNING);
  const erÅrsavregningUtenFlytToggleEnabled = useFeatureToggle(ÅRSAVREGNING_UTEN_FLYT);

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
      const behandling = response.data;
      if (!behandling) return false;

      dispatch(behandlingsresultatOperations.hent(behandlingId));

      if (behandlingOppfriskes) {
        visOppfriskModal();
        return false;
      }

      dispatch(mottatteOpplysningerOperations.hent(behandlingId));
      dispatch(dokumenterOperations.hentDokumentOversikt(saksnr));
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
      dispatch(mottatteOpplysningerOperations.resetState());
      dispatch(dokumenterOperations.resetDokument());
      dispatch(aarsavregningOperations.resetAarsavregning());
      dispatch(fakturaserierOperations.resetFakturaserier());
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
        <div className="aarsavregning_saksbehandling">
          <HGrid
            columns={panelExpanded ? "minmax(0, 7fr) minmax(0, 5fr)" : "minmax(0, 1fr) 3rem"}
            gap="4"
            className="hgrid"
          >
            <div>
              <main id="main-container">
                {erÅrsavregningUtenFlytToggleEnabled && (
                  <Nav.Alert variant="warning" className="ingenFlytMelding">
                    <b>Du kan ikke gå videre</b>
                    <p>
                      Du kan ikke årsavregne i Meloys enda, men du kan sende et fritekstbrev for å hente inn
                      inntektsopplysninger.
                    </p>
                  </Nav.Alert>
                )}
                {erÅrsavregningToggleEnabled && <EnkelStegvelger alleSteg={alleSteg} />}
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
