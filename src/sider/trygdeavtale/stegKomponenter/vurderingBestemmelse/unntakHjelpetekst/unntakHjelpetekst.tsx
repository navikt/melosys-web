import React from "react";

import * as Nav from "../../../../../navFrontend";

const UnntakHjelpetekst = () => {
  return (
    <Nav.EtikettBase type="info">
      <ul>
        <li>Send søknad om unntak som fritekstbrev i &quot;Send brev&quot;-menyen</li>
        <li>Velg &quot;Utenlandsk trygdemyndighet i avtaleland&quot; og riktig trygdemyndighet</li>
        <li>Send orienteringsbrev til bruker/fullmektig i &quot;Send brev&quot;-menyen</li>
        <li>Endre behandlingsstatus til &quot;Avventer svar fra utenlandsk trygdemyndighet&quot;</li>
      </ul>
      <p>
        <strong>Når du får svar fra utenlandsk trygdemyndighet, må du gjøre en ny vurdering av søknaden.</strong>
      </p>
    </Nav.EtikettBase>
  );
};

export default UnntakHjelpetekst;
