import { useCallback, useEffect, useRef, useState } from "react";
import { FieldValue, UseFormGetValues } from "react-hook-form";
import { AarsavregningResponse } from "../../../../../../services/modules/aarsavregning/aarsavregning";
import * as Utils from "../../../../../../utils";
import { AarsavregningFormValuesProps } from "../aarsavregningUtenEllerDeltGrunnlag";
import { mapFormState } from "../utils/formUtils";
import { useTrygdeavgift } from "./useTrygdeavgift";

// Get the type of the function from the hook's return type
type HandleBeregnTrygdeavgiftsperioderFn = ReturnType<typeof useTrygdeavgift>["handleBeregnTrygdeavgiftsperioder"];

interface UseDebouncedBeregningProps {
  getValues: UseFormGetValues<AarsavregningFormValuesProps>;
  redigerbart: boolean;
  aarsavregningID: number | undefined;
  medlemskapstypeErPliktig: boolean;
  endrerBestemmelse: boolean;
  lagreMedlemskapsperioderPaagar: boolean;
  behandlingID: number | undefined;
  handleBeregnTrygdeavgiftsperioder: HandleBeregnTrygdeavgiftsperioderFn; // Use the extracted type
  setHovedFeilmelding: (feil?: string) => void;
  setAarsavregningResponse: (response?: AarsavregningResponse) => void;
}

// Rename the hook function
export function useDebouncedBeregning({
  getValues,
  redigerbart,
  aarsavregningID,
  medlemskapstypeErPliktig,
  endrerBestemmelse,
  lagreMedlemskapsperioderPaagar,
  behandlingID,
  handleBeregnTrygdeavgiftsperioder,
  setHovedFeilmelding,
  setAarsavregningResponse,
}: UseDebouncedBeregningProps) {
  const [beregningPaagar, setBeregningPaagar] = useState(false);
  const [debouncedBeregningPagaar, setDebouncedBeregningPagaar] = useState(false);
  const [forrigeSkjemadataTilBeregning, setForrigeSkjemadataTilBeregning] = useState<any | null>(null);
  const debouncedBeregningRef = useRef<any>(null);

  // Rename wrapper function
  const beregnTrygdeavgiftsperioderMedStatus = useCallback(
    async (formVerdier: FieldValue<AarsavregningFormValuesProps>) => {
      if (behandlingID === undefined) {
        console.error("Kan ikke beregne trygdeavgift: behandlingID mangler.");
        setHovedFeilmelding("En teknisk feil oppstod (manglende behandlingsID).");
        return;
      }

      setBeregningPaagar(true);
      try {
        await handleBeregnTrygdeavgiftsperioder(formVerdier, {
          behandlingID,
          medlemskapstypeErPliktig,
          setFeilmelding: setHovedFeilmelding,
          setAarsavregningResponse,
        });
      } finally {
        setBeregningPaagar(false);
      }
    },
    [
      behandlingID,
      medlemskapstypeErPliktig,
      setHovedFeilmelding,
      setAarsavregningResponse,
      handleBeregnTrygdeavgiftsperioder,
    ],
  );

  // Rename core debounced function
  const debouncedBeregning = useCallback(() => {
    console.log("*** Kjører debouncedBeregning (useDebouncedBeregning) ***");
    setDebouncedBeregningPagaar(false);

    if (!redigerbart || !aarsavregningID || endrerBestemmelse || beregningPaagar || lagreMedlemskapsperioderPaagar) {
      console.log("*** Avbrutt inne i debouncedBeregning (status sjekk) ***");
      return;
    }

    const gjeldendeSkjemadataTilBeregning = mapFormState(
      getValues("skatteforholdsperioder"),
      getValues("inntektskilder"),
      getValues("medlemskapsperioder"),
      getValues("totaltForskuddsvisFakturert") != null ? Number(getValues("totaltForskuddsvisFakturert")) : undefined,
    );

    if (!Utils._isEqual(gjeldendeSkjemadataTilBeregning, forrigeSkjemadataTilBeregning)) {
      console.log("*** Starter selve beregningen... ***");
      beregnTrygdeavgiftsperioderMedStatus(getValues())
        .then(() => {
          console.log("*** Beregning fullført, oppdaterer forrigeSkjemadataTilBeregning ***");
          setForrigeSkjemadataTilBeregning(gjeldendeSkjemadataTilBeregning);
        })
        .catch((error) => {
          console.error("*** Feil under beregning: ***", error);
        })
        .finally(() => {
          console.log("*** Beregning API kall ferdig (finally) ***");
        });
    } else {
      console.log(
        "*** Inne i debouncedBeregning, men state er lik forrigeSkjemadataTilBeregning, skipper API kall ***",
      );
    }
  }, [
    redigerbart,
    aarsavregningID,
    endrerBestemmelse,
    beregningPaagar,
    lagreMedlemskapsperioderPaagar,
    getValues,
    forrigeSkjemadataTilBeregning,
    beregnTrygdeavgiftsperioderMedStatus,
  ]);

  useEffect(() => {
    console.log("*** Setter opp ny debouncedBeregning funksjon (useDebouncedBeregning) ***");
    setDebouncedBeregningPagaar(false);
    debouncedBeregningRef.current = Utils._debounce(debouncedBeregning, 350);

    return () => {
      if (debouncedBeregningRef.current?.cancel) {
        console.log("*** Avbryter debounce for beregning (unmount/dependency change) ***");
        debouncedBeregningRef.current.cancel();
      }
    };
  }, [debouncedBeregning]);

  return {
    beregningPaagar,
    debouncedBeregningPagaar,
    setDebouncedBeregningPagaar,
    forrigeSkjemadataTilBeregning,
    setForrigeSkjemadataTilBeregning,
    debouncedBeregningRef,
  };
}
