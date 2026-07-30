import { ComponentProps, useMemo } from "react";

import BrevValg from "./brevValg";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER, MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "../../../featuretoggle/toggleNavn";
import { usePlaceholderKatalog, usePlaceholderVerdier } from "../../../services/api/placeholdere";

type Props = Omit<ComponentProps<typeof BrevValg>, "placeholderVerdier" | "gyldigeNokler"> & { behandlingID: number };

// Defence-in-depth som TekstblokkSoek: hentingen av verdier skjer kun når togglene er på.
// Gatingen ligger på selve spørringen og ikke på hvilken komponent vi rendrer – bytter vi
// elementtype når togglene lander asynkront, remounter hele brev-felt-treet med editorene.
function BrevValgMedPlaceholdere({ behandlingID, ...rest }: Props) {
  // Backend krever begge: placeholdere er en utvidelse av tekstblokk-funksjonaliteten.
  const tekstblokkerPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  const dynamiskPlaceholderPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  const paa = Boolean(tekstblokkerPaa && dynamiskPlaceholderPaa);
  const { data: placeholderVerdier } = usePlaceholderVerdier(behandlingID, paa);
  // Katalogen brukes kun til å skille ukjente nøkler fra gyldige uten verdi.
  const { data: katalog } = usePlaceholderKatalog(paa);
  const gyldigeNokler = useMemo(() => katalog?.map(({ nokkel }) => nokkel), [katalog]);

  return <BrevValg {...rest} placeholderVerdier={placeholderVerdier} gyldigeNokler={gyldigeNokler} />;
}

export default BrevValgMedPlaceholdere;
