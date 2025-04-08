import { useEffect, useRef } from "react";
import { UseFormGetValues, UseFormTrigger } from "react-hook-form";
import * as Utils from "../../../../../../utils";
import { Medlemskapsperiode } from "../../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { AarsavregningFormValuesProps } from "../aarsavregningUtenEllerDeltGrunnlag";
import { getChangedDependencies } from "../utils/debugUtils";
import { mapFormState } from "../utils/formUtils";
import { Skatteforhold, Inntektskilde } from "../../../../../../felleskomponenter/trygdeavgift/komponenter/types";

interface UseBeregningTriggerProps {
  // Skjemaverdier / state-triggere
  skatteforholdsperioder: Skatteforhold[];
  inntektskilder: Inntektskilde[];
  lagreMedlemskapsperioderPaagar: boolean;
  endrerBestemmelse: boolean;
  totaltForskuddsvisFakturert: number | undefined;
  // Annen state/props nødvendig for betingelser
  redigerbart: boolean;
  aarsavregningID: number | undefined;
  beregningPaagar: boolean;
  // Skjemametoder
  trigger: UseFormTrigger<AarsavregningFormValuesProps>;
  getValues: UseFormGetValues<AarsavregningFormValuesProps>;
  // Validerings- og beregningsfunksjoner/refs
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
  debouncedBeregningRef: React.MutableRefObject<any>; // Ref til den debounced funksjonen
  setDebouncedBeregningPagaar: (pagaar: boolean) => void;
  // State som reflekterer siste beregning
  previousFormState: any; // Bør kanskje hete forrigeSkjemadataTilBeregning her også for konsistens?
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
}: UseBeregningTriggerProps) {
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
        console.log("*** Beregningssjekk: Hopper over (lagring pågår) ***");
      }
      return;
    }

    if (debouncedBeregningRef.current?.cancel) {
      console.log("*** Beregningssjekk: Avbryter ventende debounce ***");
      setDebouncedBeregningPagaar(false);
      debouncedBeregningRef.current.cancel();
    }

    console.log("*** Beregningssjekk: Relevante endringer oppdaget, starter validering ***", { changedDependencies });
    trigger().then((isRHFValid) => {
      if (!isRHFValid) {
        console.log("*** Beregningssjekk: RHF validering FEILET, hopper over beregning ***");
        setArrayValideringsfeil(undefined);
        return;
      }

      console.log("*** Beregningssjekk: RHF validering OK, kjører custom validering... ***");
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
        console.log("*** Beregningssjekk: Custom validering FEILET, hopper over beregning ***");
        return;
      }

      console.log("*** Beregningssjekk: Alle valideringer OK ***");
      setArrayValideringsfeil(undefined);

      if (!redigerbart || !aarsavregningID || endrerBestemmelse || beregningPaagar) {
        console.log("*** Beregningssjekk: Hopper over debounce (ikke redigerbart, mangler ID, etc.) ***", {
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
        console.log("*** Beregningssjekk: State endret, køer debounced beregning ***");
        if (debouncedBeregningRef.current) {
          setDebouncedBeregningPagaar(true);
          debouncedBeregningRef.current();
        } else {
          console.error("*** Beregningssjekk: debouncedBeregningRef er undefined! ***");
        }
      } else {
        console.log("*** Beregningssjekk: State uendret siden siste beregning, hopper over debounce ***");
      }
    });
  }, [
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
    debouncedBeregningRef,
    setDebouncedBeregningPagaar,
  ]);
}
