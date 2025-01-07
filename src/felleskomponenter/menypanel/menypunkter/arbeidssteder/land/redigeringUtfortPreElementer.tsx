import IkkeEditerbareArbeidPaaLandSporsmal from "./ikkeEditerbareArbeidPaaLandSporsmal";

import { EnRedigeringsknappListeRedigeringUtfortPreElementer } from "../../editerbartElementListe";

function RedigeringUtfortPreElementer({ className }: EnRedigeringsknappListeRedigeringUtfortPreElementer) {
  return (
    <div className={className}>
      <IkkeEditerbareArbeidPaaLandSporsmal />
    </div>
  );
}

export default RedigeringUtfortPreElementer;
