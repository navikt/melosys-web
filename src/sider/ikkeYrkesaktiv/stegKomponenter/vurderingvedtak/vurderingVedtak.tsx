import React from "react";
import { useSelector } from "react-redux";
import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import bem from "../../../../bemUtils";
import { Lovvalgsperiode } from "./lovvalgsperiode";

export const VurderingVedtak = () => {
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const vurderingVedtakCls = bem("vurderingVedtakIkkeYrkesaktiv");

  return (
    <div className={vurderingVedtakCls.block}>
      {sakstype === MKV.Koder.sakstyper.EU_EOS && (
        <Nav.Typo.Innholdstittel className="stegvelgertittel">
          Omfattet av norsk trygdelovgivning - trygdeforordning 883/2004
        </Nav.Typo.Innholdstittel>
      )}
      {sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE && (
        <Nav.Typo.Innholdstittel className="stegvelgertittel">
          Omfattet av norsk trygdelovgivning - trygdeavtale
        </Nav.Typo.Innholdstittel>
      )}

      <Lovvalgsperiode />
    </div>
  );
};
