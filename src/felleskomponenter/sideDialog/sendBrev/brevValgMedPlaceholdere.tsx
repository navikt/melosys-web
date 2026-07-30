import { ComponentProps } from "react";

import BrevValg from "./brevValg";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER, MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "../../../featuretoggle/toggleNavn";
import { usePlaceholderVerdier } from "../../../services/api/placeholdere";

type Props = Omit<ComponentProps<typeof BrevValg>, "placeholderVerdier"> & { behandlingID: number };

// Defence-in-depth som TekstblokkSoek: hooken som henter verdier mountes kun når togglene
// er på. Ellers rendres BrevValg uten placeholderVerdier og alt oppfører seg som i dag.
function BrevValgMedPlaceholdere({ behandlingID, ...rest }: Props) {
  // Backend krever begge: placeholdere er en utvidelse av tekstblokk-funksjonaliteten.
  const tekstblokkerPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  const dynamiskPlaceholderPaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  if (!tekstblokkerPaa || !dynamiskPlaceholderPaa) return <BrevValg {...rest} />;
  return <BrevValgMedVerdier behandlingID={behandlingID} {...rest} />;
}

function BrevValgMedVerdier({ behandlingID, ...rest }: Props) {
  const { data: placeholderVerdier } = usePlaceholderVerdier(behandlingID);
  return <BrevValg {...rest} placeholderVerdier={placeholderVerdier} />;
}

export default BrevValgMedPlaceholdere;
