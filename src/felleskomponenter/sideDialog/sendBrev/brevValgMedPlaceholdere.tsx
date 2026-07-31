import { ComponentProps } from "react";

import BrevValg from "./brevValg";
import usePlaceholderKontekst from "./usePlaceholderKontekst";

type Props = Omit<ComponentProps<typeof BrevValg>, "placeholderVerdier" | "gyldigeNokler" | "betingelser"> & {
  behandlingID: number;
};

function BrevValgMedPlaceholdere({ behandlingID, ...rest }: Props) {
  const { placeholderVerdier, gyldigeNokler, betingelser } = usePlaceholderKontekst(behandlingID);

  return (
    <BrevValg
      {...rest}
      placeholderVerdier={placeholderVerdier}
      gyldigeNokler={gyldigeNokler}
      betingelser={betingelser}
    />
  );
}

export default BrevValgMedPlaceholdere;
