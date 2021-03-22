import React, { ReactNode } from "react";

import * as Nav from "../../../../utils/navFrontend";
import * as Etiketter from "../../etiketter";
import * as KV from "../../../../kodeverk";

import Soknadsperiode from "./soknadsperiode";
import Soknadslandvelger from "./soknadslandvelger";

import "./utenlandsoppdraget.css";

interface UtenlandsoppdragetProps {
  visArbeidsforholdRolleEtiketter: boolean;
  redigerbart: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
  behandlingsgrunnlagEtikett: ReactNode;
}

const Utenlandsoppdraget = ({
  visArbeidsforholdRolleEtiketter,
  redigerbart,
  lagreSoknadOgOppfriskSaksopplysninger,
  behandlingsgrunnlagEtikett,
}: UtenlandsoppdragetProps) => (
  <div className="utenlandsoppdraget">
    <div style={{ marginBottom: "1em" }}>
      <Nav.typo.Innholdstittel style={{ display: "inline", marginRight: "1em" }}>
        {KV.Menypunkter.Utenlandsoppdraget.tittel}
      </Nav.typo.Innholdstittel>
      <span>{behandlingsgrunnlagEtikett}</span>
      {visArbeidsforholdRolleEtiketter && <Etiketter.ArbeidsgiversDel style={{ marginLeft: "0.3em" }} />}
    </div>
    <Nav.Row>
      <Nav.Column xs="6">
        <Soknadsperiode
          redigerbart={redigerbart}
          lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger}
        />
      </Nav.Column>
      <Nav.Column xs="6">
        <Soknadslandvelger redigerbart={redigerbart} />
      </Nav.Column>
    </Nav.Row>
  </div>
);

export default Utenlandsoppdraget;
