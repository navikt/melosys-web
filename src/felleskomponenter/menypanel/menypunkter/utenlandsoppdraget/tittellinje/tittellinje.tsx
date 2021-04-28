import React, { ReactNode } from "react";

import * as Nav from "../../../../../utils/navFrontend";
import * as Etiketter from "../../../etiketter";

import "./tittellinje.css";

interface TittellinjeProps {
  tittel: string;
  behandlingsgrunnlagEtikett: ReactNode;
  visArbeidsforholdRolleEtiketter: boolean;
}

const Tittellinje = ({ tittel, behandlingsgrunnlagEtikett, visArbeidsforholdRolleEtiketter }: TittellinjeProps) => (
  <div className="utenlandsoppdraget-tittellinje">
    <Nav.typo.Innholdstittel className="utenlandsoppdraget-tittellinje__tittel">{tittel}</Nav.typo.Innholdstittel>
    <span>{behandlingsgrunnlagEtikett}</span>
    {visArbeidsforholdRolleEtiketter && (
      <Etiketter.ArbeidsgiversDel className="utenlandsoppdraget-tittellinje__arbeidsgiversdel-etikett" />
    )}
  </div>
);

export default Tittellinje;
