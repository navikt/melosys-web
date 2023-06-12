import React from "react";
import { useSelector } from "react-redux";
import MKV from "../../../../melosyskodeverk";

import * as Nav from "../../../../navFrontend";
import { Lovvalgsperiode } from "./lovvalgsperiode";

import { fagsakSelectors } from "../../../../ducks/fagsaker";

export const VurderingVedtak = () => {
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);

  return (
    <div className="vurderingVedtakIkkeYrkesaktiv">
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
