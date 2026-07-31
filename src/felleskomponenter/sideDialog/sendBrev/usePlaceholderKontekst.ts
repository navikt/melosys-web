import { useMemo } from "react";

import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER, MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "../../../featuretoggle/toggleNavn";
import { usePlaceholderKatalog, usePlaceholderVerdier } from "../../../services/api/placeholdere";
import { PlaceholderVerdi } from "../../../services/modules/placeholdere";

interface PlaceholderKontekst {
  placeholderVerdier?: PlaceholderVerdi[];
  gyldigeNokler?: string[];
}

// Verdiene og katalogen editorene i Send brev deler. Defence-in-depth som TekstblokkSoek:
// hentingen skjer kun når togglene er på, og gatingen ligger på selve spørringen – bytter vi
// komponent når togglene lander asynkront, remounter editorene.
export const usePlaceholderKontekst = (behandlingID: number): PlaceholderKontekst => {
  // Backend krever begge: placeholdere er en utvidelse av tekstblokk-funksjonaliteten.
  const tekstblokkerPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  const dynamiskPlaceholderPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  const paa = Boolean(tekstblokkerPaa && dynamiskPlaceholderPaa);
  const { data: placeholderVerdier } = usePlaceholderVerdier(behandlingID, paa);
  // Katalogen brukes kun til å skille ukjente nøkler fra gyldige uten verdi.
  const { data: katalog } = usePlaceholderKatalog(paa);
  const gyldigeNokler = useMemo(() => katalog?.map(({ nokkel }) => nokkel), [katalog]);

  return { placeholderVerdier, gyldigeNokler };
};

export default usePlaceholderKontekst;
