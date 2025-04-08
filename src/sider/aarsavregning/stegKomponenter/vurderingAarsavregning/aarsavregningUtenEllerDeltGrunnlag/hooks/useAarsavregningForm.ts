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
  // State håndtert av denne hooken
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(
    initiellData.aarsavregningResponse,
  );
  const [trygdedekninger, setTrygdedekninger] = useState<string[]>(initiellData.trygdedekninger || []);
  const [endrerBestemmelse, setEndrerBestemmelse] = useState(false);
  const [lagredeMedlemskapsperioder, setLagredeMedlemskapsperioder] = useState<Medlemskapsperiode[]>(
    initiellData.formDefaultValues.medlemskapsperioder || [],
  );
  const [hovedFeilmelding, setHovedFeilmelding] = useState<string | undefined>(undefined);
  // State håndtert av useDebouncedBeregning: beregningPaagar, debouncedBeregningPagaar, forrigeSkjemadataTilBeregning

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

  // Sett opp skjema
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

  // Felt-arrayer
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

  // Skjemafelt-watches
  const formValues = watch();
  const bestemmelse = useWatch({ control, name: "bestemmelse" });
  const medlemskapsperioder = useWatch({ control, name: "medlemskapsperioder" });
  const totaltForskuddsvisFakturert = useWatch({ control, name: "totaltForskuddsvisFakturert" });
  const skatteforholdsperioder = useWatch({ control, name: "skatteforholdsperioder" });
  const inntektskilder = useWatch({ control, name: "inntektskilder" });

  // Refs
  const forrigeTotaltForskuddsvisFakturert = useRef(totaltForskuddsvisFakturert);

  // Avledet state
  const medlemskapstypeErPliktig = useMemo(() => {
    return medlemskapsperioder
      .filter((periode: Medlemskapsperiode) => periode.id !== DEFAULT_MEDLEMSKAPSPERIODE.id)
      .every((periode: Medlemskapsperiode) => periode.medlemskapstype === "PLIKTIG");
  }, [medlemskapsperioder]);

  const medlemskapsperiode = useMemo(() => {
    return finnMedlemskapsperiode(medlemskapsperioder);
  }, [medlemskapsperioder, finnMedlemskapsperiode]);

  // Rekalkuler kombinert feilmelding
  const aktivFeilmeldingForStatus = useMemo(
    () => hovedFeilmelding || medlemskapFeilmelding || arrayValideringsfeil,
    [hovedFeilmelding, medlemskapFeilmelding, arrayValideringsfeil],
  );

  // Integrer Debounced Beregning Hook (Omdøpt)
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

  // Handlere
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

  // Kall uthentet beregningstrigger-hook (Omdøpt)
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

  // Ref for å lagre forrige gyldighetsstatus kommunisert til forelder
  const previousIsStegGyldigRef = useRef<boolean | undefined>(undefined);

  // Effekt for å oppdatere status basert på kombinert feil-state
  useEffect(() => {
    const isStegGyldig = stegErGyldig(formIsValid, aarsavregningResponse, aktivFeilmeldingForStatus);
    // Kall kun oppdaterStatus hvis verdien faktisk har endret seg
    if (isStegGyldig !== previousIsStegGyldigRef.current) {
      console.log("Calling oppdaterStatus (Value Changed):", { isStegGyldig });
      oppdaterStatus(isStegGyldig);
      // Oppdater ref etter kall
      previousIsStegGyldigRef.current = isStegGyldig;
    } else {
      // Valgfri logg for når effekt kjører men status ikke endres
      console.log("Skipping oppdaterStatus (Value Unchanged):", { isStegGyldig });
    }
  }, [formIsValid, aarsavregningResponse, aktivFeilmeldingForStatus, oppdaterStatus, stegErGyldig]);

  // Effekt for å oppdatere totalavgift
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

  // Kall uthentet medlemskapslagringstrigger-hook (Omdøpt)
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

  // Effekt for å håndtere endring i forskuddsvis fakturert
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

  // Håndter bekreft-klikk (Forenklet versjon nærmere original)
  const bekreftOnClick = () => {
    // Fjern feil optimistisk
    setHovedFeilmelding(undefined);
    setArrayValideringsfeil(undefined);
    setMedlemskapFeilmelding(undefined);

    // Trigger validering men ikke vent på promise her
    // RHF state (formIsValid) og custom validerings-states bør oppdateres via watches/effekter
    trigger();

    // Logg nåværende state relevant for sjekken
    console.log("Bekreft Pre-Check:", {
      formIsValid, // Fra RHF state
      hasNyttGrunnlag: !!aarsavregningResponse?.nyttGrunnlag,
      aktivFeilmeldingForStatus, // Kombinert feil-state
      beregningPaagar,
      lagreMedlemskapsperioderPaagar,
    });

    // Sjekk gyldighet basert på nåværende state, nærmere original logikk
    // Merk: Vi bruker den kombinerte feil-staten `aktivFeilmeldingForStatus` istedenfor den originale enkle `feilmelding`
    // Og vi legger til sjekken for lagreMedlemskapsperioderPaagar
    if (
      formIsValid &&
      aarsavregningResponse?.nyttGrunnlag &&
      !aktivFeilmeldingForStatus && // Sjekk om noen relevante feil eksisterer
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

  // Beregnet verdier for rendering
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
