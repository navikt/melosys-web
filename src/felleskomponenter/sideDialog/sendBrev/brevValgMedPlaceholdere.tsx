import { ComponentProps } from "react";

import BrevValg from "./brevValg";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "../../../featuretoggle/toggleNavn";
import { usePlaceholderVerdier } from "../../../services/api/placeholdere";

type Props = Omit<ComponentProps<typeof BrevValg>, "placeholderVerdier"> & { behandlingID: number };

// Defence-in-depth som TekstblokkSoek: hooken som henter verdier mountes kun når togglen
// er på. Ellers rendres BrevValg uten placeholderVerdier og alt oppfører seg som i dag.
function BrevValgMedPlaceholdere({ behandlingID, ...rest }: Props) {
  const togglePaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER);
  if (!togglePaa) return <BrevValg {...rest} />;
  return <BrevValgMedVerdier behandlingID={behandlingID} {...rest} />;
}

function BrevValgMedVerdier({ behandlingID, ...rest }: Props) {
  const { data: placeholderVerdier } = usePlaceholderVerdier(behandlingID);
  return <BrevValg {...rest} placeholderVerdier={placeholderVerdier} />;
}

export default BrevValgMedPlaceholdere;
