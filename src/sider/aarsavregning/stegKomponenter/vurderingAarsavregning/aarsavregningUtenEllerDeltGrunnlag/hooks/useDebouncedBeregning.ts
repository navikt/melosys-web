import { useCallback, useEffect, useRef, useState } from "react";
import { FieldValue, UseFormGetValues } from "react-hook-form";
import { AarsavregningResponse } from "../../../../../../services/modules/aarsavregning/aarsavregning";
import * as Utils from "../../../../../../utils";
import { AarsavregningFormValuesProps } from "../aarsavregningUtenEllerDeltGrunnlag";
import { mapFormState } from "../utils/formUtils";
import { useTrygdeavgift } from "./useTrygdeavgift";

// Hent typen til funksjonen fra hookens returtype
type HandleBeregnTrygdeavgiftsperioderFn = ReturnType<typeof useTrygdeavgift>["handleBeregnTrygdeavgiftsperioder"];

interface UseDebouncedBeregningProps {
  getValues: UseFormGetValues<AarsavregningFormValuesProps>;
  redigerbart: boolean;
  aarsavregningID: number | undefined;
  medlemskapstypeErPliktig: boolean;
  endrerBestemmelse: boolean;
  lagreMedlemskapsperioderPaagar: boolean;
  behandlingID: number | undefined;
  handleBeregnTrygdeavgiftsperioder: HandleBeregnTrygdeavgiftsperioderFn; // Bruk uthentet type
  setHovedFeilmelding: (feil?: string) => void;
  setAarsavregningResponse: (response?: AarsavregningResponse) => void;
}

// Omdøpt hook-funksjon
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
  // Omdøpt state
  const [forrigeSkjemadataTilBeregning, setForrigeSkjemadataTilBeregning] = useState<any | null>(null);
  const debouncedBeregningRef = useRef<any>(null);

  // Omdøpt wrapper-funksjon for å håndtere loading-state
  const beregnTrygdeavgiftsperioderMedStatus = useCallback(
    async (formVerdier: FieldValue<AarsavregningFormValuesProps>) => {
      // Legg til sjekk for behandlingID
      if (behandlingID === undefined) {
        console.error("Kan ikke beregne trygdeavgift: behandlingID mangler.");
        setHovedFeilmelding("En teknisk feil oppstod (manglende behandlingsID).");
        return;
      }

      setBeregningPaagar(true);
      try {
        await handleBeregnTrygdeavgiftsperioder(formVerdier, {
          behandlingID, // Nå garantert et tall
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

  // Omdøpt kjerne debounced beregningsfunksjon
  const debouncedBeregning = useCallback(() => {
    console.log("*** Kjører debouncedBeregning (useDebouncedBeregning) ***");
    setDebouncedBeregningPagaar(false);

    // Sjekk betingelser på nytt inne i debounced funksjon
    if (!redigerbart || !aarsavregningID || endrerBestemmelse || beregningPaagar || lagreMedlemskapsperioderPaagar) {
      console.log("*** Avbrutt inne i debouncedBeregning (status sjekk) ***");
      return;
    }

    // Omdøpt intern variabel
    const gjeldendeSkjemadataTilBeregning = mapFormState(
      getValues("skatteforholdsperioder"),
      getValues("inntektskilder"),
      getValues("medlemskapsperioder"),
      getValues("totaltForskuddsvisFakturert") != null ? Number(getValues("totaltForskuddsvisFakturert")) : undefined,
    );

    // Bruk omdøpt state
    if (!Utils._isEqual(gjeldendeSkjemadataTilBeregning, forrigeSkjemadataTilBeregning)) {
      console.log("*** Starter selve beregningen... ***");
      // Bruk omdøpt wrapper
      beregnTrygdeavgiftsperioderMedStatus(getValues())
        .then(() => {
          console.log("*** Beregning fullført, oppdaterer forrigeSkjemadataTilBeregning ***");
          // Bruk omdøpt setter
          setForrigeSkjemadataTilBeregning(gjeldendeSkjemadataTilBeregning);
        })
        .catch((error) => {
          console.error("*** Feil under beregning: ***", error);
        })
        .finally(() => {
          console.log("*** Beregning API kall ferdig (finally) ***");
        });
    } else {
      // Formatert console log
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
    forrigeSkjemadataTilBeregning, // Bruk omdøpt state
    beregnTrygdeavgiftsperioderMedStatus, // Bruk omdøpt wrapper
  ]);

  // Effekt for å sette opp ref til den debounced funksjonen
  useEffect(() => {
    console.log("*** Setter opp ny debouncedBeregning funksjon (useDebouncedBeregning) ***");
    setDebouncedBeregningPagaar(false);
    debouncedBeregningRef.current = Utils._debounce(debouncedBeregning, 350); // Bruk omdøpt debounced funksjon

    // Rydd opp funksjon
    return () => {
      if (debouncedBeregningRef.current?.cancel) {
        console.log("*** Avbryter debounce for beregning (unmount/dependency change) ***");
        debouncedBeregningRef.current.cancel();
      }
    };
  }, [debouncedBeregning]); // Bruk omdøpt debounced funksjon

  return {
    beregningPaagar,
    debouncedBeregningPagaar,
    setDebouncedBeregningPagaar,
    forrigeSkjemadataTilBeregning, // Returner omdøpt state
    setForrigeSkjemadataTilBeregning, // Returner omdøpt setter (trengs denne utenfor?)
    debouncedBeregningRef,
  };
}
