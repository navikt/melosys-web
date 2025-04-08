import { useCallback, useEffect, useRef } from "react";
import { UseFormSetValue, UseFormTrigger } from "react-hook-form";
import { Medlemskapsperiode } from "../../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import * as Utils from "../../../../../../utils";
import { AarsavregningFormValuesProps } from "../aarsavregningUtenEllerDeltGrunnlag";
import { medlemskapsperioderHarBrukerendringer } from "../utils/formUtils";
import { finnAktivFeilmeldingForMedlemskapsperioder } from "../valideringsfeil";

interface UseMedlemskapSavingTriggerProps {
  medlemskapsperioder: Medlemskapsperiode[];
  lagredeMedlemskapsperioder: Medlemskapsperiode[];
  setLagredeMedlemskapsperioder: (perioder: Medlemskapsperiode[]) => void;
  redigerbart: boolean;
  endrerBestemmelse: boolean;
  lagreMedlemskapsperioderPaagar: boolean;
  setLagreMedlemskapsperioderPaagar: (pagaar: boolean) => void;
  trigger: UseFormTrigger<AarsavregningFormValuesProps>;
  setValue: UseFormSetValue<AarsavregningFormValuesProps>;
  bestemmelse: string | undefined;
  lagreMedlemskapsperioder: (
    perioder: Medlemskapsperiode[],
    bestemmelse: string,
    faktiskLagredePerioder: Medlemskapsperiode[],
  ) => Promise<Medlemskapsperiode[]>;
  setArrayValideringsfeil: (error?: string) => void;
}

export function useMedlemskapLagringTrigger({
  medlemskapsperioder,
  lagredeMedlemskapsperioder,
  setLagredeMedlemskapsperioder,
  redigerbart,
  endrerBestemmelse,
  lagreMedlemskapsperioderPaagar,
  setLagreMedlemskapsperioderPaagar,
  trigger,
  setValue,
  bestemmelse,
  lagreMedlemskapsperioder,
  setArrayValideringsfeil,
}: UseMedlemskapSavingTriggerProps) {
  const medlemskapsperioderForrigeAntall = useRef(medlemskapsperioder.length);
  const debouncedLagreMedlemskapsperioderRef = useRef<any>(null);

  // --- Debounced Saving Function ---
  const debouncedLagreMedlemskapsperioder = useCallback(
    (medlemskapsperioderFormValues: Medlemskapsperiode[], callbackEtterLagring?: () => void) => {
      console.log("*** Kaller lagreMedlemskapsperioder via debounce ***", medlemskapsperioderFormValues);
      lagreMedlemskapsperioder(medlemskapsperioderFormValues, bestemmelse || "", lagredeMedlemskapsperioder)
        .then((oppdaterteMedlemskapsperioder) => {
          console.log("*** lagreMedlemskapsperioder ferdig, oppdaterte: ***", oppdaterteMedlemskapsperioder);
          // Update both local state and RHF state
          setLagredeMedlemskapsperioder(oppdaterteMedlemskapsperioder);
          setValue("medlemskapsperioder", oppdaterteMedlemskapsperioder, { shouldValidate: false, shouldDirty: false });
        })
        .catch((error) => {
          console.error("*** Feil under lagring av medlemskapsperioder (debounce): ***", error);
          // Potentially set an error message here if needed
        })
        .finally(() => {
          if (callbackEtterLagring) callbackEtterLagring();
        });
    },
    [lagreMedlemskapsperioder, bestemmelse, setValue, lagredeMedlemskapsperioder, setLagredeMedlemskapsperioder],
  );

  // Setup the debounced function ref
  useEffect(() => {
    debouncedLagreMedlemskapsperioderRef.current = Utils._debounce(debouncedLagreMedlemskapsperioder, 350);
    return () => {
      debouncedLagreMedlemskapsperioderRef.current?.cancel?.();
    };
  }, [debouncedLagreMedlemskapsperioder]);

  // --- Effect to trigger medlemskap saving ---
  useEffect(() => {
    const lagreMedlemskapsperioderEffect = async () => {
      if (redigerbart && !endrerBestemmelse && !lagreMedlemskapsperioderPaagar) {
        if (medlemskapsperioder.length !== medlemskapsperioderForrigeAntall.current) {
          console.log("*** Antall perioder endret (add/remove), skipper lagring denne runden ***");
          medlemskapsperioderForrigeAntall.current = medlemskapsperioder.length;
          setArrayValideringsfeil(undefined); // Clear potential gap/overlap errors from add/remove
          return;
        }

        if (!medlemskapsperioderHarBrukerendringer(medlemskapsperioder, lagredeMedlemskapsperioder)) {
          console.log("*** Medlemskap: Ingen brukerendringer detektert, skipper lagring ***");
          return;
        }

        console.log("*** Medlemskap brukerendringer oppdaget, validerer... ***");
        const erGyldigSkjema = await trigger("medlemskapsperioder");
        if (!erGyldigSkjema || !bestemmelse) {
          console.log("*** Medlemskap skjema ikke gyldig eller bestemmelse mangler, skipper lagring ***", {
            erGyldigSkjema,
            bestemmelse,
          });
          // Do not clear arrayValideringsfeil here, as RHF handles field-level errors
          return;
        }

        // Check for gap/overlap errors specifically
        const medlemskapPeriodeFeil = finnAktivFeilmeldingForMedlemskapsperioder(medlemskapsperioder);
        if (medlemskapPeriodeFeil) {
          console.log(
            "*** Medlemskap periode validering feilet (gap/overlap), stopper lagring ***",
            medlemskapPeriodeFeil,
          );
          setArrayValideringsfeil(medlemskapPeriodeFeil);
          return;
        }
        // Clear gap/overlap errors if validation passes now
        setArrayValideringsfeil(undefined);

        console.log("*** Medlemskap skjema gyldig, setter lagring pågår og kaller debounce ***");
        setLagreMedlemskapsperioderPaagar(true);
        // Clone using standard JSON methods for deep clone
        const medlemskapsperioderTilLagring = JSON.parse(JSON.stringify(medlemskapsperioder));
        debouncedLagreMedlemskapsperioderRef.current?.(medlemskapsperioderTilLagring, () => {
          console.log("*** Medlemskap debounce callback: Setter lagring pågår til false ***");
          setLagreMedlemskapsperioderPaagar(false);
        });
      }
    };
    lagreMedlemskapsperioderEffect();
  }, [
    // Direct dependencies from props
    medlemskapsperioder,
    redigerbart,
    endrerBestemmelse,
    bestemmelse,
    lagredeMedlemskapsperioder,
    lagreMedlemskapsperioderPaagar,
    trigger,
    setArrayValideringsfeil,
    setLagreMedlemskapsperioderPaagar,
    // Stable refs/functions derived within the hook
    debouncedLagreMedlemskapsperioderRef, // Depends on the debounce function
  ]);
}
