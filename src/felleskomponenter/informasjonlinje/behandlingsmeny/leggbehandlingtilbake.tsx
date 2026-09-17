import { useSelector } from "react-redux";
import { useDispatch } from "../../../hooks";
import * as Api from "../../../services/api";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { navigeringOperations } from "../../../ducks/navigering";
import Handling from "./handling";
import TildelOppgave from "./tildelOppgave";
import { useFeatureToggle } from "../../../featuretoggle";
import { MELOSYS_TILDEL_OPPGAVE } from "../../../featuretoggle/toggleNavn";

function LeggBehandlingTilbake() {
  const dispatch = useDispatch();
  const tildelingAktivert = useFeatureToggle(MELOSYS_TILDEL_OPPGAVE);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const tilForsiden = () => dispatch(navigeringOperations.tilForsiden());

  const tilbakeleggOppgave = async () => {
    const data = {
      behandlingID,
      venterPaaDokumentasjon: true,
    };
    await Api.Oppgaver.tilbakelegg(data).catch((error) => error);
    tilForsiden();
  };

  return (
    <>
      {tildelingAktivert ? (
        <TildelOppgave />
      ) : (
        redigerbart && <Handling tekst="Til min oppgaveliste" onClick={tilForsiden} />
      )}
      <Handling tekst="Til felles oppgaveliste" onClick={tilbakeleggOppgave} disabled={!redigerbart} />
    </>
  );
}

export default LeggBehandlingTilbake;
