import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FieldValue, useFieldArray, useForm, useWatch, FieldArrayWithId } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as Utils from "../../../../../../utils";

import { behandlingerSelectors } from "../../../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../../../ducks/behandlingsresultat";
import { redigerbartSelectors } from "../../../../../../ducks/redigerbart";
import * as Api from "../../../../../../services/api";
import { AarsavregningResponse } from "../../../../../../services/modules/aarsavregning/aarsavregning";
import { Medlemskapsperiode, slettMedlemskapsperiode } from "../../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import {
  FieldArrayProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../../../felleskomponenter/trygdeavgift/komponenter/types";

import { erBrukerSkattepliktigIHelePerioden } from "../../komponenter/utils";
import { AarsavregningFormValuesProps, DEFAULT_MEDLEMSKAPSPERIODE } from "../aarsavregningUtenEllerDeltGrunnlag";
import aarsavregningUtenEllerDeltGrunnlagSchema from "../aarsavregningUtenEllerDeltGrunnlagSchema";

import { getChangedDependencies } from "../utils/debugUtils";
import { mapFormState, medlemskapsperioderHarBrukerendringer } from "../utils/formUtils";
import { useFormValidation } from "./useFormValidation";
import { useMedlemskapsperioder } from "./useMedlemskapsperioder";
import { useTrygdeavgift } from "./useTrygdeavgift";

export function useAarsavregningForm({
  initiellData,
  bekreft,
  oppdaterStatus,
}: {
  initiellData: {
    valgtÅr?: number;
    aarsavregningResponse?: AarsavregningResponse;
    bestemmelser: string[];
    formDefaultValues: FieldValue<AarsavregningFormValuesProps>;
    trygdedekninger?: string[];
  };
  bekreft: () => void;
  oppdaterStatus: (isValid: boolean) => void;
}) {
  // State
  const [feilmelding, setFeilmelding] = useState<undefined | string>(undefined);
  const [beregningPaagar, setBeregningPaagar] = useState(false);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(
    initiellData.aarsavregningResponse,
  );
  const [previousFormState, setPreviousFormState] = useState<any | null>(null);
  const [debouncedBeregningPagaar, setDebouncedBeregningPagaar] = useState(false);

  const [trygdedekninger, setTrygdedekninger] = useState<string[]>(initiellData.trygdedekninger || []);
  const [endrerBestemmelse, setEndrerBestemmelse] = useState(false);
  const [lagredeMedlemskapsperioder, setLagredeMedlemskapsperioder] = useState<Medlemskapsperiode[]>(
    initiellData.formDefaultValues.medlemskapsperioder || [],
  );

  // Redux selectors
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);
  const dispatch = useDispatch();

  // Custom hooks
  const { arrayValideringsfeil, setArrayValideringsfeil, validerForm, stegErGyldig } = useFormValidation();
  const {
    lagreMedlemskapsperioderPaagar,
    setLagreMedlemskapsperioderPaagar,
    finnMedlemskapsperiode,
    lagreMedlemskapsperioder,
    slettMedlemskapsperiode: slettMedlemskapsperiodeFn,
  } = useMedlemskapsperioder(behandlingID);
  const { handleBeregnTrygdeavgiftsperioder, handleOppdaterTotaltForskuddsvisFakturert } = useTrygdeavgift(
    behandlingID,
    aarsavregningID,
  );

  // Set up form
  const {
    control,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { isValid: formIsValid, errors },
  } = useForm({
    resolver: yupResolver(aarsavregningUtenEllerDeltGrunnlagSchema),
    context: {
      aar: initiellData.valgtÅr,
    },
    mode: "onChange",
    defaultValues: initiellData.formDefaultValues,
  });

  // Field arrays
  const {
    fields: medlemskapsperioderFields,
    append: medlemskapsperioderAppend,
    remove: medlemskapsperioderRemove,
  } = useFieldArray<FieldArrayProps, "medlemskapsperioder", "id">({ control, name: "medlemskapsperioder" });

  const {
    fields: skattFields,
    append: skattAppend,
    remove: skattRemove,
  } = useFieldArray<FieldArrayProps, "skatteforholdsperioder", "id">({ control, name: "skatteforholdsperioder" });

  const {
    fields: inntektFields,
    append: inntektAppend,
    remove: inntektRemove,
    update: inntektUpdate,
  } = useFieldArray<FieldArrayProps, "inntektskilder", "id">({ control, name: "inntektskilder" });

  // Form field watches
  const formValues = watch();
  const bestemmelse = useWatch({ control, name: "bestemmelse" });
  const medlemskapsperioder = useWatch({ control, name: "medlemskapsperioder" }) as Medlemskapsperiode[];
  const medlemskapsperioderForrigeAntall = useRef(medlemskapsperioder.length);
  const totaltForskuddsvisFakturert = useWatch({ control, name: "totaltForskuddsvisFakturert" });
  const skatteforholdsperioder = useWatch({ control, name: "skatteforholdsperioder" });
  const inntektskilder = useWatch({ control, name: "inntektskilder" });

  // Refs
  const debouncedBeregningRef = useRef<any>(null);
  const forrigeTotaltForskuddsvisFakturert = useRef(totaltForskuddsvisFakturert);
  const previousDepsRef = useRef<any>(null);

  // Derived state
  const medlemskapstypeErPliktig = useMemo(() => {
    return medlemskapsperioder
      .filter((periode: Medlemskapsperiode) => periode.id !== DEFAULT_MEDLEMSKAPSPERIODE.id)
      .every((periode: Medlemskapsperiode) => periode.medlemskapstype === "PLIKTIG"); // Using a string literal instead of MKV.Koder to keep this example simple
  }, [medlemskapsperioder]);

  const medlemskapsperiode = useMemo(() => {
    return finnMedlemskapsperiode(medlemskapsperioder);
  }, [medlemskapsperioder, finnMedlemskapsperiode]);

  // Handle calculations
  const handleBeregnTrygdeavgiftsperioderWithState = useCallback(
    async (formVerdier: FieldValue<AarsavregningFormValuesProps>) => {
      setBeregningPaagar(true);
      await handleBeregnTrygdeavgiftsperioder(formVerdier, {
        behandlingID,
        medlemskapstypeErPliktig,
        setFeilmelding,
        setAarsavregningResponse,
      });
      setBeregningPaagar(false);
    },
    [
      medlemskapstypeErPliktig,
      setFeilmelding,
      setAarsavregningResponse,
      handleBeregnTrygdeavgiftsperioder,
      behandlingID,
    ],
  );

  // Effect to create debounced beregning function
  useEffect(() => {
    const stableBeregningFn = async () => {
      if (debouncedBeregningPagaar) {
        console.log("Beregning allerede pågår, skipping");
        return;
      }

      const verdier = getValues();
      console.log("Trigga en beregning, formValues:", formValues, "verdier:", { ...verdier });
      
      setDebouncedBeregningPagaar(true);

      if (formIsValid && redigerbart && !endrerBestemmelse) {
        const aktivFeilmelding = validerForm(
          verdier.skatteforholdsperioder,
          verdier.inntektskilder,
          medlemskapsperiode,
          verdier.medlemskapsperioder,
          medlemskapstypeErPliktig
        );
        if (!aktivFeilmelding) {
          setArrayValideringsfeil(undefined);
          setBeregningPaagar(true);
          handleBeregnTrygdeavgiftsperioderWithState(getValues())
            .then(() => {
              setPreviousFormState(formValues);
            })
            .finally(() => {
              setBeregningPaagar(false);
            });
        } else {
          setArrayValideringsfeil(aktivFeilmelding);
        }
      }

      console.log("debouncedBeregning ferdig");
      setDebouncedBeregningPagaar(false);
    };
    
    // Don't create a new debounced function if we're in the middle of an operation
    if (lagreMedlemskapsperioderPaagar) {
      console.log("Skipping debounce recreation - save operation in progress");
      return;
    }
    
    // Only recreate the debounced function if it doesn't exist yet
    if (!debouncedBeregningRef.current) {
      console.log("Lager en ny debounce funksjon");
      setDebouncedBeregningPagaar(false);
      debouncedBeregningRef.current = Utils._debounce(stableBeregningFn, 350);
    }

    // Cancel på unmount
    return () => {
      if (debouncedBeregningRef.current?.cancel) {
        console.log("Avbryter eventuelt eksisterende beregning ved unmount.");
        debouncedBeregningRef.current.cancel();
      }
    };
  // Remove debouncedBeregning from dependencies to prevent recreation loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create a completed flag to prevent re-saving the same data
  const savedMedlemskapsperioderId = useRef<string | number | null>(null);
  
  // Effect to update medlemskapsperioder
  useEffect(() => {
    // Skip processing if we've just saved this exact data
    const currentId = medlemskapsperioder[0]?.id;
    if (currentId && currentId === savedMedlemskapsperioderId.current) {
      console.log("Skipping save - already processed this data", currentId);
      return;
    }

    console.log("medlemskapsperioder effect running with values:", {
      length: medlemskapsperioder.length,
      paagar: lagreMedlemskapsperioderPaagar
    });
    
    // Skip if we're already in the process of saving
    if (lagreMedlemskapsperioderPaagar) {
      console.log("Skipping save - operation already in progress");
      return;
    }
    
    const lagreMedlemskapsperioderEffect = async () => {
      // Guard against reentrant calls - if we're already in this effect, don't run it again
      if (medlemskapsperioderEffectRunning.current) {
        console.log("Skipping medlemskapsperioder effect - already running");
        return;
      }
      
      try {
        medlemskapsperioderEffectRunning.current = true;
        
        if (redigerbart && !endrerBestemmelse) {
          if (medlemskapsperioder.length !== medlemskapsperioderForrigeAntall.current) {
            // Når vi kommer inn her, betyr det at bruker har trykket på "Legg til"-knappen, som automtisk gjør skjema invalid.
            medlemskapsperioderForrigeAntall.current = medlemskapsperioder.length;
            setArrayValideringsfeil(undefined);
            console.log("Skipping save - length changed");
            return;
          }
          if (!medlemskapsperioderHarBrukerendringer(medlemskapsperioder, lagredeMedlemskapsperioder)) {
            console.log("Skipping save - no changes detected");
            return;
          }

          const erGyldigSkjema = await trigger("medlemskapsperioder");
          if (!erGyldigSkjema || !bestemmelse) {
            console.log("Skipping save - form not valid or no bestemmelse");
            return;
          }

          console.log("setter lagrerMedlemskapsperioder til true");
          setLagreMedlemskapsperioderPaagar(true);
          const medlemskapsperioderTilLagring = [...medlemskapsperioder];
          console.log("medlemskapsperioderTilLagring", medlemskapsperioderTilLagring);
          
          try {
            // Use the reference directly instead of the state setter callback pattern
            if (debouncedLagreMedlemskapsperioderRef.current) {
              await debouncedLagreMedlemskapsperioderRef.current(medlemskapsperioderTilLagring);
              console.log("medlemskapsperioder save completed for", medlemskapsperioderTilLagring[0]?.id);
              // Track the ID we've just saved to avoid re-processing
              if (medlemskapsperioderTilLagring[0]?.id) {
                savedMedlemskapsperioderId.current = medlemskapsperioderTilLagring[0].id;
              }
            }
          } finally {
            // Always reset the state when finished
            setLagreMedlemskapsperioderPaagar(false);
          }
        }
      } finally {
        // Only reset the flag at the end
        medlemskapsperioderEffectRunning.current = false;
      }
    };

    lagreMedlemskapsperioderEffect();
  }, [
    medlemskapsperioder,
    redigerbart,
    endrerBestemmelse,
    bestemmelse,
    lagredeMedlemskapsperioder,
    trigger,
    setArrayValideringsfeil,
  ]);

  // Create a reference for the debounced lagre function to avoid recreations
  const debouncedLagreMedlemskapsperioderRef = useRef<any>(null);
  
  // Initialize the debounced function only once
  useEffect(() => {
    if (!debouncedLagreMedlemskapsperioderRef.current) {
      debouncedLagreMedlemskapsperioderRef.current = Utils._debounce(
        (medlemskapsperioderFormValues: Medlemskapsperiode[]) => {
          console.log("Running debounced lagreMedlemskapsperioder");
          return lagreMedlemskapsperioder(medlemskapsperioderFormValues, bestemmelse || "");
        },
        500
      );
    }
    
    return () => {
      if (debouncedLagreMedlemskapsperioderRef.current?.cancel) {
        debouncedLagreMedlemskapsperioderRef.current.cancel();
      }
    };
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Create a flag to track if medlemskapsperioder effect is already running
  const medlemskapsperioderEffectRunning = useRef(false);
  
  // Handle confirm click
  const bekreftOnClick = () => {
    // Validates form
    trigger().then((isValid) => {
      if (isValid) {
        bekreft();
      }
    });
  };

  const handleLeggTilMedlemskapsperiode = () => {
    const defaultMedlemskapsperiode = { ...DEFAULT_MEDLEMSKAPSPERIODE };
    medlemskapsperioderAppend(defaultMedlemskapsperiode);
  };

  const handleSlettMedlemskapsperiode = (id: string) => {
    const index = medlemskapsperioderFields.findIndex((felt) => felt.id === id);
    if (index >= 0) {
      if (id !== DEFAULT_MEDLEMSKAPSPERIODE.id.toString()) {
        dispatch(slettMedlemskapsperiode(behandlingID, Number(id)));
      }
      medlemskapsperioderRemove(index);
    }
  };

  // Handle bestemmelse change
  const lagreMedlemskapsperioderEtterBestemmelseEndringHvisGyldig = async () => {
    // ... existing code ...
  };

  // Computed values for rendering
  const trygdeAvgiftSkalIkkeBetalesTilNav =
    medlemskapstypeErPliktig && erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder);
  const forskuddsvisFakturertTrygdeavgift =
    (aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift?.totalAvgift ?? 0) > 0;
  const skjemaErRedigerbart = redigerbart && !endrerBestemmelse;

  return {
    // State
    feilmelding,
    setFeilmelding,
    beregningPaagar,
    aarsavregningResponse,
    trygdedekninger,
    setTrygdedekninger,
    endrerBestemmelse,
    setEndrerBestemmelse,
    debouncedBeregningPagaar,
    arrayValideringsfeil,

    // Form control
    control,
    formValues,
    formIsValid,
    errors,
    setValue,
    getValues,

    // Field arrays
    medlemskapsperioderFields,
    skattFields,
    inntektFields,

    // Field array actions
    medlemskapsperioderAppend,
    medlemskapsperioderRemove,
    skattAppend,
    skattRemove,
    inntektAppend,
    inntektRemove,
    inntektUpdate,

    // Actions
    handleLeggTilMedlemskapsperiode,
    handleSlettMedlemskapsperiode,
    bekreftOnClick,
    lagreMedlemskapsperioderEtterBestemmelseEndringHvisGyldig,

    // Other computed/derived values
    medlemskapsperiode,
    medlemskapstypeErPliktig,
    trygdeAvgiftSkalIkkeBetalesTilNav,
    forskuddsvisFakturertTrygdeavgift,
    skjemaErRedigerbart,
    redigerbart,
    behandlingID,
    aarsavregningID,
  };
}
