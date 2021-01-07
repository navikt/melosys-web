import React, { ReactNode } from "react";

import * as Nav from "../../../../utils/navFrontend";
import * as Etiketter from "../../etiketter";
import * as KV from "../../../../kodeverk";

import Soknadsperiode from "./soknadsperiode";

interface PeriodeOgLandProps {
  visArbeidsforholdRolleEtiketter: boolean;
  redigerbart: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
  behandlingsgrunnlagEtikett: ReactNode;
}

const PeriodeOgLand = ({
  visArbeidsforholdRolleEtiketter,
  redigerbart,
  lagreSoknadOgOppfriskSaksopplysninger,
  behandlingsgrunnlagEtikett,
}: PeriodeOgLandProps) => (
  <div>
    <div style={{ marginBottom: "1em" }}>
      <Nav.typo.Innholdstittel style={{ display: "inline", marginRight: "1em" }}>
        {KV.Menypunkter.Periode.tittel}
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
    </Nav.Row>
  </div>
);

export default PeriodeOgLand;
