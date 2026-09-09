import { ComponentProps } from "react";

import BrevValg from "./brevValg";
import usePlaceholderKontekst from "./usePlaceholderKontekst";

type Props = Omit<
  ComponentProps<typeof BrevValg>,
  "placeholderVerdier" | "gyldigeNokler" | "gyldigeBetingelsesNokler" | "betingelser"
> & {
  behandlingID: number;
};

function BrevValgMedPlaceholdere({ behandlingID, ...rest }: Props) {
  const { placeholderVerdier, gyldigeNokler, gyldigeBetingelsesNokler, betingelser } =
    usePlaceholderKontekst(behandlingID);

  return (
    <BrevValg
      {...rest}
      placeholderVerdier={placeholderVerdier}
      gyldigeNokler={gyldigeNokler}
      gyldigeBetingelsesNokler={gyldigeBetingelsesNokler}
      betingelser={betingelser}
    />
  );
}

export default BrevValgMedPlaceholdere;
