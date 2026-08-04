import { useMemo } from "react";

import usePlaceholderToggles from "../../../featuretoggle/usePlaceholderToggles";
import { useBetingelseVerdier, usePlaceholderKatalog, usePlaceholderVerdier } from "../../../services/api/placeholdere";
import { Betingelse, PlaceholderVerdi } from "../../../services/modules/placeholdere";

interface PlaceholderKontekst {
  placeholderVerdier?: PlaceholderVerdi[];
  gyldigeNokler?: string[];
  betingelser?: Betingelse[];
}

// Verdiene og katalogen editorene i Send brev deler. Defence-in-depth som TekstblokkSoek:
// hentingen skjer kun når togglene er på, og gatingen ligger på selve spørringen – bytter vi
// komponent når togglene lander asynkront, remounter editorene.
export const usePlaceholderKontekst = (behandlingID: number): PlaceholderKontekst => {
  const { placeholderAktiv: paa } = usePlaceholderToggles();
  const { data: placeholderVerdier } = usePlaceholderVerdier(behandlingID, paa);
  // Katalogen brukes kun til å skille ukjente nøkler fra gyldige uten verdi.
  const { data: katalog } = usePlaceholderKatalog(paa);
  const gyldigeNokler = useMemo(() => katalog?.map(({ nokkel }) => nokkel), [katalog]);
  // Deler spørring med verdiene, så betingelsene alltid er like ferske som dem.
  const { data: betingelser } = useBetingelseVerdier(behandlingID, paa);

  return { placeholderVerdier, gyldigeNokler, betingelser };
};

export default usePlaceholderKontekst;
