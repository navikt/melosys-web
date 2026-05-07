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
import * as PeriodeAdapter from "../../../../../services/modules/aarsavregning/periodeApiAdapter";
import type {
  BasePeriode,
  AarsavregningsPeriodeType,
  Avgiftspliktigperiode,
  HelseutgiftdekkesperiodeForAvgift,
} from "../../../../../services/modules/types/periodeTyper";
import {
  erMedlemskapsperiodeEllerLovvalgsperiode,
  erHelseutgiftdekkesperiode,
} from "../../../../../services/modules/types/periodeTyper";
import * as Utils from "../../../../../utils";
import { Aarsavregningsmeldinger } from "../komponenter/aarsavregningsmeldinger";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import BestemmelseSelect from "../komponenter/bestemmelseSelect";
import { BorderedFormContainer } from "../komponenter/borderedFormContainer";
import { EndeligAvgiftValgRadioGroup } from "../komponenter/endeligAvgiftValgRadioGroup";
import { ManuellAvgiftFormPart } from "../komponenter/manuellAvgiftFormPart";
import { AvgiftspliktigperiodeSkjema } from "../komponenter/medlemskapsperiodeSkjema";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import { InnbetaltTrygdeavgiftInput } from "../komponenter/innbetaltTrygdeavgiftInput";
import {
  beregnTrygdeavgiftsperioder,
  erBrukerSkattepliktigIHelePerioden,
  erGyldigeMedlemskapsperiodeDatoerForAutoUtfylling,
  hentMedlemskapsFomTomDato,
  validateAarsavregningUtenEllerDeltGrunnlag,
} from "../utils";
import {
  AarsavregningFormValuesProps,
  DEFAULT_MEDLEMSKAPSPERIODE,
  lagDefaultPeriode,
  mapPerioder,
  MedlemskapsperiodeFieldProps,
  erUlagretPeriode,
} from "./aarsavregningUtenEllerDeltGrunnlag";
import aarsavregningUtenEllerDeltGrunnlagSchema from "./aarsavregningUtenEllerDeltGrunnlagSchema";
import { Feilmelding, finnAktivFeilmelding, finnAktivFeilmeldingForMedlemskapsperioder } from "./valideringsfeil";
import { ÅRSAVREGNING_EØS_PENSJONIST } from "../../../../../featuretoggle/toggleNavn";
import useFeatureToggle from "../../../../../featuretoggle/useFeatureToggle";

const { OPPLYSNINGER_ENDRET, MANUELL_ENDELIG_AVGIFT, OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET } =
  MKV.Koder.endeligAvgiftValg;

const getChangedDependencies = (
  currentDeps: Record<string, unknown>,
  previousDepsRef: React.MutableRefObject<Record<string, unknown> | null>,
) => {
  const changedDeps: Record<string, { prev: unknown; curr: unknown }> = {};
  if (previousDepsRef.current) {
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
  }

  previousDepsRef.current = currentDeps;
  return changedDeps;
};

export function AarsavregningUtenEllerDeltGrunnlagForm({
  initiellData,
  bekreft,
  oppdaterStatus,
  harInnbetaltTrygdeavgift,
  harTidligereTrygdeavgiftsgrunnlag,
}: {
  initiellData: {
    valgtÅr?: number;
    aarsavregningResponse?: AarsavregningResponse;
    bestemmelser: string[];
    formDefaultValues: FieldValue<AarsavregningFormValuesProps>;
    trygdedekninger?: string[];
    periodeType: AarsavregningsPeriodeType;
  };
  bekreft: () => void;
  oppdaterStatus: (isValid: boolean) => void;
  harInnbetaltTrygdeavgift: boolean;
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
  const [lagredeMedlemskapsperioder, setLagredeMedlemskapsperioder] = useState<MedlemskapsperiodeFieldProps[]>(
    initiellData.formDefaultValues.avgiftspliktigperioder || [],
  );

  // Redux selectors
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as number;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);
  const erÅrsavregningEøsPensjonistToggle = useFeatureToggle(ÅRSAVREGNING_EØS_PENSJONIST);

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
      harInnbetaltTrygdeavgift,
    },
    mode: "onChange",
    defaultValues: initiellData.formDefaultValues,
  });

  const {
    fields: medlemskapsperioderFields,
    append: medlemskapsperioderAppend,
    remove: medlemskapsperioderRemove,
  } = useFieldArray({ control, name: "avgiftspliktigperioder" });

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
  const medlemskapsperioder = useWatch({ control, name: "avgiftspliktigperioder" });
  const medlemskapsperioderForrigeAntall = useRef(medlemskapsperioder.length);
  const innbetaltTrygdeavgift = useWatch({ control, name: "innbetaltTrygdeavgift" });
  const skatteforholdsperioder = useWatch({ control, name: "skatteforholdsperioder" });
  const inntektskilder = useWatch({ control, name: "inntektskilder" });
  const endeligAvgiftValg = useWatch({ control, name: "endeligAvgiftValg" });
  const manueltAvgiftBeloep = useWatch({ control, name: "manueltAvgiftBeloep" });
  const erEøsPensjonistToggleEnabled = useFeatureToggle(ÅRSAVREGNING_EØS_PENSJONIST);

  const debouncedBeregningRef = useRef<ReturnType<typeof Utils._debounce> | null>(null);
  const forrigeInnbetaltTrygdeavgift = useRef(innbetaltTrygdeavgift);
  const previousDepsRef = useRef<Record<string, unknown> | null>(null);

  const periodeType = initiellData.periodeType;
  const erHelseutgift = periodeType === "HELSEUTGIFTDEKKESPERIODE";
  const medlemskapstypeErPliktig = useMemo(() => {
    if (erHelseutgift) return true;

    return medlemskapsperioder
      .filter((periode: MedlemskapsperiodeFieldProps) => !erUlagretPeriode(periode.id))
      .every(
        (periode: MedlemskapsperiodeFieldProps) =>
          erMedlemskapsperiodeEllerLovvalgsperiode(periode) &&
          periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG,
      );
  }, [medlemskapsperioder, erHelseutgift]);

  const erDeltGrunnlag =
    harInnbetaltTrygdeavgift && !!initiellData.aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger;

  const harLaasteMedlemskapsperioder =
    !!initiellData.aarsavregningResponse?.sisteGjeldendeAvgiftspliktigperioder &&
    initiellData.aarsavregningResponse.sisteGjeldendeAvgiftspliktigperioder.length > 0;

  const finnMedlemskapsperiode = useCallback(
    (perioder: MedlemskapsperiodeFieldProps[]) => {
      const sorterteGyldigePerioder = perioder
        .filter((periode: MedlemskapsperiodeFieldProps) =>
          erGyldigeMedlemskapsperiodeDatoerForAutoUtfylling(periode.fomDato, periode.tomDato, initiellData.valgtÅr),
        )
        .sort(Utils.dato.sorterEtterNorskFomDato);
      const medlemskapsperiodeFomTom = hentMedlemskapsFomTomDato(sorterteGyldigePerioder);

      return {
        fomDato: Utils.dato.vaskOgFormatterDatoTilNorsk(medlemskapsperiodeFomTom?.fom),
        tomDato: Utils.dato.vaskOgFormatterDatoTilNorsk(medlemskapsperiodeFomTom?.tom),
      };
    },
    [initiellData.valgtÅr],
  );

  const medlemskapsperiode = useMemo(() => {
    return finnMedlemskapsperiode(medlemskapsperioder);
  }, [medlemskapsperioder, finnMedlemskapsperiode]);

  const mapFormState = (
    skatteforholdsperioderFormState: Skatteforhold[],
    inntektskilderFormState: Inntektskilde[],
    medlemskapsperioderFormState: MedlemskapsperiodeFieldProps[],
    innbetaltTrygdeavgiftParam: number | undefined,
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
    avgiftspliktigperioder: medlemskapsperioderFormState.map((periode: MedlemskapsperiodeFieldProps) => ({
      fomDato: periode.fomDato,
      tomDato: periode.tomDato,
      type: periode.type,
      trygdedekning: erMedlemskapsperiodeEllerLovvalgsperiode(periode) ? periode.trygdedekning : "",
      medlemskapstype: erMedlemskapsperiodeEllerLovvalgsperiode(periode) ? periode.medlemskapstype : "PLIKTIG",
      bostedLandkode: erHelseutgiftdekkesperiode(periode) ? periode.bostedLandkode : "",
    })),
    innbetaltTrygdeavgift: innbetaltTrygdeavgiftParam,
    endeligAvgiftValg: endeligAvgiftValgFormState,
    bestemmelse: bestemmelseFormState,
  });

  const lagreMedlemskapsperiodeHvisEndret = async (
    periode: MedlemskapsperiodeFieldProps,
    lagredePerioder: MedlemskapsperiodeFieldProps[],
    index: number,
  ) => {
    const periodeMedIsoDatoer: MedlemskapsperiodeFieldProps = {
      ...periode,
      fomDato: Utils.dato.vaskOgFormatterTilISO(periode.fomDato, "") as string,
      tomDato: Utils.dato.vaskOgFormatterTilISO(periode.tomDato, "") as string,
    };
    if (erMedlemskapsperiodeEllerLovvalgsperiode(periodeMedIsoDatoer)) {
      periodeMedIsoDatoer.innvilgelsesResultat = MKV.Koder.innvilgelsesResultat.INNVILGET;
    }

    const lagretMedlemskapsperiode = lagredePerioder[index];
    const nyTrygdedekning = erMedlemskapsperiodeEllerLovvalgsperiode(periode) ? periode.trygdedekning : "";
    const lagredeTrygdedekning =
      lagretMedlemskapsperiode && erMedlemskapsperiodeEllerLovvalgsperiode(lagretMedlemskapsperiode)
        ? lagretMedlemskapsperiode.trygdedekning
        : "";
    const bostedLandkodeNå = erHelseutgiftdekkesperiode(periode) ? periode.bostedLandkode : "";
    const bostedLandkodeLagret =
      lagretMedlemskapsperiode && erHelseutgiftdekkesperiode(lagretMedlemskapsperiode)
        ? lagretMedlemskapsperiode.bostedLandkode
        : "";
    const harEndringer =
      !lagretMedlemskapsperiode ||
      erUlagretPeriode(periode.id) ||
      periode.fomDato !== lagretMedlemskapsperiode.fomDato ||
      periode.tomDato !== lagretMedlemskapsperiode.tomDato ||
      nyTrygdedekning !== lagredeTrygdedekning ||
      bostedLandkodeNå !== bostedLandkodeLagret;

    if (harEndringer) {
      try {
        const bestemmelse = getValues("bestemmelse") ?? "";
        const skalOpprette = erUlagretPeriode(periode.id);
        return await (skalOpprette
          ? PeriodeAdapter.opprettPeriode(behandlingID, periodeMedIsoDatoer, bestemmelse)
          : PeriodeAdapter.oppdaterPeriode(behandlingID, periodeMedIsoDatoer, bestemmelse));
      } catch (error) {
        setFeilmelding("Feil ved lagring av periode");
        /* eslint-disable-next-line no-console */
        console.error("Feil ved lagring av periode:", error);
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
        erEøsPensjonist: erHelseutgift,
        setFeilmelding,
        setAarsavregningResponse,
      });
      setBeregningPaagar(false);
    },
    [medlemskapstypeErPliktig, setFeilmelding, setAarsavregningResponse],
  );
  const debouncedBeregning = useCallback(() => {
    setDebouncedBeregningPagaar(false);
    if (
      !redigerbart ||
      !aarsavregningID ||
      endrerBestemmelse ||
      beregningPaagar ||
      lagreMedlemskapsperioderPaagar ||
      endeligAvgiftValg === MANUELL_ENDELIG_AVGIFT
    ) {
      return;
    }

    const medlemskapsperioderFormState = getValues("avgiftspliktigperioder");
    const formState = mapFormState(
      getValues("skatteforholdsperioder"),
      getValues("inntektskilder"),
      medlemskapsperioderFormState,
      getValues("innbetaltTrygdeavgift"),
      getValues("endeligAvgiftValg"),
      getValues("bestemmelse"),
    );
    const medlemskapsperiodeFomTom = finnMedlemskapsperiode(medlemskapsperioderFormState);

    if (!Utils._isEqual(formState, previousFormState)) {
      const aktivFeilmelding = finnAktivFeilmelding({
        skatteforholdsperioder: formState.skatteforholdsperioder,
        inntektskilder: formState.inntektskilder,
        medlemskapsperiodeFomTom,
        avgiftspliktigperioder: medlemskapsperioderFormState,
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
    async (medlemskapsperioderFormValues: MedlemskapsperiodeFieldProps[]) => {
      type LagretPeriodeMedIndex = Avgiftspliktigperiode & {
        formValuesIndex: number;
      };

      const endredeMedlemskapsperioder: LagretPeriodeMedIndex[] = [];
      for (const [index, periode] of medlemskapsperioderFormValues.entries()) {
        const lagretPeriode = await lagreMedlemskapsperiodeHvisEndret(periode, lagredeMedlemskapsperioder, index);
        if (lagretPeriode)
          endredeMedlemskapsperioder.push({
            ...lagretPeriode,
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
            return {
              ...periode,
              ...(erMedlemskapsperiodeEllerLovvalgsperiode(lagretPeriodeMedID)
                ? { medlemskapstype: lagretPeriodeMedID.medlemskapstype }
                : {}),
              id: lagretPeriodeMedID.id,
            };
          }
          return periode;
        });

        setLagredeMedlemskapsperioder(oppdaterteMedlemskapsperioder);
        setValue("avgiftspliktigperioder", oppdaterteMedlemskapsperioder);
      }
    },
    [setValue, setLagredeMedlemskapsperioder, lagredeMedlemskapsperioder],
  );

  const debouncedLagreMedlemskapsperioder = useCallback(
    Utils._debounce(
      (medlemskapsperioderFormValues: MedlemskapsperiodeFieldProps[], callbackEtterLagring: () => void) => {
        lagreMedlemskapsperioder(medlemskapsperioderFormValues).finally(() => {
          if (callbackEtterLagring) callbackEtterLagring();
        });
      },
      350,
    ),
    [lagreMedlemskapsperioder],
  );

  const medlemskapsperioderHarBrukerendringer = (
    medlemskapsperioderNå: MedlemskapsperiodeFieldProps[],
    medlemskapsperioderTidlgere: MedlemskapsperiodeFieldProps[],
  ) => {
    const nåværendeListeMedRelevanteFelter = medlemskapsperioderNå.map((periode) => ({
      fomDato: periode.fomDato,
      tomDato: periode.tomDato,
      trygdedekning: erMedlemskapsperiodeEllerLovvalgsperiode(periode) ? periode.trygdedekning : "",
      bostedLandkode: erHelseutgiftdekkesperiode(periode) ? periode.bostedLandkode : "",
    }));

    const forrigeListeMedRelevanteFelter = medlemskapsperioderTidlgere.map((periode) => ({
      fomDato: periode.fomDato,
      tomDato: periode.tomDato,
      trygdedekning: erMedlemskapsperiodeEllerLovvalgsperiode(periode) ? periode.trygdedekning : "",
      bostedLandkode: erHelseutgiftdekkesperiode(periode) ? periode.bostedLandkode : "",
    }));

    const sorterEtterFomDato = (a: BasePeriode, b: BasePeriode) => {
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
          medlemskapsperioderForrigeAntall.current = medlemskapsperioder.length;

          // Ved sletting/legg til: valider at perioder og skatt/inntekt fortsatt er gyldige
          if (medlemskapsperioder.length > 0) {
            const aktivFeilmeldingForPerioder = finnAktivFeilmeldingForMedlemskapsperioder(medlemskapsperioder);
            if (aktivFeilmeldingForPerioder) {
              setArrayValideringsfeil(aktivFeilmeldingForPerioder);
              return;
            }
            const oppdatertAvgiftspliktigperiode = finnMedlemskapsperiode(medlemskapsperioder);
            if (oppdatertAvgiftspliktigperiode) {
              const formState = mapFormState(
                getValues("skatteforholdsperioder"),
                getValues("inntektskilder"),
                medlemskapsperioder,
                getValues("trygdeavgiftFraAvgiftssystemet"),
                getValues("endeligAvgiftValg"),
                getValues("bestemmelse"),
              );
              const aktivFeilmelding = finnAktivFeilmelding({
                skatteforholdsperioder: formState.skatteforholdsperioder,
                inntektskilder: formState.inntektskilder,
                medlemskapsperiodeFomTom: oppdatertAvgiftspliktigperiode,
                medlemskapstypeErPliktig,
                avgiftspliktigperioder: medlemskapsperioder,
              });
              if (aktivFeilmelding) {
                setArrayValideringsfeil(aktivFeilmelding);
                return;
              }
            }
          }
          setArrayValideringsfeil(undefined);
          return;
        }
        if (!medlemskapsperioderHarBrukerendringer(medlemskapsperioder, lagredeMedlemskapsperioder)) {
          return;
        }

        const context = {
          aar: initiellData.valgtÅr,
          harInnbetaltTrygdeavgift,
        };
        const { isValid: erGyldigSkjema } = await validateAarsavregningUtenEllerDeltGrunnlag(
          getValues(),
          context,
          "avgiftspliktigperioder",
        );
        if (!erGyldigSkjema || (!erHelseutgift && !bestemmelse)) {
          return;
        }

        const aktivFeilmeldingForMedlemskapsperioder = finnAktivFeilmeldingForMedlemskapsperioder(medlemskapsperioder);
        if (aktivFeilmeldingForMedlemskapsperioder) {
          setArrayValideringsfeil(aktivFeilmeldingForMedlemskapsperioder);
          return;
        }

        setLagreMedlemskapsperioderPaagar(true);
        const medlemskapsperioderTilLagring = [...medlemskapsperioder];
        debouncedLagreMedlemskapsperioder(medlemskapsperioderTilLagring, () => {
          setLagreMedlemskapsperioderPaagar(false);

          // Re-valider at skatt/inntekt dekker den (mulig utvidede) samlede perioden
          const oppdatertAvgiftspliktigperiode = finnMedlemskapsperiode(medlemskapsperioderTilLagring);
          if (oppdatertAvgiftspliktigperiode) {
            const formStateEtterLagring = mapFormState(
              getValues("skatteforholdsperioder"),
              getValues("inntektskilder"),
              medlemskapsperioderTilLagring,
              getValues("trygdeavgiftFraAvgiftssystemet"),
              getValues("endeligAvgiftValg"),
              getValues("bestemmelse"),
            );
            const aktivFeilmelding = finnAktivFeilmelding({
              skatteforholdsperioder: formStateEtterLagring.skatteforholdsperioder,
              inntektskilder: formStateEtterLagring.inntektskilder,
              medlemskapsperiodeFomTom: oppdatertAvgiftspliktigperiode,
              medlemskapstypeErPliktig,
              avgiftspliktigperioder: medlemskapsperioderTilLagring,
            });
            if (aktivFeilmelding) {
              setArrayValideringsfeil(aktivFeilmelding);
            }
          }
        });
      }
    };

    lagreMedlemskapsperioderEffect();
  }, [medlemskapsperioder, redigerbart, endrerBestemmelse, bestemmelse]);

  const lagreMedlemskapsperioderEtterBestemmelseEndringHvisGyldig = useCallback(
    (oppdaterteMedlemskapsperioder: MedlemskapsperiodeFieldProps[]) => {
      setLagredeMedlemskapsperioder(oppdaterteMedlemskapsperioder);

      const completeFormData = {
        ...getValues(),
        avgiftspliktigperioder: oppdaterteMedlemskapsperioder,
      };
      const context = {
        aar: initiellData.valgtÅr,
        harInnbetaltTrygdeavgift,
      };
      validateAarsavregningUtenEllerDeltGrunnlag(completeFormData, context, "avgiftspliktigperioder")
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
    const defaultPeriode = lagDefaultPeriode(periodeType);
    if (periodeType === "HELSEUTGIFTDEKKESPERIODE") {
      const eksisterendeLandkode = medlemskapsperioder.find(
        (
          p: MedlemskapsperiodeFieldProps,
        ): p is HelseutgiftdekkesperiodeForAvgift & { redigerbar: boolean; feil?: string } =>
          p.type === "HELSEUTGIFTDEKKESPERIODE" && !!p.bostedLandkode,
      )?.bostedLandkode;
      if (eksisterendeLandkode && defaultPeriode.type === "HELSEUTGIFTDEKKESPERIODE") {
        defaultPeriode.bostedLandkode = eksisterendeLandkode;
      }
    }
    medlemskapsperioderAppend(defaultPeriode);
  };

  const slettMedlemskapsperiode = async (index: number) => {
    const periode = medlemskapsperioder[index];

    try {
      setLagreMedlemskapsperioderPaagar(true);
      if (erUlagretPeriode(periode.id)) {
        medlemskapsperioderRemove(index);
      } else {
        await PeriodeAdapter.slettPeriode(periodeType, behandlingID, periode.id);
        medlemskapsperioderRemove(index);
        if (periodeType === "MEDLEMSKAPSPERIODE") {
          dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
        }
      }
      setLagreMedlemskapsperioderPaagar(false);
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error("Feil ved sletting av periode:", error);
      setFeilmelding("Feil ved sletting av periode");
    }
  };

  const handleOppdaterInnbetaltTrygdeavgift = async (
    behandlingid: number,
    request: Api.Aarsavregning.AarsavregningRequest,
    aarsavregningid?: number,
  ) => {
    setFeilmelding(undefined);
    await Api.Aarsavregning.oppdaterAarsavregning(behandlingid, request, aarsavregningid)
      .then(setAarsavregningResponse)
      .catch(() => {
        setFeilmelding(
          erÅrsavregningEøsPensjonistToggle
            ? "Feil ved oppdatering av tidligere fakturert innbetalt trygdeavgift"
            : "Feil ved oppdatering av tidligere fakturert trygdeavgift i avgiftssystemet",
        );
      });
  };

  const debouncedOppdaterInnbetaltTrygdeavgift = useCallback(
    Utils._debounce(
      (request: Api.Aarsavregning.AarsavregningRequest) =>
        handleOppdaterInnbetaltTrygdeavgift(behandlingID, request, aarsavregningID),
      350,
    ),
    [aarsavregningID],
  );

  // TODO: Trenger vi useEffect? Kan vi ikke ha onchange handler?
  useEffect(() => {
    if (
      redigerbart &&
      forrigeInnbetaltTrygdeavgift.current !== innbetaltTrygdeavgift &&
      innbetaltTrygdeavgift !== aarsavregningResponse?.avregning?.innbetaltTrygdeavgift
    ) {
      debouncedOppdaterInnbetaltTrygdeavgift({
        avregning: {
          innbetaltTrygdeavgift: innbetaltTrygdeavgift || "0",
        },
      });
    }

    forrigeInnbetaltTrygdeavgift.current = innbetaltTrygdeavgift;
  }, [innbetaltTrygdeavgift]);

  // Lager en ny debounce funksjon når beregning callback endres
  useEffect(() => {
    setDebouncedBeregningPagaar(false);
    debouncedBeregningRef.current = Utils._debounce(debouncedBeregning, 600);

    // Cancel på unmount
    return () => {
      if (debouncedBeregningRef.current?.cancel) {
        setDebouncedBeregningPagaar(false);
        debouncedBeregningRef.current.cancel();
      }
    };
  }, [debouncedBeregning]);

  // Håndterer kjøring av beregninger når skjemaverdier endres
  useEffect(() => {
    if (
      endeligAvgiftValg !== OPPLYSNINGER_ENDRET &&
      endeligAvgiftValg !== OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET
    ) {
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
      innbetaltTrygdeavgift,
      endeligAvgiftValg,
      aarsavregningID,
      redigerbart,
      beregningPaagar,
      getValues,
      previousFormState,
      errors,
    };

    const changedDependencies = getChangedDependencies(currentDeps, previousDepsRef);
    const medlemskapsperiodeEndret = Object.keys(changedDependencies).includes("medlemskapsperiode");

    if (debouncedBeregningRef.current?.cancel && Object.keys(changedDependencies).length > 0) {
      setDebouncedBeregningPagaar(false);
      debouncedBeregningRef.current.cancel();
    }

    if (medlemskapsperiodeEndret || Object.keys(changedDependencies).length === 0 || lagreMedlemskapsperioderPaagar) {
      return;
    }

    if (debouncedBeregningRef.current) {
      const currentFormState = mapFormState(
        getValues("skatteforholdsperioder"),
        getValues("inntektskilder"),
        getValues("avgiftspliktigperioder"),
        getValues("innbetaltTrygdeavgift"),
        getValues("endeligAvgiftValg"),
        getValues("bestemmelse"),
      );

      if (!redigerbart || !aarsavregningID || endrerBestemmelse || beregningPaagar || lagreMedlemskapsperioderPaagar) {
        return;
      }
      if (!Utils._isEqual(currentFormState, previousFormState)) {
        const context = {
          aar: initiellData.valgtÅr,
          harInnbetaltTrygdeavgift,
        };
        validateAarsavregningUtenEllerDeltGrunnlag(currentFormState, context).then(({ isValid }) => {
          if (!isValid) {
            // Schema-validering feilet, men sjekk om det er skatt/inntekt-feilmeldinger som bør vises
            const medlemskapsperioderFormState = getValues("avgiftspliktigperioder");
            const medlemskapsperiodeFomTom = finnMedlemskapsperiode(medlemskapsperioderFormState);
            const aktivFeilmelding = finnAktivFeilmelding({
              skatteforholdsperioder: currentFormState.skatteforholdsperioder,
              inntektskilder: currentFormState.inntektskilder,
              medlemskapsperiodeFomTom,
              avgiftspliktigperioder: medlemskapsperioderFormState,
              medlemskapstypeErPliktig,
            });
            setArrayValideringsfeil(aktivFeilmelding ?? undefined);
            return;
          }
          setDebouncedBeregningPagaar(true);
          if (debouncedBeregningRef.current) {
            debouncedBeregningRef.current();
          }
        });
      } else {
        setArrayValideringsfeil(undefined);
      }
    }
  }, [
    skatteforholdsperioder,
    inntektskilder,
    formIsValid,
    lagreMedlemskapsperioderPaagar,
    endrerBestemmelse,
    innbetaltTrygdeavgift,
    endeligAvgiftValg,
    aarsavregningID,
    redigerbart,
    beregningPaagar,
    getValues,
    previousFormState,
    errors,
  ]);

  const stegErGyldig = useMemo(() => {
    if (
      endeligAvgiftValg === OPPLYSNINGER_ENDRET ||
      endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET
    ) {
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
    async (value: string) => {
      setFeilmelding(undefined);

      if (erEøsPensjonistToggleEnabled && periodeType) {
        try {
          await PeriodeAdapter.slettPerioderFraAvgiftssystemet(periodeType, behandlingID);
          const gjenværendePerioder = await PeriodeAdapter.hentPerioder(periodeType, behandlingID);
          const sisteGjeldende = initiellData.aarsavregningResponse?.sisteGjeldendeAvgiftspliktigperioder;
          const perioderSomFormValues = mapPerioder(gjenværendePerioder, sisteGjeldende);
          const oppdatertePerioder =
            perioderSomFormValues.length > 0 ? perioderSomFormValues : [lagDefaultPeriode(periodeType)];
          setValue("avgiftspliktigperioder", oppdatertePerioder, { shouldValidate: false });
          setLagredeMedlemskapsperioder(oppdatertePerioder);
        } catch (error) {
          setFeilmelding("Feil ved sletting av perioder fra avgiftssystemet");
        }
      }

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
    [aarsavregningID, behandlingID, setValue, erEøsPensjonistToggleEnabled, periodeType, setLagredeMedlemskapsperioder],
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

  const tidligereAarsavregningInnbetaltTrygdeavgift =
    initiellData.aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.tidligereInnbetaltTrygdeavgift;

  const tidligereAarsavregningErManueltBeregnet = Boolean(
    initiellData.aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger
      ?.tidligereÅrsavregningManueltAvgiftBeloep,
  );

  const minDate = initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 0, 1) : undefined;
  const maxDate =
    initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 11, 31, 23, 59, 59, 999) : undefined;

  const skalViseLeggTilForFtrl =
    erEøsPensjonistToggleEnabled === true
      ? endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET && !erHelseutgift
      : !erHelseutgift;

  const skalViseLeggTilForEøsPensjonister =
    erEøsPensjonistToggleEnabled === true
      ? endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET
      : !erHelseutgift;

  const skalViseLeggTil = erHelseutgift ? skalViseLeggTilForEøsPensjonister : skalViseLeggTilForFtrl;

  return (
    <div className="vurderingAarsavregning">
      {harInnbetaltTrygdeavgift && (
        <InnbetaltTrygdeavgiftInput
          control={control}
          redigerbart={skjemaErRedigerbart}
          erNyAarsavregning={Boolean(tidligereAarsavregningInnbetaltTrygdeavgift)}
          harTidligereTrygdeavgiftsgrunnlag={harTidligereTrygdeavgiftsgrunnlag}
        />
      )}

      <EndeligAvgiftValgRadioGroup
        control={control}
        redigerbart={skjemaErRedigerbart}
        handleEndeligAvgiftValgChange={handleEndeligAvgiftValgChange}
        endeligAvgiftValg={endeligAvgiftValg}
        endretPeriodeFraAvgiftssystemetValg={erDeltGrunnlag}
        harInnbetaltTrygdeavgift={harInnbetaltTrygdeavgift}
      />

      {(endeligAvgiftValg === OPPLYSNINGER_ENDRET ||
        endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET) && (
        <BorderedFormContainer>
          <Nav.Heading className="endelige_opplysninger_heading" level="2">
            Inntekts- og skatteopplysninger for endelig trygdeavgift
          </Nav.Heading>

          {!erHelseutgift && (
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
          )}

          <div className="perioder">
            {medlemskapsperioderFields.map((field, index: number) => (
              <AvgiftspliktigperiodeSkjema
                key={field.id}
                redigerbart={skjemaErRedigerbart}
                control={control}
                field={field}
                index={index}
                remove={slettMedlemskapsperiode}
                formValues={formValues}
                handleLeggTil={leggTilDefaultMedlemskapsperiode}
                visLeggTil={skalViseLeggTil}
                maxDate={maxDate}
                minDate={minDate}
                trygdedekninger={erHelseutgift ? [] : trygdedekninger}
                setValue={setValue}
                erDeltGrunnlag={erDeltGrunnlag}
                periodeType={periodeType}
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
              erHelseutgiftDekkesPeriode={erHelseutgift}
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

          {arrayValideringsfeil && (
            <Feilmelding type={arrayValideringsfeil} erHelseutgiftDekkesPeriode={erHelseutgift} />
          )}
        </BorderedFormContainer>
      )}

      {/* Show SumAarsavregningTabell below bordered container when data is available */}
      {formIsValid &&
        !beregningPaagar &&
        !debouncedBeregningPagaar &&
        !arrayValideringsfeil &&
        !feilmelding &&
        (endeligAvgiftValg === OPPLYSNINGER_ENDRET ||
          endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET) &&
        aarsavregningResponse?.nyttTrygdeavgiftsGrunnlag && (
          <SumArsavregningTabell
            harGrunnlagIMelosys={harTidligereTrygdeavgiftsgrunnlag}
            nyTrygdeavgift={aarsavregningResponse?.avregning?.beregnetAvgiftBelop}
            tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
            tidligereInnbetaltTrygdeavgift={aarsavregningResponse?.avregning?.innbetaltTrygdeavgift}
            tidligereAarsavregningInnbetaltTrygdeavgift={tidligereAarsavregningInnbetaltTrygdeavgift}
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
            tidligereInnbetaltTrygdeavgift={innbetaltTrygdeavgift ? Number(innbetaltTrygdeavgift) : undefined}
            tidligereAarsavregningInnbetaltTrygdeavgift={tidligereAarsavregningInnbetaltTrygdeavgift}
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
