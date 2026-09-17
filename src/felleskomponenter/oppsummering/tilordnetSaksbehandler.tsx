import { useSelector } from "react-redux";
import { RootState } from "AppTypes";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { useFeatureToggle } from "../../featuretoggle";
import { MELOSYS_TILDEL_OPPGAVE } from "../../featuretoggle/toggleNavn";
import OppsummeringVerdiPar from "./verdiPar/oppsummeringVerdiPar";
import "./tilordnetSaksbehandler.less";

export default function TilordnetSaksbehandler() {
  const toggleEnabled = useFeatureToggle(MELOSYS_TILDEL_OPPGAVE);
  const navn = useSelector((state: RootState) => behandlingerSelectors.TilordnetNavnSelector(state));
  const tilgjengelig = useSelector((state: RootState) => behandlingerSelectors.TildelingTilgjengeligSelector(state));

  if (!toggleEnabled) return null;

  return (
    <OppsummeringVerdiPar
      className="tilordnet-saksbehandler"
      nokkel="Saksbehandler"
      verdi={tilgjengelig ? (navn ?? "Ikke tildelt") : "Tildeling utilgjengelig"}
    />
  );
}
