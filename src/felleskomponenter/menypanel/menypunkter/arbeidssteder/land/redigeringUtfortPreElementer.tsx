import React from "react";

import IkkeEditerbareArbeidPaaLandSporsmal from "./ikkeEditerbareArbeidPaaLandSporsmal";

import { EnRedigeringsknappListeRedigeringUtfortPreElementer } from "../../editerbartElementListe";

const RedigeringUtfortPreElementer = ({ className }: EnRedigeringsknappListeRedigeringUtfortPreElementer) => (
  <div className={className}>
    <IkkeEditerbareArbeidPaaLandSporsmal />
  </div>
);

export default RedigeringUtfortPreElementer;
