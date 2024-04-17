import { useDispatch, useSelector } from "react-redux";
import * as Api from "../../../services/api";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { navigeringOperations } from "../../../ducks/navigering";
import Handling from "./handling";

const LeggBehandlingTilbake = () => {
  const dispatch = useDispatch();
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
      {redigerbart && <Handling tekst="Til min oppgaveliste" onClick={tilForsiden} />}
      <Handling tekst="Til felles oppgaveliste" onClick={tilbakeleggOppgave} disabled={!redigerbart} />
    </>
  );
};

export default LeggBehandlingTilbake;
