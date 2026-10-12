import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER } from "../../featuretoggle/toggleNavn";
import UkjentSide from "../ukjentSide";
import TekstblokkerSide from "./tekstblokkerSide";

import "./brevbibliotek.less";

// Oppslagsvisningen for saksbehandlere. Den ligger utenfor administrasjonen med vilje:
// å slå opp i biblioteket krever ikke admintilgang, og skal fungere også i saksflyter
// uten HtmlEditor. Innholdet er admin-siden i skrivebeskyttet modus.
function BrevbibliotekSide() {
  const togglePaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);

  if (togglePaa === false) return <UkjentSide />;
  // Ulastet toggle: vent heller enn å blinke opp en «finnes ikke»-side.
  if (togglePaa === undefined) return null;

  return (
    <main className="brevbibliotek">
      <TekstblokkerSide kanRedigere={false} />
    </main>
  );
}

export default BrevbibliotekSide;
