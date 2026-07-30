import { ComponentProps } from "react";

import BrevValg from "./brevValg";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER, MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "../../../featuretoggle/toggleNavn";
import { usePlaceholderVerdier } from "../../../services/api/placeholdere";

type Props = Omit<ComponentProps<typeof BrevValg>, "placeholderVerdier"> & { behandlingID: number };

// Defence-in-depth som TekstblokkSoek: hentingen av verdier skjer kun når togglene er på.
// Gatingen ligger på selve spørringen og ikke på hvilken komponent vi rendrer – bytter vi
// elementtype når togglene lander asynkront, remounter hele brev-felt-treet med editorene.
function BrevValgMedPlaceholdere({ behandlingID, ...rest }: Props) {
  // Backend krever begge: placeholdere er en utvidelse av tekstblokk-funksjonaliteten.
  const tekstblokkerPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  const dynamiskPlaceholderPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  const { data: placeholderVerdier } = usePlaceholderVerdier(
    behandlingID,
    Boolean(tekstblokkerPaa && dynamiskPlaceholderPaa),
  );

  return <BrevValg {...rest} placeholderVerdier={placeholderVerdier} />;
}

export default BrevValgMedPlaceholdere;
