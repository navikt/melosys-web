/* eslint-disable max-lines */
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FieldValue, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import { medlemskapsperioderOperations } from "../../../../../ducks/medlemskapsperioder";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilde, Skatteforhold } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { useDispatch } from "../../../../../hooks";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Api from "../../../../../services/api";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import {
  Avgiftspliktigperiode,
  hasInnvilgelsesResultat,
  OppdaterMedlemskapsperiode,
} from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import * as Utils from "../../../../../utils";
import { Aarsavregningsmeldinger } from "../komponenter/aarsavregningsmeldinger";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import BestemmelseSelect from "../komponenter/bestemmelseSelect";
import { BorderedFormContainer } from "../komponenter/borderedFormContainer";
import { EndeligAvgiftValgRadioGroup } from "../komponenter/endeligAvgiftValgRadioGroup";
import { ManuellAvgiftFormPart } from "../komponenter/manuellAvgiftFormPart";
import { MedlemskapsperiodeSkjema } from "../komponenter/medlemskapsperiodeSkjema";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import { TrygdeavgiftFraAvgiftssystemetInput } from "../komponenter/trygdeavgiftFraAvgiftssystemetInput";
import {
  beregnTrygdeavgiftsperioder,
  erBrukerSkattepliktigIHelePerioden,
  hentMedlemskapsFomTomDato,
  validateAarsavregningUtenEllerDeltGrunnlag,
} from "../utils";
import {
  AarsavregningFormValuesProps,
  DEFAULT_MEDLEMSKAPSPERIODE,
  ULAGRET_MEDLEMSKAPSPERIODE_ID,
} from "./aarsavregningUtenEllerDeltGrunnlag";
import aarsavregningUtenEllerDeltGrunnlagSchema from "./aarsavregningUtenEllerDeltGrunnlagSchema";
import { Feilmelding, finnAktivFeilmelding, finnAktivFeilmeldingForMedlemskapsperioder } from "./valideringsfeil";

const { OPPLYSNINGER_ENDRET, MANUELL_ENDELIG_AVGIFT } = MKV.Koder.endeligAvgiftValg;

const LOGS_ENABLED = false; // Sett til true hvis du ønsker logging på useEffects etc.

const consoleLog = (message: string, ...args: unknown[]) => {
  if (!LOGS_ENABLED) return;
  if (args.length === 0) {
    // eslint-disable-next-line no-console
    console.log(`[AarsavregningUtenEllerDeltGrunnlagForm] ${message}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`[AarsavregningUtenEllerDeltGrunnlagForm] ${message}`, ...args);
  }
};

// Hjelpefunksjon for å logge og returnere endrede avhengigheter
const getChangedDependencies = (
  currentDeps: Record<string, unknown>,
  previousDepsRef: React.MutableRefObject<Record<string, unknown> | null>,
  consoleLogCallback: (message: string, ...args: unknown[]) => void,
) => {
  const changedDeps: Record<string, { prev: unknown; curr: unknown }> = {};
  if (previousDepsRef.current) {
    // Sammenlign nåværende avhengigheter med tidligere
    Object.keys(currentDeps).forEach((key) => {
      if (
        previousDepsRef.current &&
        !Utils._isEqual(currentDeps[key as keyof typeof currentDeps], previousDepsRef.current[key])
      ) {
        changedDeps[key] = {
          prev: previousDepsRef.current[key],
          curr: currentDeps[key as keyof typeof currentDeps],
        };
      }
    });
    // Logg kun hvis det er endrede avhengigheter
    if (Object.keys(changedDeps).length > 0) {
      consoleLogCallback("[getChangedDependencies] Endrede avhengigheter", changedDeps);
    } else {
      consoleLogCallback("[getChangedDependencies] Ingen endrede avhengigheter?!");
    }
  } else {
    // Logg alle avhengigheter ved første kjøring
    consoleLogCallback("[getChangedDependencies] Første kjøring avhengigheter", currentDeps);
  }

  // Oppdater forrige avhengigheter ref
  previousDepsRef.current = currentDeps;
  return changedDeps; // Returner de endrede avhengighetene
};

export function AarsavregningUtenEllerDeltGrunnlagForm({
  initiellData,
  bekreft,
  oppdaterStatus,
  harTrygdeavgiftFraAvgiftssystemet,
  harTidligereTrygdeavgiftsgrunnlag,
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
  harTrygdeavgiftFraAvgiftssystemet: boolean;
  harTidligereTrygdeavgiftsgrunnlag: boolean;
}) {
  const [feilmelding, setFeilmelding] = useState<string | string[] | undefined>(undefined);
  const [beregningPaagar, setBeregningPaagar] = useState(false);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(
    initiellData.aarsavregningResponse,
  );
  const [previousFormState, setPreviousFormState] = useState<ReturnType<typeof mapFormState> | null>(null);
  const [debouncedBeregningPagaar, setDebouncedBeregningPagaar] = useState(false);
  const [arrayValideringsfeil, setArrayValideringsfeil] = useState<string | undefined>(undefined);

  const [trygdedekninger, setTrygdedekninger] = useState<string[]>(initiellData.trygdedekninger || []);
  const [endrerBestemmelse, setEndrerBestemmelse] = useState(false);
  const [lagreMedlemskapsperioderPaagar, setLagreMedlemskapsperioderPaagar] = useState(false);
  const [lagredeMedlemskapsperioder, setLagredeMedlemskapsperioder] = useState<Avgiftspliktigperiode[]>(
    initiellData.formDefaultValues.medlemskapsperioder || [],
  );

  // Redux selectors
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as number;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);
  const dispatch = useDispatch();

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
      harTrygdeavgiftFraAvgiftssystemet,
    },
    mode: "onChange",
    defaultValues: initiellData.formDefaultValues,
  });

  const {
    fields: medlemskapsperioderFields,
    append: medlemskapsperioderAppend,
    remove: medlemskapsperioderRemove,
  } = useFieldArray({ control, name: "medlemskapsperioder" });

  const {
    fields: skattFields,
    append: skattAppend,
    remove: skattRemove,
  } = useFieldArray({ control, name: "skatteforholdsperioder" });

  const {
    fields: inntektFields,
    append: inntektAppend,
    remove: inntektRemove,
    update: inntektUpdate,
  } = useFieldArray({ control, name: "inntektskilder" });

  const formValues = watch();
  const bestemmelse = useWatch({ control, name: "bestemmelse" });
  const medlemskapsperioder = useWatch({ control, name: "medlemskapsperioder" });
  const medlemskapsperioderForrigeAntall = useRef(medlemskapsperioder.length);
  const trygdeavgiftFraAvgiftssystemet = useWatch({ control, name: "trygdeavgiftFraAvgiftssystemet" });
  const skatteforholdsperioder = useWatch({ control, name: "skatteforholdsperioder" });
  const inntektskilder = useWatch({ control, name: "inntektskilder" });
  const endeligAvgiftValg = useWatch({ control, name: "endeligAvgiftValg" });
  const manueltAvgiftBeloep = useWatch({ control, name: "manueltAvgiftBeloep" });

  const debouncedBeregningRef = useRef<ReturnType<typeof Utils._debounce> | null>(null);
  const forrigetrygdeavgiftFraAvgiftssystemet = useRef(trygdeavgiftFraAvgiftssystemet);
  const previousDepsRef = useRef<Record<string, unknown> | null>(null);

  const medlemskapstypeErPliktig = useMemo(() => {
    return medlemskapsperioder
      .filter((periode: Avgiftspliktigperiode) => periode.id !== ULAGRET_MEDLEMSKAPSPERIODE_ID)
      .every(
        (periode: Avgiftspliktigperiode) =>
          hasInnvilgelsesResultat(periode) && periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG,
      );
  }, [medlemskapsperioder]);

  const erDeltGrunnlag =
    harTrygdeavgiftFraAvgiftssystemet &&
    !!initiellData.aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger;

  const harLaasteMedlemskapsperioder =
    !!initiellData.aarsavregningResponse?.sisteGjeldendeAvgiftspliktigperioder &&
    initiellData.aarsavregningResponse.sisteGjeldendeAvgiftspliktigperioder.length > 0;

  const finnMedlemskapsperiode = useCallback((perioder: Avgiftspliktigperiode[]) => {
    const sorterteGyldigePerioder = perioder
      .filter((periode: Avgiftspliktigperiode) => periode.fomDato && periode.tomDato)
      .sort(Utils.dato.sorterEtterNorskFomDato);
    const medlemskapsperiodeFomTom = hentMedlemskapsFomTomDato(sorterteGyldigePerioder);

    consoleLog("[finnMedlemskapsperiode] medlemskapsperiodeFomTom", medlemskapsperiodeFomTom);
    consoleLog("[finnMedlemskapsperiode] sorterteGyldigePerioder", sorterteGyldigePerioder);
    consoleLog("[finnMedlemskapsperiode] perioder", perioder);

    return {
      fomDato: Utils.dato.vaskOgFormatterDatoTilNorsk(medlemskapsperiodeFomTom?.fom),
      tomDato: Utils.dato.vaskOgFormatterDatoTilNorsk(medlemskapsperiodeFomTom?.tom),
    };
  }, []);

  const medlemskapsperiode = useMemo(() => {
    return finnMedlemskapsperiode(medlemskapsperioder);
  }, [medlemskapsperioder, finnMedlemskapsperiode]);

  const mapFormState = (
    skatteforholdsperioderFormState: Skatteforhold[],
    inntektskilderFormState: Inntektskilde[],
    medlemskapsperioderFormState: Avgiftspliktigperiode[],
    trygdeavgiftFraAvgiftssystemetParam: number | undefined,
    endeligAvgiftValgFormState: string | undefined,
    bestemmelseFormState: string | undefined,
  ) => ({
    skatteforholdsperioder: skatteforholdsperioderFormState.map((skatteforhold: Skatteforhold) => ({
      fomDato: skatteforhold.fomDato,
      tomDato: skatteforhold.tomDato,
      skatteplikttype: skatteforhold.skatteplikttype,
    })),
    inntektskilder: inntektskilderFormState.map((inntektskilde: Inntektskilde) => ({
      fomDato: inntektskilde.fomDato,
      tomDato: inntektskilde.tomDato,
      kildetype: inntektskilde.kildetype,
      bruttoInntekt: inntektskilde.bruttoInntekt,
      arbAvgBetales: inntektskilde.arbAvgBetales,
      erMaanedsbelop: inntektskilde.erMaanedsbelop,
    })),
    medlemskapsperioder: medlemskapsperioderFormState.map((periode: Avgiftspliktigperiode) => ({
      fomDato: periode.fomDato,
      tomDato: periode.tomDato,
      trygdedekning: hasInnvilgelsesResultat(periode) ? periode.trygdedekning : undefined,
      medlemskapstype: hasInnvilgelsesResultat(periode) ? periode.medlemskapstype : undefined,
    })),
    trygdeavgiftFraAvgiftssystemet: trygdeavgiftFraAvgiftssystemetParam,
    endeligAvgiftValg: endeligAvgiftValgFormState,
    bestemmelse: bestemmelseFormState,
  });

  useEffect(() => {
    if (redigerbart && aarsavregningResponse?.nyttTrygdeavgiftsGrunnlag) {
      if (
        aarsavregningResponse.nyttTrygdeavgiftsGrunnlag?.avgift.totalAvgift !==
        aarsavregningResponse.avregning?.beregnetAvgiftBelop
      ) {
        Api.Aarsavregning.oppdaterBeregnetAvgiftBeloep(
          behandlingID,
          aarsavregningID,
          aarsavregningResponse?.nyttTrygdeavgiftsGrunnlag?.avgift.totalAvgift,
        ).then((response: AarsavregningResponse) => {
          setAarsavregningResponse(response);
        });
      }
    }
  }, [aarsavregningResponse?.nyttTrygdeavgiftsGrunnlag?.avgift.totalAvgift]);

  const lagreMedlemskapsperiodeHvisEndret = async (
    periode: Avgiftspliktigperiode,
    lagredePerioder: Avgiftspliktigperiode[],
    index: number,
  ) => {
    // Only MEDLEMSKAPSPERIODE and LOVVALGSPERIODE have trygdedekning
    if (!hasInnvilgelsesResultat(periode)) {
      throw new Error(`Cannot save periode of type ${periode.type}`);
    }

    const periodeRequest = {
      fomDato: Utils.dato.vaskOgFormatterTilISO(periode.fomDato, "") as string,
      tomDato: Utils.dato.vaskOgFormatterTilISO(periode.tomDato, "") as string,
      trygdedekning: periode.trygdedekning,
      bestemmelse: getValues("bestemmelse"),
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
    } as OppdaterMedlemskapsperiode;

    const lagretMedlemskapsperiode = lagredePerioder[index];
    const harEndringer =
      !lagretMedlemskapsperiode ||
      periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID ||
      periode.fomDato !== lagretMedlemskapsperiode.fomDato ||
      periode.tomDato !== lagretMedlemskapsperiode.tomDato ||
      (hasInnvilgelsesResultat(lagretMedlemskapsperiode) &&
        periode.trygdedekning !== lagretMedlemskapsperiode.trygdedekning);

    if (harEndringer) {
      try {
        return await (periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID
          ? Api.MedlemAvFolketrygden.Medlemskapsperioder.opprettMedlemskapsperioder(behandlingID, periodeRequest)
          : Api.MedlemAvFolketrygden.Medlemskapsperioder.oppdaterMedlemskapsperioder(
              behandlingID,
              periode.id,
              periodeRequest,
            ));
      } catch (error) {
        setFeilmelding("Feil ved lagring av medlemskapsperiode");
        /* eslint-disable-next-line no-console */
        console.error("Feil ved lagring av medlemskapsperiode:", error);
        return undefined;
      }
    }

    return undefined;
  };

  const handleBeregnTrygdeavgiftsperioder = useCallback(
    async (formVerdier: FieldValue<AarsavregningFormValuesProps>) => {
      setBeregningPaagar(true);
      await beregnTrygdeavgiftsperioder(formVerdier, {
        behandlingID,
        medlemskapstypeErPliktig,
        setFeilmelding,
        setAarsavregningResponse,
      });
      setBeregningPaagar(false);
    },
    [medlemskapstypeErPliktig, setFeilmelding, setAarsavregningResponse],
  );

  const debouncedBeregning = useCallback(() => {
    consoleLog("[debouncedBeregning] setter debouncedBeregningPagaar til false");
    setDebouncedBeregningPagaar(false);
    if (
      !redigerbart ||
      !aarsavregningID ||
      endrerBestemmelse ||
      beregningPaagar ||
      lagreMedlemskapsperioderPaagar ||
      endeligAvgiftValg !== OPPLYSNINGER_ENDRET
    ) {
      consoleLog("[debouncedBeregning] return tidlig i debouncedBeregning");
      return;
    }

    const medlemskapsperioderFormState = getValues("medlemskapsperioder");
    const formState = mapFormState(
      getValues("skatteforholdsperioder"),
      getValues("inntektskilder"),
      medlemskapsperioderFormState,
      getValues("trygdeavgiftFraAvgiftssystemet"),
      getValues("endeligAvgiftValg"),
      getValues("bestemmelse"),
    );
    const medlemskapsperiodeFomTom = finnMedlemskapsperiode(medlemskapsperioderFormState);

    consoleLog("[debouncedBeregning] medlemskapsperiodeFomTom", medlemskapsperiodeFomTom);

    if (!Utils._isEqual(formState, previousFormState)) {
      const aktivFeilmelding = finnAktivFeilmelding({
        skatteforholdsperioder: formState.skatteforholdsperioder,
        inntektskilder: formState.inntektskilder,
        medlemskapsperiodeFomTom,
        medlemskapsperioder: medlemskapsperioderFormState as Avgiftspliktigperiode[],
        medlemskapstypeErPliktig,
      });

      consoleLog("[debouncedBeregning] Aktive feilmeldinger", aktivFeilmelding, {
        skatteforholdsperioder: formState.skatteforholdsperioder,
        inntektskilder: formState.inntektskilder,
        medlemskapsperiodeFomTom,
        medlemskapsperioder: medlemskapsperioderFormState as Avgiftspliktigperiode[],
        medlemskapstypeErPliktig,
      });
      if (!aktivFeilmelding) {
        setArrayValideringsfeil(undefined);
        setBeregningPaagar(true);
        handleBeregnTrygdeavgiftsperioder(getValues())
          .then(() => {
            setPreviousFormState(formState);
          })
          .finally(() => {
            setBeregningPaagar(false);
          });
      } else {
        setArrayValideringsfeil(aktivFeilmelding);
      }
    }

    consoleLog("[debouncedBeregning] ferdig");
  }, [
    aarsavregningID,
    beregningPaagar,
    getValues,
    handleBeregnTrygdeavgiftsperioder,
    medlemskapstypeErPliktig,
    endrerBestemmelse,
    previousFormState,
    lagreMedlemskapsperioderPaagar,
    finnMedlemskapsperiode,
    endeligAvgiftValg,
  ]);

  const lagreMedlemskapsperioder = useCallback(
    async (medlemskapsperioderFormValues: Avgiftspliktigperiode[]) => {
      type LagredeMedlemskapsperioder = Avgiftspliktigperiode & {
        formValuesIndex: number;
      };

      const endredeMedlemskapsperioder: LagredeMedlemskapsperioder[] = [];
      for (const [index, periode] of medlemskapsperioderFormValues.entries()) {
        const lagretPeriode = await lagreMedlemskapsperiodeHvisEndret(periode, lagredeMedlemskapsperioder, index);
        if (lagretPeriode)
          endredeMedlemskapsperioder.push({
            ...(lagretPeriode as Avgiftspliktigperiode),
            formValuesIndex: index,
          });
      }

      if (endredeMedlemskapsperioder.length > 0) {
        setFeilmelding(undefined);
        setArrayValideringsfeil(undefined);

        const oppdaterteMedlemskapsperioder = medlemskapsperioderFormValues.map((periode, index: number) => {
          const lagretPeriodeMedID = endredeMedlemskapsperioder.find(
            (backendPeriode) => backendPeriode.formValuesIndex === index,
          );
          if (lagretPeriodeMedID) {
            // lagretPeriodeMedID is guaranteed to be MEDLEMSKAPSPERIODE or LOVVALGSPERIODE from lagreMedlemskapsperiodeHvisEndret
            return {
              ...periode,
              medlemskapstype: hasInnvilgelsesResultat(lagretPeriodeMedID)
                ? lagretPeriodeMedID.medlemskapstype
                : hasInnvilgelsesResultat(periode)
                  ? periode.medlemskapstype
                  : "",
              id: lagretPeriodeMedID.id,
            };
          }
          return periode;
        });

        consoleLog("[lagreMedlemskapsperioder] oppdaterteMedlemskapsperioder", oppdaterteMedlemskapsperioder);

        setLagredeMedlemskapsperioder(oppdaterteMedlemskapsperioder);
        setValue("medlemskapsperioder", oppdaterteMedlemskapsperioder);
      }
    },
    [setValue, setLagredeMedlemskapsperioder, lagredeMedlemskapsperioder],
  );

  const debouncedLagreMedlemskapsperioder = useCallback(
    Utils._debounce((medlemskapsperioderFormValues: Avgiftspliktigperiode[], callbackEtterLagring: () => void) => {
      lagreMedlemskapsperioder(medlemskapsperioderFormValues).finally(() => {
        if (callbackEtterLagring) callbackEtterLagring();
      });
    }, 350),
    [lagreMedlemskapsperioder],
  );

  const medlemskapsperioderHarBrukerendringer = (
    medlemskapsperioderNå: Avgiftspliktigperiode[],
    medlemskapsperioderTidlgere: Avgiftspliktigperiode[],
  ) => {
    const nåværendeListeMedRelevanteFelter = medlemskapsperioderNå.map((periode) => ({
      fomDato: periode.fomDato,
      tomDato: periode.tomDato,
      trygdedekning: hasInnvilgelsesResultat(periode) ? periode.trygdedekning : undefined,
    }));

    const forrigeListeMedRelevanteFelter = medlemskapsperioderTidlgere.map((periode) => ({
      fomDato: periode.fomDato,
      tomDato: periode.tomDato,
      trygdedekning: hasInnvilgelsesResultat(periode) ? periode.trygdedekning : undefined,
    }));

    type PeriodeComparison = {
      fomDato: string;
      tomDato: string;
      trygdedekning?: string;
    };

    const sorterEtterFomDato = (a: PeriodeComparison, b: PeriodeComparison) => {
      if (!a.fomDato || !b.fomDato) return 0;
      return a.fomDato.localeCompare(b.fomDato);
    };

    return !Utils._isEqual(
      nåværendeListeMedRelevanteFelter.sort(sorterEtterFomDato),
      forrigeListeMedRelevanteFelter.sort(sorterEtterFomDato),
    );
  };

  useEffect(() => {
    const lagreMedlemskapsperioderEffect = async () => {
      if (redigerbart && !endrerBestemmelse && !lagreMedlemskapsperioderPaagar) {
        if (medlemskapsperioder.length !== medlemskapsperioderForrigeAntall.current) {
          // Når vi kommer inn her, betyr det at bruker har trykket på "Legg til"-knappen, som automtisk gjør skjema invalid.
          medlemskapsperioderForrigeAntall.current = medlemskapsperioder.length;
          setArrayValideringsfeil(undefined);
          return;
        }
        if (!medlemskapsperioderHarBrukerendringer(medlemskapsperioder, lagredeMedlemskapsperioder)) {
          return;
        }

        const context = {
          aar: initiellData.valgtÅr,
          harTrygdeavgiftFraAvgiftssystemet,
        };
        const { isValid: erGyldigSkjema } = await validateAarsavregningUtenEllerDeltGrunnlag(
          getValues(),
          context,
          "medlemskapsperioder",
        );
        if (!erGyldigSkjema || !bestemmelse) {
          return;
        }

        const aktivFeilmeldingForMedlemskapsperioder = finnAktivFeilmeldingForMedlemskapsperioder(medlemskapsperioder);
        if (aktivFeilmeldingForMedlemskapsperioder) {
          setArrayValideringsfeil(aktivFeilmeldingForMedlemskapsperioder);
          return;
        }

        consoleLog("[lagreMedlemskapsperioderEffect] setter lagrerMedlemskapsperioder til true");
        setLagreMedlemskapsperioderPaagar(true);
        const medlemskapsperioderTilLagring = [...medlemskapsperioder];
        consoleLog("[lagreMedlemskapsperioderEffect] medlemskapsperioderTilLagring", medlemskapsperioderTilLagring);
        debouncedLagreMedlemskapsperioder(medlemskapsperioderTilLagring, () => {
          consoleLog("[lagreMedlemskapsperioderEffect] Setter lagrerMedlemskapsperioder til false");
          setLagreMedlemskapsperioderPaagar(false);
        });
      }
    };

    lagreMedlemskapsperioderEffect();
  }, [medlemskapsperioder, redigerbart, endrerBestemmelse, bestemmelse]);

  const lagreMedlemskapsperioderEtterBestemmelseEndringHvisGyldig = useCallback(
    (oppdaterteMedlemskapsperioder: Avgiftspliktigperiode[]) => {
      setLagredeMedlemskapsperioder(oppdaterteMedlemskapsperioder);

      const completeFormData = {
        ...getValues(),
        medlemskapsperioder: oppdaterteMedlemskapsperioder,
      };
      const context = {
        aar: initiellData.valgtÅr,
        harTrygdeavgiftFraAvgiftssystemet,
      };
      validateAarsavregningUtenEllerDeltGrunnlag(completeFormData, context, "medlemskapsperioder")
        .then(async ({ isValid }) => {
          if (isValid) {
            await lagreMedlemskapsperioder(oppdaterteMedlemskapsperioder);
          }
        })
        .finally(() => setEndrerBestemmelse(false));
    },
    [lagreMedlemskapsperioder, setLagredeMedlemskapsperioder],
  );

  const leggTilDefaultMedlemskapsperiode = () => {
    medlemskapsperioderAppend(DEFAULT_MEDLEMSKAPSPERIODE);
  };

  const slettMedlemskapsperiode = async (index: number) => {
    const periode = medlemskapsperioder[index];

    try {
      setLagreMedlemskapsperioderPaagar(true);
      if (periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID) {
        medlemskapsperioderRemove(index);
      } else {
        await Api.MedlemAvFolketrygden.Medlemskapsperioder.slettMedlemskapsperiode(behandlingID, periode.id);
        medlemskapsperioderRemove(index);
        dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
      }
      setLagreMedlemskapsperioderPaagar(false);
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error("Feil ved sletting av medlemskapsperiode:", error);
      setFeilmelding("Feil ved sletting av medlemskapsperiode");
    }
  };

  const handleOppdatertrygdeavgiftFraAvgiftssystemet = async (
    behandlingid: number,
    request: Api.Aarsavregning.AarsavregningRequest,
    aarsavregningid?: number,
  ) => {
    setFeilmelding(undefined);
    await Api.Aarsavregning.oppdaterAarsavregning(behandlingid, request, aarsavregningid)
      .then(setAarsavregningResponse)
      .catch(() => {
        setFeilmelding("Feil ved oppdatering av tidligere fakturert trygdeavgift i avgiftssystemet");
      });
  };

  const debouncedOppdatertrygdeavgiftFraAvgiftssystemet = useCallback(
    Utils._debounce(
      (request: Api.Aarsavregning.AarsavregningRequest) =>
        handleOppdatertrygdeavgiftFraAvgiftssystemet(behandlingID, request, aarsavregningID),
      350,
    ),
    [aarsavregningID],
  );

  // TODO: Trenger vi useEffect? Kan vi ikke ha onchange handler?
  useEffect(() => {
    if (
      redigerbart &&
      forrigetrygdeavgiftFraAvgiftssystemet.current !== trygdeavgiftFraAvgiftssystemet &&
      trygdeavgiftFraAvgiftssystemet !== aarsavregningResponse?.avregning?.trygdeavgiftFraAvgiftssystemet
    ) {
      debouncedOppdatertrygdeavgiftFraAvgiftssystemet({
        avregning: {
          trygdeavgiftFraAvgiftssystemet,
        },
      });
    }

    forrigetrygdeavgiftFraAvgiftssystemet.current = trygdeavgiftFraAvgiftssystemet;
  }, [trygdeavgiftFraAvgiftssystemet]);

  // Lager en ny debounce funksjon når beregning callback endres
  useEffect(() => {
    setDebouncedBeregningPagaar(false);
    debouncedBeregningRef.current = Utils._debounce(debouncedBeregning, 600);

    consoleLog("[useEffect debouncedBeregning] Lager en ny debounce funksjon når beregning callback endres");

    // Cancel på unmount
    return () => {
      if (debouncedBeregningRef.current?.cancel) {
        setDebouncedBeregningPagaar(false);

        consoleLog(
          "[useEffect debouncedBeregning] Avbryter eventuelt eksisterende beregning for å sette opp ny debounce funksjon.",
        );
        debouncedBeregningRef.current.cancel();
      }
    };
  }, [debouncedBeregning]);

  // Håndterer kjøring av beregninger når skjemaverdier endres
  useEffect(() => {
    if (endeligAvgiftValg !== OPPLYSNINGER_ENDRET) {
      setDebouncedBeregningPagaar(false);
      setArrayValideringsfeil(undefined);
      if (debouncedBeregningRef.current?.cancel) {
        debouncedBeregningRef.current.cancel();
      }
      return;
    }

    const currentDeps = {
      skatteforholdsperioder,
      inntektskilder,
      formIsValid,
      lagreMedlemskapsperioderPaagar,
      endrerBestemmelse,
      trygdeavgiftFraAvgiftssystemet,
      endeligAvgiftValg,
      aarsavregningID,
      redigerbart,
      beregningPaagar,
      getValues,
      previousFormState,
      errors,
    };

    // Get the changed dependencies
    const changedDependencies = getChangedDependencies(currentDeps, previousDepsRef, consoleLog);
    const medlemskapsperiodeEndret = Object.keys(changedDependencies).includes("medlemskapsperiode");

    // Avbryter hvis vi allerede har en beregning som venter
    if (debouncedBeregningRef.current?.cancel && Object.keys(changedDependencies).length > 0) {
      setDebouncedBeregningPagaar(false);

      consoleLog("[useEffect hovedberegning] Avbryter eventuelt eksisterende beregning.", {
        beregningPaagar,
        lagreMedlemskapsperioderPaagar,
        debouncedBeregningPagaar,
      });
      debouncedBeregningRef.current.cancel();
    }

    if (medlemskapsperiodeEndret || Object.keys(changedDependencies).length === 0 || lagreMedlemskapsperioderPaagar) {
      consoleLog("[useEffect hovedberegning] Avbryter useEffect uten å gjøre noe.", {
        medlemskapsperiodeEndret,
        changedDependencies,
        lagreMedlemskapsperioderPaagar,
      });
      return;
    }

    if (debouncedBeregningRef.current) {
      const currentFormState = mapFormState(
        getValues("skatteforholdsperioder"),
        getValues("inntektskilder"),
        getValues("medlemskapsperioder"),
        getValues("trygdeavgiftFraAvgiftssystemet"),
        getValues("endeligAvgiftValg"),
        getValues("bestemmelse"),
      );

      if (!redigerbart || !aarsavregningID || endrerBestemmelse || beregningPaagar || lagreMedlemskapsperioderPaagar) {
        consoleLog(
          "[useEffect hovedberegning] return tidlig i fordi redigerbart, aarsavregningID, endrerBestemmelse, lagreMedlemskapsperioderPaagar",
          {
            redigerbart,
            aarsavregningID,
            endrerBestemmelse,
            lagreMedlemskapsperioderPaagar,
            beregningPaagar,
            debouncedBeregningPagaar,
          },
        );
        return;
      }

      if (!Utils._isEqual(currentFormState, previousFormState)) {
        const context = {
          aar: initiellData.valgtÅr,
          harTrygdeavgiftFraAvgiftssystemet,
        };
        validateAarsavregningUtenEllerDeltGrunnlag(currentFormState, context).then(({ isValid }) => {
          if (!isValid) {
            setArrayValideringsfeil(undefined);
            return;
          }
          setDebouncedBeregningPagaar(true);
          consoleLog("[useEffect hovedberegning] sette debouncedBeregningPaagar true");
          if (debouncedBeregningRef.current) {
            debouncedBeregningRef.current();
          }
        });
      } else {
        setArrayValideringsfeil(undefined);

        consoleLog("[useEffect hovedberegning] Clear arrayValideringsfeil", {
          currentFormState,
          previousFormState,
        });
      }
    } else {
      consoleLog("[useEffect hovedberegning] debouncedBeregningRef.current er undefined");
    }
  }, [
    skatteforholdsperioder,
    inntektskilder,
    formIsValid,
    lagreMedlemskapsperioderPaagar,
    endrerBestemmelse,
    trygdeavgiftFraAvgiftssystemet,
    endeligAvgiftValg,
    aarsavregningID,
    redigerbart,
    beregningPaagar,
    getValues,
    previousFormState,
    errors,
  ]);

  const stegErGyldig = useMemo(() => {
    if (endeligAvgiftValg === OPPLYSNINGER_ENDRET) {
      return Boolean(
        formIsValid &&
          aarsavregningResponse?.nyttTrygdeavgiftsGrunnlag &&
          feilmelding === undefined &&
          arrayValideringsfeil === undefined,
      );
    }
    if (endeligAvgiftValg === MANUELL_ENDELIG_AVGIFT) {
      return Boolean(formIsValid && feilmelding === undefined);
    }
    return false;
  }, [
    formIsValid,
    aarsavregningResponse?.nyttTrygdeavgiftsGrunnlag,
    feilmelding,
    endeligAvgiftValg,
    arrayValideringsfeil,
  ]);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig, oppdaterStatus]);

  // Denne gjør at første/initielle element i skatteforhold og inntektsperiode ferdigutfylles med medlemskapsperiode når medlemskapsperiode er satt
  useEffect(() => {
    if (medlemskapsperiode.fomDato && medlemskapsperiode.tomDato) {
      const initialSkatteforholdElement = skatteforholdsperioder[0];
      const initialInntektsPeriode = inntektskilder[0];

      if (!(initialSkatteforholdElement.fomDato && initialSkatteforholdElement.tomDato)) {
        skattRemove(0);
        skattAppend(medlemskapsperiode);
      }

      if (!(initialInntektsPeriode.fomDato && initialInntektsPeriode.tomDato)) {
        inntektRemove(0);
        inntektAppend(medlemskapsperiode);
      }
    }
  }, [medlemskapsperiode]);

  const handleEndeligAvgiftValgChange = useCallback(
    (value: string) => {
      setFeilmelding(undefined);
      Api.Aarsavregning.oppdaterEndeligAvgiftValg(behandlingID, value, aarsavregningID).then((res) => {
        if (res) {
          setAarsavregningResponse(res);
          if (value !== MANUELL_ENDELIG_AVGIFT) {
            setValue("manueltAvgiftBeloep", "", { shouldValidate: false, shouldDirty: false });
          }
          setPreviousFormState(null);
        }
      });
    },
    [aarsavregningID, behandlingID, setValue],
  );

  const debouncedOppdaterManueltAvgiftBeloep = useCallback(
    Utils._debounce(async (value: string) => {
      setFeilmelding(undefined);
      Api.Aarsavregning.oppdaterManueltAvgiftBeloep(behandlingID, aarsavregningID, Number(value))
        .then((res) => {
          setAarsavregningResponse(res);
        })
        .catch(() => {
          setFeilmelding("Feil ved oppdatering av manuelt avgift beløp");
        });
    }, 350),
    [aarsavregningID, behandlingID],
  );

  const håndterBekreft = () => {
    trigger();

    if (
      stegErGyldig &&
      !beregningPaagar &&
      !endrerBestemmelse &&
      !lagreMedlemskapsperioderPaagar &&
      !debouncedBeregningPagaar
    ) {
      bekreft();
    }
  };

  const trygdeAvgiftSkalIkkeBetalesTilNav =
    medlemskapstypeErPliktig && erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder);
  const skjemaErRedigerbart = redigerbart && !endrerBestemmelse && !beregningPaagar;

  const tidligereAarsavregningTrygdeavgiftFraAvgiftssystem =
    initiellData.aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger
      ?.tidligereTrygdeavgiftFraAvgiftssystemet;

  const tidligereAarsavregningErManueltBeregnet = Boolean(
    initiellData.aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger
      ?.tidligereÅrsavregningManueltAvgiftBeloep,
  );

  const minDate = initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 0, 1) : undefined;
  const maxDate =
    initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 11, 31, 23, 59, 59, 999) : undefined;

  return (
    <div className="vurderingAarsavregning">
      {harTrygdeavgiftFraAvgiftssystemet && (
        <TrygdeavgiftFraAvgiftssystemetInput
          control={control}
          redigerbart={skjemaErRedigerbart}
          erNyAarsavregning={Boolean(tidligereAarsavregningTrygdeavgiftFraAvgiftssystem)}
        />
      )}

      <EndeligAvgiftValgRadioGroup
        control={control}
        redigerbart={skjemaErRedigerbart}
        handleEndeligAvgiftValgChange={handleEndeligAvgiftValgChange}
        endeligAvgiftValg={endeligAvgiftValg}
      />

      {endeligAvgiftValg === OPPLYSNINGER_ENDRET && (
        <BorderedFormContainer>
          <Nav.Heading className="endelige_opplysninger_heading" level="2">
            Inntekts- og skatteopplysninger for endelig trygdeavgift
          </Nav.Heading>

          <BestemmelseSelect
            control={control}
            setValue={setValue}
            bestemmelser={initiellData.bestemmelser}
            behandlingID={behandlingID}
            redigerbart={skjemaErRedigerbart}
            setTrygdedekninger={setTrygdedekninger}
            setFeilmelding={setFeilmelding}
            setEndrerBestemmelse={setEndrerBestemmelse}
            lagreMedlemskapsperioderHvisGyldig={lagreMedlemskapsperioderEtterBestemmelseEndringHvisGyldig}
            harLaasteMedlemskapsperioder={harLaasteMedlemskapsperioder}
          />

          <div className="perioder">
            {medlemskapsperioderFields.map((field, index: number) => (
              <MedlemskapsperiodeSkjema
                key={field.id}
                redigerbart={skjemaErRedigerbart}
                control={control}
                field={field}
                index={index}
                remove={slettMedlemskapsperiode}
                formValues={formValues}
                handleLeggTil={leggTilDefaultMedlemskapsperiode}
                visLeggTil
                maxDate={maxDate}
                minDate={minDate}
                trygdedekninger={trygdedekninger}
                setValue={setValue}
                erDeltGrunnlag={erDeltGrunnlag}
              />
            ))}
          </div>

          <Skatteforholdsperioder
            defaultPeriode={medlemskapsperiode}
            formValues={formValues}
            redigerbart={skjemaErRedigerbart}
            remove={skattRemove}
            append={skattAppend}
            control={control}
            fields={skattFields}
            minDate={minDate}
            maxDate={maxDate}
          />
          {!trygdeAvgiftSkalIkkeBetalesTilNav && (
            <Inntektskilder
              defaultPeriode={medlemskapsperiode}
              formValues={formValues}
              redigerbart={skjemaErRedigerbart}
              update={inntektUpdate}
              remove={inntektRemove}
              append={inntektAppend}
              control={control}
              fields={inntektFields}
              medlemskapsTypeErPliktig={medlemskapstypeErPliktig}
              skalViseErMaanedsBelopRadioGroup
              bestemmelse={bestemmelse}
              minDate={minDate}
              maxDate={maxDate}
            />
          )}
          {formIsValid && trygdeAvgiftSkalIkkeBetalesTilNav && (
            <Aarsavregningsmeldinger.TrygdeavgiftSkalIkkeBetalesTilNav />
          )}

          {formIsValid &&
            !beregningPaagar &&
            !debouncedBeregningPagaar &&
            !feilmelding &&
            !arrayValideringsfeil &&
            !trygdeAvgiftSkalIkkeBetalesTilNav &&
            aarsavregningResponse?.nyttTrygdeavgiftsGrunnlag && (
              <Nav.ExpansionCard
                className="beregnetTrygdeavgiftDetaljer"
                aria-label="trygdeavgiftdetaljer"
                size="small"
              >
                <Nav.ExpansionCard.Header>
                  <Nav.ExpansionCard.Title size="small">Vis detaljert beregning</Nav.ExpansionCard.Title>
                </Nav.ExpansionCard.Header>
                <Nav.ExpansionCard.Content>
                  <BeregnetTrygdeavgiftDetaljer
                    grunnlag={aarsavregningResponse.nyttTrygdeavgiftsGrunnlag}
                    medlemskapsTypeErPliktig={medlemskapstypeErPliktig}
                  />
                </Nav.ExpansionCard.Content>
              </Nav.ExpansionCard>
            )}

          {arrayValideringsfeil && <Feilmelding type={arrayValideringsfeil} />}
        </BorderedFormContainer>
      )}

      {/* Show SumAarsavregningTabell below bordered container when data is available */}
      {formIsValid &&
        !beregningPaagar &&
        !debouncedBeregningPagaar &&
        !arrayValideringsfeil &&
        !feilmelding &&
        endeligAvgiftValg === OPPLYSNINGER_ENDRET && (
          <SumArsavregningTabell
            harGrunnlagIMelosys={harTidligereTrygdeavgiftsgrunnlag}
            nyTrygdeavgift={aarsavregningResponse?.avregning?.beregnetAvgiftBelop}
            tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
            tidligereTrygdeavgiftAvgiftssystem={aarsavregningResponse?.avregning?.trygdeavgiftFraAvgiftssystemet}
            tidligereAarsavregningTrygdeavgiftFraAvgiftssystem={tidligereAarsavregningTrygdeavgiftFraAvgiftssystem}
          />
        )}

      {endeligAvgiftValg === MANUELL_ENDELIG_AVGIFT && (
        <BorderedFormContainer>
          <ManuellAvgiftFormPart
            control={control}
            redigerbart={redigerbart}
            debouncedOppdaterManueltAvgiftBeloep={debouncedOppdaterManueltAvgiftBeloep}
            tidligereAarsavregningErManueltBeregnet={tidligereAarsavregningErManueltBeregnet}
          />
        </BorderedFormContainer>
      )}

      {/* Show SumAarsavregningTabell for manual amount below bordered container when entered */}
      {endeligAvgiftValg === MANUELL_ENDELIG_AVGIFT &&
        manueltAvgiftBeloep !== undefined &&
        manueltAvgiftBeloep !== null &&
        manueltAvgiftBeloep !== "" && (
          <SumArsavregningTabell
            harGrunnlagIMelosys={harTidligereTrygdeavgiftsgrunnlag}
            nyTrygdeavgift={Number(manueltAvgiftBeloep)}
            tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
            tidligereTrygdeavgiftAvgiftssystem={
              trygdeavgiftFraAvgiftssystemet ? Number(trygdeavgiftFraAvgiftssystemet) : undefined
            }
            tidligereAarsavregningTrygdeavgiftFraAvgiftssystem={tidligereAarsavregningTrygdeavgiftFraAvgiftssystem}
          />
        )}

      {feilmelding && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {feilmelding}
        </Nav.Alert>
      )}

      <Nav.Button
        variant="primary"
        loading={beregningPaagar || endrerBestemmelse || lagreMedlemskapsperioderPaagar || debouncedBeregningPagaar}
        disabled={!redigerbart}
        onClick={håndterBekreft}
      >
        Bekreft og fortsett
      </Nav.Button>
    </div>
  );
}
