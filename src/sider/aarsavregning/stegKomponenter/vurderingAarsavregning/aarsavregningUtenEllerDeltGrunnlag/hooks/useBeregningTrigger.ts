import { useEffect, useRef } from "react";
import { UseFormGetValues, UseFormTrigger } from "react-hook-form";
import * as Utils from "../../../../../../utils";
import { Medlemskapsperiode } from "../../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { AarsavregningFormValuesProps } from "../aarsavregningUtenEllerDeltGrunnlag";
import { getChangedDependencies } from "../utils/debugUtils";
import { mapFormState } from "../utils/formUtils";
import { Skatteforhold, Inntektskilde } from "../../../../../../felleskomponenter/trygdeavgift/komponenter/types";

interface UseCalculationTriggerProps {
  // Form values / state triggers
  skatteforholdsperioder: Skatteforhold[];
  inntektskilder: Inntektskilde[];
  lagreMedlemskapsperioderPaagar: boolean;
  endrerBestemmelse: boolean;
  totaltForskuddsvisFakturert: number | undefined;
  // Other state/props needed for conditions
  redigerbart: boolean;
  aarsavregningID: number | undefined;
  beregningPaagar: boolean;
  // Form methods
  trigger: UseFormTrigger<AarsavregningFormValuesProps>;
  getValues: UseFormGetValues<AarsavregningFormValuesProps>;
  // Validation and calculation functions/refs
  validerForm: (
    skatteforholdsperioder: Skatteforhold[],
    inntektskilder: Inntektskilde[],
    medlemskapsperiode: { fomDato?: string; tomDato?: string },
    medlemskapsperioder: Medlemskapsperiode[],
    medlemskapstypeErPliktig: boolean,
  ) => boolean;
  setArrayValideringsfeil: (error?: string) => void;
  finnMedlemskapsperiode: (perioder: Medlemskapsperiode[]) => { fomDato?: string; tomDato?: string };
  medlemskapstypeErPliktig: boolean;
  debouncedBeregningRef: React.MutableRefObject<any>; // Ref to the debounced function
  setDebouncedBeregningPagaar: (pagaar: boolean) => void;
  // State reflecting last calculation
  previousFormState: any;
}

export function useBeregningTrigger({
  skatteforholdsperioder,
  inntektskilder,
  lagreMedlemskapsperioderPaagar,
  endrerBestemmelse,
  totaltForskuddsvisFakturert,
  redigerbart,
  aarsavregningID,
  beregningPaagar,
  trigger,
  getValues,
  validerForm,
  setArrayValideringsfeil,
  finnMedlemskapsperiode,
  medlemskapstypeErPliktig,
  debouncedBeregningRef,
  setDebouncedBeregningPagaar,
  previousFormState,
}: UseCalculationTriggerProps) {
  const previousDepsRef = useRef<any>(null);

  useEffect(() => {
    const currentDeps = {
      skatteforholdsperioder,
      inntektskilder,
      lagreMedlemskapsperioderPaagar,
      endrerBestemmelse,
      totaltForskuddsvisFakturert,
    };

    const changedDependencies = getChangedDependencies(currentDeps, previousDepsRef);

    if (Object.keys(changedDependencies).length === 0 || lagreMedlemskapsperioderPaagar) {
      if (lagreMedlemskapsperioderPaagar) {
        console.log("*** Calculation Check: Skipping (save in progress) ***");
      }
      return;
    }

    if (debouncedBeregningRef.current?.cancel) {
      console.log("*** Calculation Check: Cancelling pending debounce ***");
      setDebouncedBeregningPagaar(false);
      debouncedBeregningRef.current.cancel();
    }

    console.log("*** Calculation Check: Relevant changes detected, starting validation ***", { changedDependencies });
    trigger().then((isRHFValid) => {
      if (!isRHFValid) {
        console.log("*** Calculation Check: RHF validation FAILED, skipping calculation ***");
        setArrayValideringsfeil(undefined);
        return;
      }

      console.log("*** Calculation Check: RHF validation OK, running custom validation... ***");
      const currentMedlemskapsperioder = getValues("medlemskapsperioder") as Medlemskapsperiode[];
      const medlemskapsperiodeFomTom = finnMedlemskapsperiode(currentMedlemskapsperioder);

      const isCustomValid = validerForm(
        getValues("skatteforholdsperioder"),
        getValues("inntektskilder"),
        medlemskapsperiodeFomTom,
        currentMedlemskapsperioder,
        medlemskapstypeErPliktig,
      );

      if (!isCustomValid) {
        console.log("*** Calculation Check: Custom validation FAILED, skipping calculation ***");
        return;
      }

      console.log("*** Calculation Check: All validations OK ***");
      setArrayValideringsfeil(undefined);

      if (!redigerbart || !aarsavregningID || endrerBestemmelse || beregningPaagar) {
        console.log("*** Calculation Check: Skipping debounce (not editable, missing ID, etc.) ***", {
          redigerbart,
          aarsavregningID,
          endrerBestemmelse,
          beregningPaagar,
        });
        return;
      }

      const currentFormState = mapFormState(
        getValues("skatteforholdsperioder"),
        getValues("inntektskilder"),
        currentMedlemskapsperioder,
        getValues("totaltForskuddsvisFakturert") != null ? Number(getValues("totaltForskuddsvisFakturert")) : undefined,
      );

      if (!Utils._isEqual(currentFormState, previousFormState)) {
        console.log("*** Calculation Check: State changed, queueing debounced calculation ***");
        if (debouncedBeregningRef.current) {
          setDebouncedBeregningPagaar(true);
          debouncedBeregningRef.current();
        } else {
          console.error("*** Calculation Check: debouncedBeregningRef is undefined! ***");
        }
      } else {
        console.log("*** Calculation Check: State unchanged since last calculation, skipping debounce ***");
      }
    });
  }, [
    // Dependencies from props
    skatteforholdsperioder,
    inntektskilder,
    lagreMedlemskapsperioderPaagar,
    endrerBestemmelse,
    totaltForskuddsvisFakturert,
    redigerbart,
    aarsavregningID,
    beregningPaagar,
    trigger,
    getValues,
    validerForm,
    setArrayValideringsfeil,
    finnMedlemskapsperiode,
    medlemskapstypeErPliktig,
    previousFormState,
    debouncedBeregningRef, // Ref itself is stable
    setDebouncedBeregningPagaar, // Setter is stable
  ]);
}
