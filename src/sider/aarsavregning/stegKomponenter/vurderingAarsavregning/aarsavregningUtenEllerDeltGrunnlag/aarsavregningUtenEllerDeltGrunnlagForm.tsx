/* eslint-disable max-lines */
// @ts-expect-error Workaround for @hookform/resolvers/yup with moduleResolution: bundler
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FieldValue, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import { medlemskapsperioderOperations } from "../../../../../ducks/medlemskapsperioder";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import {
  FieldArrayProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Api from "../../../../../services/api";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import {
  Medlemskapsperiode,
  OppdaterMedlemskapsperiode,
} from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import * as Utils from "../../../../../utils";
import { hentMedlemskapsFomTomDato } from "../aarsavregningHelpers";
import { Aarsavregningsmeldinger } from "../komponenter/aarsavregningsmeldinger";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import BestemmelseSelect from "../komponenter/bestemmelseSelect";
import MedlemskapsPerioderTabell from "../komponenter/medlemskapsPerioderTabell";
import { MedlemskapsperiodeSkjema } from "../komponenter/medlemskapsperiodeSkjema";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import { TidligereFakturertIAvgiftssystemetInput } from "../komponenter/tidligereFakturertIAvgiftssystemetInput";
import TidligereGrunnlagsoversikt from "../komponenter/tidligereGrunnlagsoversikt";
import { beregnTrygdeavgiftsperioder, erBrukerSkattepliktigIHelePerioden } from "../komponenter/utils";
import {
  AarsavregningFormValuesProps,
  DEFAULT_MEDLEMSKAPSPERIODE,
  ULAGRET_MEDLEMSKAPSPERIODE_ID,
} from "./aarsavregningUtenEllerDeltGrunnlag";
import aarsavregningUtenEllerDeltGrunnlagSchema from "./aarsavregningUtenEllerDeltGrunnlagSchema";
import { Feilmelding, finnAktivFeilmelding, finnAktivFeilmeldingForMedlemskapsperioder } from "./valideringsfeil";
import { ManuellAvgiftFormPart } from "../komponenter/manuellAvgiftFormPart";
import { EndeligAvgiftValgRadioGroup } from "../komponenter/endeligAvgiftValgRadioGroup";

const { OPPLYSNINGER_ENDRET, MANUELL_ENDELIG_AVGIFT } = MKV.Koder.endeligAvgiftValg;

// Helper function to log and return changed dependencies
const getChangedDependencies = (currentDeps: Record<string, any>, previousDepsRef: React.MutableRefObject<any>) => {
  const changedDeps: Record<string, any> = {};
  if (previousDepsRef.current) {
    // Compare current dependencies with previous ones
    Object.keys(currentDeps).forEach((key) => {
      if (!Utils._isEqual(currentDeps[key as keyof typeof currentDeps], previousDepsRef.current[key])) {
        changedDeps[key] = {
          prev: previousDepsRef.current[key],
          curr: currentDeps[key as keyof typeof currentDeps],
        };
      }
    });
    // Log only if there are changed dependencies
    if (Object.keys(changedDeps).length > 0) {
      console.log("[getChangedDependencies] Changed Dependencies", changedDeps);
    } else {
      console.log("[getChangedDependencies] No Changed Dependencies?!");
    }
  } else {
    // Log all dependencies on the first run
    console.log("[getChangedDependencies] First Run Dependencies", currentDeps);
  }

  // Update previous deps ref
  // eslint-disable-next-line no-param-reassign
  previousDepsRef.current = currentDeps;
  return changedDeps; // Return the changed dependencies object
};

export function AarsavregningUtenEllerDeltGrunnlagForm({
  initiellData,
  bekreft,
  oppdaterStatus,
  harDeltGrunnlag,
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
  harDeltGrunnlag: boolean;
}) {
  const [feilmelding, setFeilmelding] = useState<undefined | string>(undefined);
  const [beregningPaagar, setBeregningPaagar] = useState(false);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(
    initiellData.aarsavregningResponse,
  );
  const [previousFormState, setPreviousFormState] = useState<any | null>(null);
  const [debouncedBeregningPagaar, setDebouncedBeregningPagaar] = useState(false);
  const [arrayValideringsfeil, setArrayValideringsfeil] = useState<string | undefined>(undefined);

  const [trygdedekninger, setTrygdedekninger] = useState<string[]>(initiellData.trygdedekninger || []);
  const [endrerBestemmelse, setEndrerBestemmelse] = useState(false);
  const [lagreMedlemskapsperioderPaagar, setLagreMedlemskapsperioderPaagar] = useState(false);
  const [lagredeMedlemskapsperioder, setLagredeMedlemskapsperioder] = useState<Medlemskapsperiode[]>(
    initiellData.formDefaultValues.medlemskapsperioder || [],
  );

  // Redux selectors
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
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
    },
    mode: "onChange",
    defaultValues: initiellData.formDefaultValues,
  });

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

  const formValues = watch();
  const bestemmelse = useWatch({ control, name: "bestemmelse" });
  const medlemskapsperioder = useWatch({ control, name: "medlemskapsperioder" });
  const medlemskapsperioderForrigeAntall = useRef(medlemskapsperioder.length);
  const totaltForskuddsvisFakturert = useWatch({ control, name: "totaltForskuddsvisFakturert" });
  const skatteforholdsperioder = useWatch({ control, name: "skatteforholdsperioder" });
  const inntektskilder = useWatch({ control, name: "inntektskilder" });
  const endeligAvgiftValg = useWatch({ control, name: "endeligAvgiftValg" });
  const manueltAvgiftBeloep = useWatch({ control, name: "manueltAvgiftBeloep" });

  const debouncedBeregningRef = useRef<any>(null);
  const forrigeTotaltForskuddsvisFakturert = useRef(totaltForskuddsvisFakturert);
  const previousDepsRef = useRef<any>(null);

  const medlemskapstypeErPliktig = useMemo(() => {
    return medlemskapsperioder
      .filter((periode: Medlemskapsperiode) => periode.id !== ULAGRET_MEDLEMSKAPSPERIODE_ID)
      .every((periode: Medlemskapsperiode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG);
  }, [medlemskapsperioder]);

  const finnMedlemskapsperiode = useCallback((perioder: Medlemskapsperiode[]) => {
    const sorterteGyldigePerioder = perioder
      .filter((periode: Medlemskapsperiode) => periode.fomDato && periode.tomDato)
      .sort(Utils.dato.sorterEtterNorskFomDato);
    const medlemskapsperiodeFomTom = hentMedlemskapsFomTomDato(sorterteGyldigePerioder);

    console.log("[finnMedlemskapsperiode] medlemskapsperiodeFomTom", medlemskapsperiodeFomTom);
    console.log("[finnMedlemskapsperiode] sorterteGyldigePerioder", sorterteGyldigePerioder);
    console.log("[finnMedlemskapsperiode] perioder", perioder);

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
    medlemskapsperioderFormState: Medlemskapsperiode[],
    totaltForskuddsvisFakturertParam: number | undefined,
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
    medlemskapsperioder: medlemskapsperioderFormState.map((periode: Medlemskapsperiode) => ({
      fomDato: periode.fomDato,
      tomDato: periode.tomDato,
      trygdedekning: periode.trygdedekning,
      medlemskapstype: periode.medlemskapstype,
    })),
    totaltForskuddsvisFakturert: totaltForskuddsvisFakturertParam,
  });

  useEffect(() => {
    if (redigerbart && aarsavregningResponse?.nyttGrunnlag) {
      if (
        aarsavregningResponse.nyttGrunnlag?.avgift.totalAvgift !== aarsavregningResponse.avregning?.beregnetAvgiftBelop
      ) {
        Api.Aarsavregning.oppdaterBeregnetAvgiftBeloep(
          behandlingID,
          aarsavregningID,
          aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift,
        ).then((response: AarsavregningResponse) => {
          setAarsavregningResponse(response);
        });
      }
    }
  }, [aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift]);

  const lagreMedlemskapsperiodeHvisEndret = async (
    periode: Medlemskapsperiode,
    lagredePerioder: Medlemskapsperiode[],
    index: number,
  ) => {
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
      periode.trygdedekning !== lagretMedlemskapsperiode.trygdedekning;

    if (harEndringer) {
      try {
        const response: any = await (periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID
          ? Api.MedlemAvFolketrygden.Medlemskapsperioder.opprettMedlemskapsperioder(behandlingID, periodeRequest)
          : Api.MedlemAvFolketrygden.Medlemskapsperioder.oppdaterMedlemskapsperioder(
              behandlingID,
              periode.id,
              periodeRequest,
            ));

        return response;
      } catch (error) {
        setFeilmelding("Feil ved lagring av medlemskapsperiode");
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
    console.log("[debouncedBeregning] setter debouncedBeregningPagaar til false");
    setDebouncedBeregningPagaar(false);
    if (
      !redigerbart ||
      !aarsavregningID ||
      endrerBestemmelse ||
      beregningPaagar ||
      lagreMedlemskapsperioderPaagar ||
      endeligAvgiftValg !== OPPLYSNINGER_ENDRET
    ) {
      console.log("[debouncedBeregning] return tidlig i debouncedBeregning");
      return;
    }

    const medlemskapsperioderFormState = getValues("medlemskapsperioder");
    const formState = mapFormState(
      getValues("skatteforholdsperioder"),
      getValues("inntektskilder"),
      medlemskapsperioderFormState,
      getValues("totaltForskuddsvisFakturert"),
    );
    const medlemskapsperiodeFomTom = finnMedlemskapsperiode(medlemskapsperioderFormState);

    console.log("[debouncedBeregning] medlemskapsperiodeFomTom", medlemskapsperiodeFomTom);

    if (!Utils._isEqual(formState, previousFormState)) {
      const aktivFeilmelding = finnAktivFeilmelding({
        skatteforholdsperioder: formState.skatteforholdsperioder,
        inntektskilder: formState.inntektskilder,
        medlemskapsperiodeFomTom,
        medlemskapsperioder: medlemskapsperioderFormState as Medlemskapsperiode[],
        medlemskapstypeErPliktig,
      });
      console.log("[debouncedBeregning] Aktive feilmeldinger", aktivFeilmelding, {
        skatteforholdsperioder: formState.skatteforholdsperioder,
        inntektskilder: formState.inntektskilder,
        medlemskapsperiodeFomTom,
        medlemskapsperioder: medlemskapsperioderFormState as Medlemskapsperiode[],
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

    console.log("[debouncedBeregning] ferdig");
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
    async (medlemskapsperioderFormValues: Medlemskapsperiode[]) => {
      interface LagredeMedlemskapsperioder extends Medlemskapsperiode {
        formValuesIndex: number;
      }

      const endredeMedlemskapsperioder: LagredeMedlemskapsperioder[] = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const [index, periode] of medlemskapsperioderFormValues.entries()) {
        const lagretPeriode = await lagreMedlemskapsperiodeHvisEndret(periode, lagredeMedlemskapsperioder, index);
        if (lagretPeriode)
          endredeMedlemskapsperioder.push({
            ...(lagretPeriode as Medlemskapsperiode),
            formValuesIndex: index,
          });
      }

      if (endredeMedlemskapsperioder.length > 0) {
        setFeilmelding(undefined);
        setArrayValideringsfeil(undefined);

        const oppdaterteMedlemskapsperioder = medlemskapsperioderFormValues.map((periode: any, index: number) => {
          const lagretPeriodeMedID = endredeMedlemskapsperioder.find(
            (backendPeriode: any) => backendPeriode.formValuesIndex === index,
          );
          if (lagretPeriodeMedID) {
            return {
              ...periode,
              medlemskapstype: lagretPeriodeMedID.medlemskapstype,
              id: lagretPeriodeMedID.id,
            };
          }
          return periode;
        });

        console.log("[lagreMedlemskapsperioder] oppdaterteMedlemskapsperioder", oppdaterteMedlemskapsperioder);

        setLagredeMedlemskapsperioder(oppdaterteMedlemskapsperioder);
        setValue("medlemskapsperioder", oppdaterteMedlemskapsperioder);
      }
    },
    [setValue, setLagredeMedlemskapsperioder, lagredeMedlemskapsperioder],
  );

  const debouncedLagreMedlemskapsperioder = useCallback(
    Utils._debounce((medlemskapsperioderFormValues, callbackEtterLagring) => {
      lagreMedlemskapsperioder(medlemskapsperioderFormValues).finally(() => {
        if (callbackEtterLagring) callbackEtterLagring();
      });
    }, 350),
    [lagreMedlemskapsperioder],
  );

  const medlemskapsperioderHarBrukerendringer = (
    medlemskapsperioderNå: Medlemskapsperiode[],
    medlemskapsperioderTidlgere: Medlemskapsperiode[],
  ) => {
    const nåværendeListeMedRelevanteFelter = medlemskapsperioderNå.map(({ fomDato, tomDato, trygdedekning }) => ({
      fomDato,
      tomDato,
      trygdedekning,
    }));

    const forrigeListeMedRelevanteFelter = medlemskapsperioderTidlgere.map(({ fomDato, tomDato, trygdedekning }) => ({
      fomDato,
      tomDato,
      trygdedekning,
    }));

    const sorterEtterFomDato = (a: any, b: any) => {
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

        const erGyldigSkjema = await trigger("medlemskapsperioder");
        if (!erGyldigSkjema || !bestemmelse) {
          return;
        }

        const aktivFeilmeldingForMedlemskapsperioder = finnAktivFeilmeldingForMedlemskapsperioder(medlemskapsperioder);
        if (aktivFeilmeldingForMedlemskapsperioder) {
          setArrayValideringsfeil(aktivFeilmeldingForMedlemskapsperioder);
          return;
        }

        console.log("[lagreMedlemskapsperioderEffect] setter lagrerMedlemskapsperioder til true");
        setLagreMedlemskapsperioderPaagar(true);
        const medlemskapsperioderTilLagring = [...medlemskapsperioder];
        console.log("[lagreMedlemskapsperioderEffect] medlemskapsperioderTilLagring", medlemskapsperioderTilLagring);
        debouncedLagreMedlemskapsperioder(medlemskapsperioderTilLagring, () => {
          console.log("[lagreMedlemskapsperioderEffect] Setter lagrerMedlemskapsperioder til false");
          setLagreMedlemskapsperioderPaagar(false);
        });
      }
    };

    lagreMedlemskapsperioderEffect();
  }, [medlemskapsperioder, redigerbart, endrerBestemmelse, bestemmelse]);

  const lagreMedlemskapsperioderEtterBestemmelseEndringHvisGyldig = useCallback(
    (oppdaterteMedlemskapsperioder: Medlemskapsperiode[]) => {
      setLagredeMedlemskapsperioder(oppdaterteMedlemskapsperioder);

      trigger("medlemskapsperioder")
        .then(async (isValid) => {
          if (isValid) {
            await lagreMedlemskapsperioder(oppdaterteMedlemskapsperioder);
          }
        })
        .finally(() => setEndrerBestemmelse(false));
    },
    [trigger, lagreMedlemskapsperioder, setLagredeMedlemskapsperioder],
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
      console.error("Feil ved sletting av medlemskapsperiode:", error);
      setFeilmelding("Feil ved sletting av medlemskapsperiode");
    }
  };

  const handleOppdaterTotaltForskuddsvisFakturert = async (
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

  const debouncedOppdaterTotaltForskuddsvisFakturert = useCallback(
    Utils._debounce(
      (request: Api.Aarsavregning.AarsavregningRequest) =>
        handleOppdaterTotaltForskuddsvisFakturert(behandlingID, request, aarsavregningID),
      350,
    ),
    [aarsavregningID],
  );

  // TODO: Trenger vi useEffect? Kan vi ikke ha onchange handler?
  useEffect(() => {
    if (
      redigerbart &&
      forrigeTotaltForskuddsvisFakturert.current !== totaltForskuddsvisFakturert &&
      totaltForskuddsvisFakturert !== aarsavregningResponse?.avregning?.tidligereFakturertBeloepAvgiftssystem
    ) {
      debouncedOppdaterTotaltForskuddsvisFakturert({
        avregning: {
          tidligereFakturertBeloepAvgiftssystem: totaltForskuddsvisFakturert,
        },
      });
    }

    forrigeTotaltForskuddsvisFakturert.current = totaltForskuddsvisFakturert;
  }, [totaltForskuddsvisFakturert]);

  // Lager en ny debounce funksjon når beregning callback endres
  useEffect(() => {
    setDebouncedBeregningPagaar(false);
    debouncedBeregningRef.current = Utils._debounce(debouncedBeregning, 350);
    console.log("[useEffect debouncedBeregning] Lager en ny debounce funksjon når beregning callback endres");

    // Cancel på unmount
    return () => {
      if (debouncedBeregningRef.current?.cancel) {
        setDebouncedBeregningPagaar(false);
        console.log(
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
      totaltForskuddsvisFakturert,
      endeligAvgiftValg,
      aarsavregningID,
      redigerbart,
      beregningPaagar,
      trigger,
      getValues,
      previousFormState,
      errors,
    };

    // Get the changed dependencies
    const changedDependencies = getChangedDependencies(currentDeps, previousDepsRef);
    const medlemskapsperiodeEndret = Object.keys(changedDependencies).includes("medlemskapsperiode");

    // Avbryter hvis vi allerede har en beregning som venter
    if (debouncedBeregningRef.current?.cancel && Object.keys(changedDependencies).length > 0) {
      setDebouncedBeregningPagaar(false);
      console.log("[useEffect hovedberegning] Avbryter eventuelt eksisterende beregning.", {
        beregningPaagar,
        lagreMedlemskapsperioderPaagar,
        debouncedBeregningPagaar,
      });
      debouncedBeregningRef.current.cancel();
    }

    if (medlemskapsperiodeEndret || Object.keys(changedDependencies).length === 0 || lagreMedlemskapsperioderPaagar) {
      console.log("[useEffect hovedberegning] Avbryter useEffect uten å gjøre noe.", {
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
        getValues("totaltForskuddsvisFakturert"),
      );

      if (!redigerbart || !aarsavregningID || endrerBestemmelse || beregningPaagar || lagreMedlemskapsperioderPaagar) {
        console.log(
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
        trigger().then((isValid) => {
          if (!isValid) {
            setArrayValideringsfeil(undefined);
            return;
          }
          setDebouncedBeregningPagaar(true);
          console.log("[useEffect hovedberegning] sette debouncedBeregningPaagar true");
          debouncedBeregningRef.current();
        });
      } else {
        setArrayValideringsfeil(undefined);
        console.log("[useEffect hovedberegning] Clear arrayValideringsfeil", {
          currentFormState,
          previousFormState,
        });
        if (errors) {
          // Nødvendig fordi errors er lazy som ikke blir oppdatert.
          // Her vet vi at vi har en state som er som siste beregningen, dvs ok.
          // Derfor trigger på nytt i tilfelle "errors" ikke har riktig verdi
          trigger();
        }
      }
    } else {
      console.log("[useEffect hovedberegning] debouncedBeregningRef.current er undefined");
    }
  }, [
    skatteforholdsperioder,
    inntektskilder,
    formIsValid,
    lagreMedlemskapsperioderPaagar,
    endrerBestemmelse,
    totaltForskuddsvisFakturert,
    endeligAvgiftValg,
    aarsavregningID,
    redigerbart,
    beregningPaagar,
    trigger,
    getValues,
    previousFormState,
    errors,
  ]);

  const stegErGyldig = useMemo(() => {
    if (endeligAvgiftValg === OPPLYSNINGER_ENDRET) {
      return Boolean(
        formIsValid &&
          aarsavregningResponse?.nyttGrunnlag &&
          feilmelding === undefined &&
          arrayValideringsfeil === undefined,
      );
    }
    if (endeligAvgiftValg === MANUELL_ENDELIG_AVGIFT) {
      return Boolean(formIsValid && feilmelding === undefined);
    }
    return false;
  }, [formIsValid, aarsavregningResponse?.nyttGrunnlag, feilmelding, endeligAvgiftValg, arrayValideringsfeil]);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig, oppdaterStatus]);

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
  const forskuddsvisFakturertTrygdeavgift =
    (aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift?.totalAvgift ?? 0) > 0;
  const skjemaErRedigerbart = redigerbart && !endrerBestemmelse;

  return (
    <div className="vurderingAarsavregning">
      {harDeltGrunnlag && (
        <>
          <MedlemskapsPerioderTabell
            perioder={aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder}
          />
          <TidligereGrunnlagsoversikt
            skatteforholdsperioder={
              aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.skatteforholdsperioder
            }
            inntektsperioder={
              aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.inntektskperioder
            }
            avgift={aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift}
          />

          {!forskuddsvisFakturertTrygdeavgift && <Aarsavregningsmeldinger.TrygdeavgiftErIkkeForskuddsvisFakturert />}

          <BeregnetTrygdeavgiftDetaljer
            grunnlag={aarsavregningResponse?.tidligereGrunnlagsopplysninger}
            medlemskapsTypeErPliktig={medlemskapstypeErPliktig}
            tittel="Tidligere beregnet trygdeavgift"
          />
        </>
      )}

      <EndeligAvgiftValgRadioGroup
        control={control}
        redigerbart={skjemaErRedigerbart}
        handleEndeligAvgiftValgChange={handleEndeligAvgiftValgChange}
        erMedGrunnlagFlyt={false}
      />

      {endeligAvgiftValg === OPPLYSNINGER_ENDRET && (
        <>
          <TidligereFakturertIAvgiftssystemetInput
            control={control}
            redigerbart={skjemaErRedigerbart}
            harDeltGrunnlag={harDeltGrunnlag}
          />

          <Nav.Heading className="endelige_opplysninger_heading" level="2">
            Inntekts- og skatteopplysninger for endelig trygdeavgift
          </Nav.Heading>

          <BestemmelseSelect
            control={control}
            setValue={setValue}
            bestemmelser={initiellData.bestemmelser}
            harDeltGrunnlag={harDeltGrunnlag}
            behandlingID={behandlingID}
            redigerbart={skjemaErRedigerbart}
            setTrygdedekninger={setTrygdedekninger}
            setFeilmelding={setFeilmelding}
            setEndrerBestemmelse={setEndrerBestemmelse}
            lagreMedlemskapsperioderHvisGyldig={lagreMedlemskapsperioderEtterBestemmelseEndringHvisGyldig}
          />

          <div className="medlemskapsperioder">
            {medlemskapsperioderFields.map((field, index) => (
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
                maksVerdi={
                  initiellData.valgtÅr !== undefined
                    ? new Date(initiellData.valgtÅr, 11, 31, 23, 59, 59, 999)
                    : undefined
                }
                minVerdi={initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 0, 1) : undefined}
                trygdedekninger={trygdedekninger}
                setValue={setValue}
                errors={errors}
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
            />
          )}
          {formIsValid && trygdeAvgiftSkalIkkeBetalesTilNav && (
            <Aarsavregningsmeldinger.TrygdeavgiftSkalIkkeBetalesTilNav />
          )}

          {formIsValid && !beregningPaagar && !debouncedBeregningPagaar && !arrayValideringsfeil && !feilmelding && (
            <SumArsavregningTabell
              harGrunnlagIMelosys={harDeltGrunnlag}
              nyTrygdeavgift={aarsavregningResponse?.avregning?.beregnetAvgiftBelop}
              tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
              tidligereTrygdeavgiftAvgiftssystem={
                aarsavregningResponse?.avregning?.tidligereFakturertBeloepAvgiftssystem
              }
            />
          )}

          {formIsValid &&
            !beregningPaagar &&
            !debouncedBeregningPagaar &&
            !feilmelding &&
            !arrayValideringsfeil &&
            aarsavregningResponse?.nyttGrunnlag && (
              <BeregnetTrygdeavgiftDetaljer
                grunnlag={aarsavregningResponse.nyttGrunnlag}
                medlemskapsTypeErPliktig={medlemskapstypeErPliktig}
                tittel="Endelig beregnet trygdeavgift"
              />
            )}

          {arrayValideringsfeil && <Feilmelding type={arrayValideringsfeil} />}
        </>
      )}

      {feilmelding && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {feilmelding}
        </Nav.Alert>
      )}

      <ManuellAvgiftFormPart
        control={control}
        redigerbart={redigerbart}
        endeligAvgiftValg={endeligAvgiftValg}
        manueltAvgiftBeloep={manueltAvgiftBeloep}
        debouncedOppdaterManueltAvgiftBeloep={debouncedOppdaterManueltAvgiftBeloep}
        tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
        erMedGrunnlagFlyt={false}
        harDeltGrunnlag={harDeltGrunnlag}
        totaltForskuddsvisFakturert={totaltForskuddsvisFakturert}
      />

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
