import React from "react";

import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import Soknadsperiode from "./soknadsperiode";
import Soknadslandvelger from "./soknadslandvelger";
import Tittellinje from "./tittellinje";

import "./periode.css";

interface PeriodeProps {
  visArbeidsforholdRolleEtiketter: boolean;
  redigerbart: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
}

const Periode = ({
  visArbeidsforholdRolleEtiketter,
  redigerbart,
  lagreSoknadOgOppfriskSaksopplysninger,
}: PeriodeProps) => (
  <div className="utenlandsoppdraget-periode">
    <Tittellinje
      tittel={KV.Menypunkter.Periode.tittel}
      visArbeidsforholdRolleEtiketter={visArbeidsforholdRolleEtiketter}
    />
    <Nav.Row>
      <Nav.Column xs="6">
        <Soknadsperiode
          redigerbart={redigerbart}
          lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger}
          tittel={KV.Menypunkter.Periode.undertitler.periode}
        />
      </Nav.Column>
      <Nav.Column xs="6">
        <Soknadslandvelger
          redigerbart={redigerbart}
          lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger}
        />
      </Nav.Column>
    </Nav.Row>
  </div>
);

export default Periode;
