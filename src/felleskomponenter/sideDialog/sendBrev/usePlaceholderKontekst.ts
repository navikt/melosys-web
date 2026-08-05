import { useMemo } from "react";

import usePlaceholderToggles from "../../../featuretoggle/usePlaceholderToggles";
import {
  useBetingelseKatalog,
  useBetingelseVerdier,
  usePlaceholderKatalog,
  usePlaceholderVerdier,
} from "../../../services/api/placeholdere";
import { Betingelse, PlaceholderVerdi } from "../../../services/modules/placeholdere";

interface PlaceholderKontekst {
  placeholderVerdier?: PlaceholderVerdi[];
  gyldigeNokler?: string[];
  gyldigeBetingelsesNokler?: string[];
  betingelser?: Betingelse[];
}

// Verdiene og katalogene editorene i Send brev deler. Gatingen ligger på selve spørringen,
// ikke på hvilken komponent som rendres: et komponentbytte når togglene lander asynkront
// ville remountet editorene.
export const usePlaceholderKontekst = (behandlingID: number): PlaceholderKontekst => {
  const { placeholderAktiv: paa } = usePlaceholderToggles();
  const { data: placeholderVerdier } = usePlaceholderVerdier(behandlingID, paa);
  // Katalogen brukes kun til å skille ukjente nøkler fra gyldige uten verdi.
  const { data: katalog } = usePlaceholderKatalog(paa);
  const gyldigeNokler = useMemo(() => katalog?.map(({ nokkel }) => nokkel), [katalog]);
  // Betingelsesnøklene skiller en feilstavet {#hvis …} fra en som finnes.
  const { data: betingelseKatalog } = useBetingelseKatalog(paa);
  const gyldigeBetingelsesNokler = useMemo(() => betingelseKatalog?.map(({ nokkel }) => nokkel), [betingelseKatalog]);
  // Deler spørring med verdiene, så betingelsene alltid er like ferske som dem.
  const { data: betingelser } = useBetingelseVerdier(behandlingID, paa);

  return { placeholderVerdier, gyldigeNokler, gyldigeBetingelsesNokler, betingelser };
};

export default usePlaceholderKontekst;
