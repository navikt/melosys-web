import React, { ReactNode } from "react";

import * as Nav from "../../../../utils/navFrontend";
import * as KV from "../../../../kodeverk";

import Soknadsperiode from "./soknadsperiode";
import Soknadslandvelger from "./soknadslandvelger";
import Tittellinje from "./tittellinje";

import "./periode.css";

interface PeriodeProps {
  visArbeidsforholdRolleEtiketter: boolean;
  redigerbart: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
  behandlingsgrunnlagEtikett: ReactNode;
}

const Periode = ({
  visArbeidsforholdRolleEtiketter,
  redigerbart,
  lagreSoknadOgOppfriskSaksopplysninger,
  behandlingsgrunnlagEtikett,
}: PeriodeProps) => (
  <div className="utenlandsoppdraget-periode">
    <Tittellinje
      tittel={KV.Menypunkter.Periode.tittel}
      behandlingsgrunnlagEtikett={behandlingsgrunnlagEtikett}
      visArbeidsforholdRolleEtiketter={visArbeidsforholdRolleEtiketter}
    />
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

export default Periode;
