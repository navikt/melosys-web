import { useSelector } from "react-redux";

import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";

import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import { htmlTilRenTekst } from "../../../../../felleskomponenter/htmlEditor/htmlTilRenTekst";
import StegerstatterBase from "./stegerstatterBase";

function hentBeskrivelse(begrunnelseKoder?: string[], begrunnelseFritekst?: string) {
  if (begrunnelseFritekst) return htmlTilRenTekst(begrunnelseFritekst);

  if (Utils._isEmpty(begrunnelseKoder)) return "Ukjent grunn";

  return KV.kodeTilTerm(begrunnelseKoder![0], MKV.KTObjects.begrunnelser.henleggelsesgrunner);
}

function HenlagtSak() {
  const { begrunnelseKoder, begrunnelseFritekst } = useSelector(
    behandlingsresultatSelectors.BehandlingsresultatSelector,
  );

  return (
    <StegerstatterBase
      tittel="Saken er henlagt:"
      beskrivelse={hentBeskrivelse(begrunnelseKoder, begrunnelseFritekst)}
    />
  );
}

export default HenlagtSak;
