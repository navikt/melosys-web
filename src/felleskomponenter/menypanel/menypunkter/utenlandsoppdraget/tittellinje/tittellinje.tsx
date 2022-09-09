import React from "react";

import * as Nav from "../../../../../navFrontend";
import * as Etiketter from "../../../etiketter";

import "./tittellinje.css";

interface TittellinjeProps {
  tittel: string;
  visArbeidsforholdRolleEtiketter: boolean;
}

const Tittellinje = ({ tittel, visArbeidsforholdRolleEtiketter }: TittellinjeProps) => (
  <div className="utenlandsoppdraget-tittellinje">
    <Nav.Typo.Innholdstittel className="utenlandsoppdraget-tittellinje__tittel">{tittel}</Nav.Typo.Innholdstittel>
    {visArbeidsforholdRolleEtiketter && (
      <Etiketter.ArbeidsgiversDel className="utenlandsoppdraget-tittellinje__arbeidsgiversdel-etikett" />
    )}
  </div>
);

export default Tittellinje;
