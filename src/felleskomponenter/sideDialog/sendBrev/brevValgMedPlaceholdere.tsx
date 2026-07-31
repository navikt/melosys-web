import { ComponentProps } from "react";

import BrevValg from "./brevValg";
import usePlaceholderKontekst from "./usePlaceholderKontekst";

type Props = Omit<ComponentProps<typeof BrevValg>, "placeholderVerdier" | "gyldigeNokler"> & { behandlingID: number };

function BrevValgMedPlaceholdere({ behandlingID, ...rest }: Props) {
  const { placeholderVerdier, gyldigeNokler } = usePlaceholderKontekst(behandlingID);

  return <BrevValg {...rest} placeholderVerdier={placeholderVerdier} gyldigeNokler={gyldigeNokler} />;
}

export default BrevValgMedPlaceholdere;
