import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FieldArrayWithId, FieldValue, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Utils from "../../../../../../utils";

import { behandlingerSelectors } from "../../../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../../../ducks/behandlingsresultat";
import { redigerbartSelectors } from "../../../../../../ducks/redigerbart";
import * as Api from "../../../../../../services/api";
import { AarsavregningResponse } from "../../../../../../services/modules/aarsavregning/aarsavregning";
import { Medlemskapsperiode } from "../../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";

import { erBrukerSkattepliktigIHelePerioden } from "../../komponenter/utils";
import { AarsavregningFormValuesProps, DEFAULT_MEDLEMSKAPSPERIODE } from "../aarsavregningUtenEllerDeltGrunnlag";
import aarsavregningUtenEllerDeltGrunnlagSchema from "../aarsavregningUtenEllerDeltGrunnlagSchema";
import { finnAktivFeilmeldingForMedlemskapsperioder } from "../valideringsfeil";

import { useBeregningTrigger } from "./useBeregningTrigger";
import { useDebouncedBeregning } from "./useDebouncedBeregning";
import { useFormValidation } from "./useFormValidation";
import { useMedlemskapLagringTrigger } from "./useMedlemskapLagringTrigger";
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
  // State managed by this hook
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(
    initiellData.aarsavregningResponse,
  );
  const [trygdedekninger, setTrygdedekninger] = useState<string[]>(initiellData.trygdedekninger || []);
  const [endrerBestemmelse, setEndrerBestemmelse] = useState(false);
  const [lagredeMedlemskapsperioder, setLagredeMedlemskapsperioder] = useState<Medlemskapsperiode[]>(
    initiellData.formDefaultValues.medlemskapsperioder || [],
  );
  const [hovedFeilmelding, setHovedFeilmelding] = useState<string | undefined>(undefined);
  // State managed by useDebouncedCalculation: beregningPaagar, debouncedBeregningPagaar, previousFormState

  // Redux selectors
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);

  // Custom hooks
  const { arrayValideringsfeil, setArrayValideringsfeil, validerForm, stegErGyldig } = useFormValidation();
  const {
    lagreMedlemskapsperioderPaagar,
    setLagreMedlemskapsperioderPaagar,
    finnMedlemskapsperiode,
    lagreMedlemskapsperioder,
    slettMedlemskapsperiode: slettMedlemskapsperiodeFn,
    feilmelding: medlemskapFeilmelding,
    setFeilmelding: setMedlemskapFeilmelding,
  } = useMedlemskapsperioder(behandlingID);
  const { handleBeregnTrygdeavgiftsperioder, handleOppdaterTotaltForskuddsvisFakturert } = useTrygdeavgift(
    behandlingID,
    aarsavregningID != null ? Number(aarsavregningID) : undefined,
  );

  // Set up form
  const {
    control,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { isValid: formIsValid, errors },
  } = useForm<AarsavregningFormValuesProps>({
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
  } = useFieldArray<AarsavregningFormValuesProps, "medlemskapsperioder", "id">({
    control,
    name: "medlemskapsperioder",
  });

  const {
    fields: skattFields,
    append: skattAppend,
    remove: skattRemove,
  } = useFieldArray<AarsavregningFormValuesProps, "skatteforholdsperioder", "id">({
    control,
    name: "skatteforholdsperioder",
  });

  const {
    fields: inntektFields,
    append: inntektAppend,
    remove: inntektRemove,
    update: inntektUpdate,
  } = useFieldArray<AarsavregningFormValuesProps, "inntektskilder", "id">({ control, name: "inntektskilder" });

  // Form field watches
  const formValues = watch();
  const bestemmelse = useWatch({ control, name: "bestemmelse" });
  const medlemskapsperioder = useWatch({ control, name: "medlemskapsperioder" });
  const totaltForskuddsvisFakturert = useWatch({ control, name: "totaltForskuddsvisFakturert" });
  const skatteforholdsperioder = useWatch({ control, name: "skatteforholdsperioder" });
  const inntektskilder = useWatch({ control, name: "inntektskilder" });

  // Refs
  const forrigeTotaltForskuddsvisFakturert = useRef(totaltForskuddsvisFakturert);

  // Derived state
  const medlemskapstypeErPliktig = useMemo(() => {
    return medlemskapsperioder
      .filter((periode: Medlemskapsperiode) => periode.id !== DEFAULT_MEDLEMSKAPSPERIODE.id)
      .every((periode: Medlemskapsperiode) => periode.medlemskapstype === "PLIKTIG");
  }, [medlemskapsperioder]);

  const medlemskapsperiode = useMemo(() => {
    return finnMedlemskapsperiode(medlemskapsperioder);
  }, [medlemskapsperioder, finnMedlemskapsperiode]);

  // Recalculate combined feilmelding
  const aktivFeilmeldingForStatus = useMemo(
    () => hovedFeilmelding || medlemskapFeilmelding || arrayValideringsfeil,
    [hovedFeilmelding, medlemskapFeilmelding, arrayValideringsfeil],
  );

  // --- Integrate Debounced Calculation Hook (Renamed) ---
  const {
    beregningPaagar,
    debouncedBeregningPagaar,
    setDebouncedBeregningPagaar,
    forrigeSkjemadataTilBeregning,
    debouncedBeregningRef,
  } = useDebouncedBeregning({
    getValues,
    redigerbart,
    aarsavregningID: aarsavregningID != null ? Number(aarsavregningID) : undefined,
    medlemskapstypeErPliktig,
    endrerBestemmelse,
    lagreMedlemskapsperioderPaagar,
    behandlingID,
    handleBeregnTrygdeavgiftsperioder,
    setHovedFeilmelding,
    setAarsavregningResponse,
  });

  // --- Handlers ---
  const lagreMedlemskapsperioderEtterBestemmelseEndringHvisGyldig = useCallback(
    (oppdaterteMedlemskapsperioder: Medlemskapsperiode[]) => {
      setLagredeMedlemskapsperioder(oppdaterteMedlemskapsperioder);
      trigger("medlemskapsperioder")
        .then(async (isValid) => {
          if (isValid && bestemmelse) {
            console.log("*** Lagrer perioder etter bestemmelse endring ***");
            const lagredePerioder = await lagreMedlemskapsperioder(
              oppdaterteMedlemskapsperioder,
              bestemmelse,
              lagredeMedlemskapsperioder,
            );
            console.log("*** Ferdig lagret etter bestemmelse endring ***", lagredePerioder);
            setLagredeMedlemskapsperioder(lagredePerioder);
            setValue("medlemskapsperioder", lagredePerioder);
          } else {
            console.log("Skipping save after bestemmelse change - invalid or no bestemmelse", { isValid, bestemmelse });
          }
        })
        .catch((error) => {
          console.error("*** Feil under lagring etter bestemmelse endring: ***", error);
        })
        .finally(() => setEndrerBestemmelse(false));
    },
    [trigger, lagreMedlemskapsperioder, bestemmelse, setValue, lagredeMedlemskapsperioder],
  );

  const leggTilDefaultMedlemskapsperiode = () => {
    medlemskapsperioderAppend(
      DEFAULT_MEDLEMSKAPSPERIODE as FieldArrayWithId<AarsavregningFormValuesProps, "medlemskapsperioder", "id">,
    );
  };

  const slettMedlemskapsperiode = async (index: number) => {
    setMedlemskapFeilmelding(undefined);
    const periodeSomSlettes = medlemskapsperioder[index];
    console.log(`*** Starter sletting av periode index ${index} ***`, periodeSomSlettes);
    try {
      await slettMedlemskapsperiodeFn(index, medlemskapsperioder, medlemskapsperioderRemove);
      const oppdatertListe = getValues("medlemskapsperioder") as Medlemskapsperiode[];
      console.log(`*** Periode index ${index} fjernet, oppdaterer lagredeMedlemskapsperioder ***`, oppdatertListe);
      setLagredeMedlemskapsperioder(oppdatertListe);
      console.log(`*** Sletting av periode index ${index} fullført ***`);
    } catch (error) {
      console.error("Feil fanget i slettMedlemskapsperiode wrapper", error);
    }
  };

  const debouncedOppdaterTotaltForskuddsvisFakturert = useCallback(
    Utils._debounce(
      (belop: number | undefined) =>
        handleOppdaterTotaltForskuddsvisFakturert(
          behandlingID,
          { avregning: { tidligereFakturertBeloepAvgiftssystem: belop } },
          aarsavregningID != null ? Number(aarsavregningID) : undefined,
        ).catch((error) => {
          console.error("Feil ved oppdatering av totaltForskuddsvisFakturert", error);
          setHovedFeilmelding("Kunne ikke lagre tidligere fakturert beløp.");
        }),
      350,
    ),
    [aarsavregningID, behandlingID, handleOppdaterTotaltForskuddsvisFakturert, setHovedFeilmelding],
  );

  // --- Call extracted calculation trigger hook (Renamed) ---
  useBeregningTrigger({
    skatteforholdsperioder,
    inntektskilder,
    lagreMedlemskapsperioderPaagar,
    endrerBestemmelse,
    totaltForskuddsvisFakturert: totaltForskuddsvisFakturert != null ? Number(totaltForskuddsvisFakturert) : undefined,
    redigerbart,
    aarsavregningID: aarsavregningID != null ? Number(aarsavregningID) : undefined,
    beregningPaagar,
    trigger,
    getValues,
    validerForm,
    setArrayValideringsfeil,
    finnMedlemskapsperiode,
    medlemskapstypeErPliktig,
    debouncedBeregningRef,
    setDebouncedBeregningPagaar,
    previousFormState: forrigeSkjemadataTilBeregning,
  });

  // Ref to store the previous validity status communicated to the parent
  const previousIsStegGyldigRef = useRef<boolean | undefined>(undefined);

  // --- Effect to update status based on combined error state ---
  useEffect(() => {
    const isStegGyldig = stegErGyldig(formIsValid, aarsavregningResponse, aktivFeilmeldingForStatus);
    if (isStegGyldig !== previousIsStegGyldigRef.current) {
      console.log("Calling oppdaterStatus (Value Changed):", { isStegGyldig });
      oppdaterStatus(isStegGyldig);
      previousIsStegGyldigRef.current = isStegGyldig; // Update the ref after calling
    } else {
      // Optional log for when the effect runs but status doesn't change
      console.log("Skipping oppdaterStatus (Value Unchanged):", { isStegGyldig });
    }
  }, [formIsValid, aarsavregningResponse, aktivFeilmeldingForStatus, oppdaterStatus, stegErGyldig]);

  // --- Effect to update totalavgift ---
  useEffect(() => {
    if (redigerbart && aarsavregningResponse?.nyttGrunnlag) {
      if (aarsavregningResponse.nyttGrunnlag?.avgift.totalAvgift !== aarsavregningResponse.avregning?.nyttTotalbeloep) {
        if (aarsavregningID != null) {
          Api.Aarsavregning.oppdaterTotalAvgift(
            behandlingID,
            Number(aarsavregningID),
            aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift,
          ).then((response: AarsavregningResponse) => {
            setAarsavregningResponse(response);
          });
        } else {
          console.error("Kan ikke oppdatere totalAvgift: aarsavregningID mangler.");
        }
      }
    }
  }, [
    aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift,
    aarsavregningResponse?.avregning?.nyttTotalbeloep,
    redigerbart,
    behandlingID,
    aarsavregningID,
  ]);

  // --- Call extracted medlemskap saving trigger hook (Renamed) ---
  useMedlemskapLagringTrigger({
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
  });

  // --- Effect to handle forskuddsvis fakturert change ---
  useEffect(() => {
    if (
      redigerbart &&
      forrigeTotaltForskuddsvisFakturert.current !== totaltForskuddsvisFakturert &&
      (totaltForskuddsvisFakturert != null ? Number(totaltForskuddsvisFakturert) : undefined) !==
        aarsavregningResponse?.avregning?.tidligereFakturertBeloepAvgiftssystem
    ) {
      setHovedFeilmelding(undefined);
      const belop = totaltForskuddsvisFakturert != null ? Number(totaltForskuddsvisFakturert) : undefined;
      debouncedOppdaterTotaltForskuddsvisFakturert(belop);
    }
    forrigeTotaltForskuddsvisFakturert.current = totaltForskuddsvisFakturert;
  }, [
    totaltForskuddsvisFakturert,
    redigerbart,
    aarsavregningResponse,
    debouncedOppdaterTotaltForskuddsvisFakturert,
    setHovedFeilmelding,
  ]);

  // --- Handle confirm click (Simplified version closer to original) ---
  const bekreftOnClick = () => {
    // Clear errors optimistically
    setHovedFeilmelding(undefined);
    setArrayValideringsfeil(undefined);
    setMedlemskapFeilmelding(undefined);

    // Trigger validation but don't wait for the promise here
    // RHF state (formIsValid) and custom validation states should update via watches/effects
    trigger();

    // Log current state relevant to the check
    console.log("Bekreft Pre-Check:", {
      formIsValid, // From RHF state
      hasNyttGrunnlag: !!aarsavregningResponse?.nyttGrunnlag,
      aktivFeilmeldingForStatus, // Combined error state
      beregningPaagar,
      lagreMedlemskapsperioderPaagar,
    });

    // Check validity based on current state, closer to original logic
    // Note: We use the combined error state `aktivFeilmeldingForStatus` instead of the single original `feilmelding`
    // And we add the lagreMedlemskapsperioderPaagar check
    if (
      formIsValid &&
      aarsavregningResponse?.nyttGrunnlag &&
      !aktivFeilmeldingForStatus && // Check if any relevant error exists
      !beregningPaagar &&
      !lagreMedlemskapsperioderPaagar
    ) {
      console.log("Bekreft (Simplified Check): Calling bekreft()");
      bekreft();
    } else {
      console.warn("Bekreft (Simplified Check): Aborted", {
        formIsValid,
        hasNyttGrunnlag: !!aarsavregningResponse?.nyttGrunnlag,
        hasError: !!aktivFeilmeldingForStatus,
        aktivFeilmelding: aktivFeilmeldingForStatus,
        beregningPaagar,
        lagreMedlemskapsperioderPaagar,
      });
    }
  };

  // Computed values for rendering
  const trygdeAvgiftSkalIkkeBetalesTilNav =
    medlemskapstypeErPliktig && erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder);
  const forskuddsvisFakturertTrygdeavgift =
    (aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift?.totalAvgift ?? 0) > 0;
  const skjemaErRedigerbart = redigerbart && !endrerBestemmelse;

  return {
    hovedFeilmelding,
    medlemskapFeilmelding,
    arrayValideringsfeil,
    setHovedFeilmelding,
    beregningPaagar,
    aarsavregningResponse,
    trygdedekninger,
    setTrygdedekninger,
    endrerBestemmelse,
    setEndrerBestemmelse,
    debouncedBeregningPagaar,
    lagreMedlemskapsperioderPaagar,
    control,
    formValues,
    formIsValid,
    errors,
    setValue,
    getValues,
    medlemskapsperioderFields,
    skattFields,
    inntektFields,
    skattAppend,
    skattRemove,
    inntektAppend,
    inntektRemove,
    inntektUpdate,
    leggTilDefaultMedlemskapsperiode,
    slettMedlemskapsperiode,
    bekreftOnClick,
    lagreMedlemskapsperioderEtterBestemmelseEndringHvisGyldig,
    medlemskapsperiode,
    medlemskapstypeErPliktig,
    trygdeAvgiftSkalIkkeBetalesTilNav,
    forskuddsvisFakturertTrygdeavgift,
    skjemaErRedigerbart,
    redigerbart,
    behandlingID,
    aarsavregningID: aarsavregningID != null ? Number(aarsavregningID) : undefined,
  };
}
