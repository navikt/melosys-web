/* eslint-disable max-lines */
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FieldValue, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import { medlemskapsperioderOperations } from "../../../../../ducks/medlemskapsperioder";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import {
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { useDispatch } from "../../../../../hooks";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Api from "../../../../../services/api";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { Beregningsforklaring } from "../../../../../services/modules/trygdeavgift";
import * as PeriodeAdapter from "../../../../../services/modules/aarsavregning/periodeApiAdapter";
import type {
  Avgiftspliktigperiode,
  HelseutgiftdekkesperiodeForAvgift,
} from "../../../../../services/modules/types/periodeTyper";
import {
  erHelseutgiftdekkesperiode as erHelseutgiftdekkesperiodeTypeGuard,
  erMedlemskapsperiodeEllerLovvalgsperiode,
  erPeriodeListeHelseutgiftdekkesperiode,
} from "../../../../../services/modules/types/periodeTyper";
import * as Utils from "../../../../../utils";
import { Aarsavregningsmeldinger } from "../komponenter/aarsavregningsmeldinger";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import { BorderedFormContainer } from "../komponenter/borderedFormContainer";
import { EndeligAvgiftValgRadioGroup } from "../komponenter/endeligAvgiftValgRadioGroup";
import { ManuellAvgiftFormPart } from "../komponenter/manuellAvgiftFormPart";
import { MedlemskapsperioderDisplay } from "../komponenter/medlemskapsperiodeDisplay";
import { AvgiftspliktigperiodeSkjema } from "../komponenter/medlemskapsperiodeSkjema";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import { beregnTrygdeavgiftsperioder, erBrukerSkattepliktigIHelePerioden, finnMedlemskapsperiode } from "../utils";
import "../vurderingAarsavregningInngang.less";
import {
  AvgiftspliktigperiodeFieldProps,
  erUlagretPeriode,
  lagDefaultPeriode,
  mapPerioder,
  MedlemskapsperiodeFieldProps,
} from "../aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlag";
import { InitiellData } from "./aarsavregningMedGrunnlag";
import aarsavregningMedGrunnlagSchema from "./aarsavregningMedGrunnlagSchema";
import { Feilmelding, finnAktivFeilmelding } from "./valideringsfeil";
import { useFeatureToggle } from "../../../../../featuretoggle";
import { ÅRSAVREGNING_EØS_PENSJONIST } from "../../../../../featuretoggle/toggleNavn";

const { OPPLYSNINGER_ENDRET, MANUELL_ENDELIG_AVGIFT, OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET } =
  MKV.Koder.endeligAvgiftValg;

interface MappedFormState {
  skatteforholdsperioder: Array<{
    fomDato: string | undefined;
    tomDato: string | undefined;
    skatteplikttype: string | undefined;
  }>;
  inntektskilder: Array<{
    fomDato: string | undefined;
    tomDato: string | undefined;
    kildetype: string | undefined;
    bruttoInntekt: number | undefined;
    arbAvgBetales: string | boolean | undefined;
    erMaanedsbelop: string | boolean | undefined;
  }>;
}

interface Props {
  initiellData: InitiellData;
  bekreft: () => void;
  oppdaterStatus: (isValid: boolean) => void;
}

export function AarsavregningMedGrunnlagForm({ initiellData, bekreft, oppdaterStatus }: Props) {
  const [feilmelding, setFeilmelding] = useState<string | string[] | undefined>(undefined);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(
    initiellData.aarsavregningResponse,
  );
  const [beregningsforklaringer, setBeregningsforklaringer] = useState<Beregningsforklaring[]>([]);
  const [beregningPaagar, setBeregningPaagar] = useState(false);
  const [previousFormValues, setPreviousFormValues] = useState<MappedFormState | null>(null);
  const [endrerEndeligAvgiftValg, setEndrerEndeligAvgiftValg] = useState(false);
  const [debouncedBeregningPagaar, setDebouncedBeregningPagaar] = useState(false);
  const [arrayValideringsfeil, setArrayValideringsfeil] = useState<string | undefined>(undefined);
  const [trygdedekninger, setTrygdedekninger] = useState<string[]>(initiellData.trygdedekninger || []);
  const [lagreMedlemskapsperioderPaagar, setLagreMedlemskapsperioderPaagar] = useState(false);
  const [lagredeMedlemskapsperioder, setLagredeMedlemskapsperioder] = useState<MedlemskapsperiodeFieldProps[]>(
    initiellData.formDefaultValues.avgiftspliktigperioder || [],
  );

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as number;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);
  const dispatch = useDispatch();
  const erEøsPensjonistToggleEnabled = useFeatureToggle(ÅRSAVREGNING_EØS_PENSJONIST);

  const periodeType = initiellData.periodeType;

  const { innvilgetMedlemskapsperioder, medlemskapstypeErPliktig } = initiellData;
  const sisteGjeldendeAvgiftspliktigperioder = aarsavregningResponse?.sisteGjeldendeAvgiftspliktigperioder;
  const erHelseutgiftDekkesPeriode = sisteGjeldendeAvgiftspliktigperioder
    ? erPeriodeListeHelseutgiftdekkesperiode(sisteGjeldendeAvgiftspliktigperioder)
    : false;

  // Compute initial avgiftspliktigperiode for the non-editable case (used as useForm context for schema validation)
  const initialAvgiftspliktigperiode = useMemo(() => {
    if (innvilgetMedlemskapsperioder.length > 0) {
      return finnMedlemskapsperiode(innvilgetMedlemskapsperioder);
    }
    if (sisteGjeldendeAvgiftspliktigperioder) {
      const perioderMedNorskDato = sisteGjeldendeAvgiftspliktigperioder.map((p) => ({
        ...p,
        fomDato: Utils.dato.formatterDatoTilNorsk(p.fomDato),
        tomDato: Utils.dato.formatterDatoTilNorsk(p.tomDato),
      }));
      return finnMedlemskapsperiode(perioderMedNorskDato);
    }
    return undefined;
  }, [innvilgetMedlemskapsperioder, sisteGjeldendeAvgiftspliktigperioder]);

  const nyVurderingHarFjernetAvgiftspliktigperiode =
    sisteGjeldendeAvgiftspliktigperioder !== undefined &&
    Utils._isEmpty(sisteGjeldendeAvgiftspliktigperioder) &&
    initiellData.aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger !== undefined;
  const {
    control,
    watch,
    formState: { isValid: formIsValid, isValidating },
    trigger,
    getValues,
    setValue,
  } = useForm({
    resolver: yupResolver(aarsavregningMedGrunnlagSchema),
    context: {
      avgiftspliktigperiode: initialAvgiftspliktigperiode,
      medlemskapsTypeErPliktig: medlemskapstypeErPliktig,
      erHelseutgiftDekkesPeriode,
      aar: initiellData.valgtÅr,
    },
    mode: "onChange",
    defaultValues: initiellData.formDefaultValues,
  });
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

  const {
    fields: medlemskapsperioderFields,
    append: medlemskapsperioderAppend,
    remove: medlemskapsperioderRemove,
  } = useFieldArray({ control, name: "avgiftspliktigperioder" });

  const formValues = watch();
  const skatteforholdsperioder = watch("skatteforholdsperioder");
  const inntektskilder = watch("inntektskilder");
  const endeligAvgiftValg = watch("endeligAvgiftValg");
  const manueltAvgiftBeloep = watch("manueltAvgiftBeloep");
  const medlemskapsperioder = useWatch({ control, name: "avgiftspliktigperioder" });
  const medlemskapsperioderForrigeAntall = useRef(medlemskapsperioder?.length || 0);
  const debouncedBeregningRef = useRef<ReturnType<typeof Utils._debounce> | null>(null);

  // Compute avgiftspliktigperiode: when editable periods, derive from form field; otherwise from innvilget/response
  const avgiftspliktigperiode = useMemo(() => {
    if (
      endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET &&
      medlemskapsperioder &&
      medlemskapsperioder.length > 0
    ) {
      return finnMedlemskapsperiode(medlemskapsperioder);
    }
    if (innvilgetMedlemskapsperioder.length > 0) {
      return finnMedlemskapsperiode(innvilgetMedlemskapsperioder);
    }
    if (sisteGjeldendeAvgiftspliktigperioder) {
      const perioderMedNorskDato = sisteGjeldendeAvgiftspliktigperioder.map((p) => ({
        ...p,
        fomDato: Utils.dato.formatterDatoTilNorsk(p.fomDato),
        tomDato: Utils.dato.formatterDatoTilNorsk(p.tomDato),
      }));
      return finnMedlemskapsperiode(perioderMedNorskDato);
    }
    return undefined;
  }, [innvilgetMedlemskapsperioder, sisteGjeldendeAvgiftspliktigperioder, endeligAvgiftValg, medlemskapsperioder]);
  const mapFormState = (
    skatteforholdsperioderFormState: Skatteforhold[],
    inntektskilderFormState: Inntektskilde[],
  ) => ({
    skatteforholdsperioder: skatteforholdsperioderFormState
      .map((skatteforhold: Skatteforhold) => ({
        fomDato: skatteforhold.fomDato,
        tomDato: skatteforhold.tomDato,
        skatteplikttype: skatteforhold.skatteplikttype,
      }))
      .sort(Utils.dato.sorterEtterNorskFomDato),
    inntektskilder: inntektskilderFormState
      .map((inntektskilde: Inntektskilde) => ({
        fomDato: inntektskilde.fomDato,
        tomDato: inntektskilde.tomDato,
        kildetype: inntektskilde.kildetype,
        bruttoInntekt: inntektskilde.bruttoInntekt,
        arbAvgBetales: inntektskilde.arbAvgBetales,
        erMaanedsbelop: inntektskilde.erMaanedsbelop,
      }))
      .sort(Utils.dato.sorterEtterNorskFomDato),
  });

  const tilPeriodeMedIsoDatoer = (periode: MedlemskapsperiodeFieldProps): MedlemskapsperiodeFieldProps => {
    const periodeMedIsoDatoer = {
      ...periode,
      fomDato: Utils.dato.vaskOgFormatterTilISO(periode.fomDato, "") as string,
      tomDato: Utils.dato.vaskOgFormatterTilISO(periode.tomDato, "") as string,
    };
    if (erMedlemskapsperiodeEllerLovvalgsperiode(periodeMedIsoDatoer)) {
      periodeMedIsoDatoer.innvilgelsesResultat = MKV.Koder.innvilgelsesResultat.INNVILGET;
    }
    return periodeMedIsoDatoer;
  };

  const harPeriodeEndringer = (
    periode: MedlemskapsperiodeFieldProps,
    lagretPeriode?: MedlemskapsperiodeFieldProps,
  ): boolean => {
    if (!lagretPeriode || erUlagretPeriode(periode.id)) return true;

    const nyTrygdedekning = erMedlemskapsperiodeEllerLovvalgsperiode(periode) ? periode.trygdedekning : "";
    const lagretTrygdedekning = erMedlemskapsperiodeEllerLovvalgsperiode(lagretPeriode)
      ? lagretPeriode.trygdedekning
      : "";

    const nyBostedLandkode = erHelseutgiftdekkesperiodeTypeGuard(periode) ? periode.bostedLandkode : "";
    const lagretBostedLandkode = erHelseutgiftdekkesperiodeTypeGuard(lagretPeriode) ? lagretPeriode.bostedLandkode : "";

    return (
      periode.fomDato !== lagretPeriode.fomDato ||
      periode.tomDato !== lagretPeriode.tomDato ||
      nyTrygdedekning !== lagretTrygdedekning ||
      nyBostedLandkode !== lagretBostedLandkode
    );
  };

  const lagreAvgiftspliktigperiodeHvisEndret = async (
    periode: MedlemskapsperiodeFieldProps,
    lagredePerioder: MedlemskapsperiodeFieldProps[],
    index: number,
  ) => {
    if (!periode.redigerbar) return undefined;

    const lagretPeriode = lagredePerioder[index];
    if (!harPeriodeEndringer(periode, lagretPeriode)) return undefined;

    const periodeMedIsoDatoer = tilPeriodeMedIsoDatoer(periode);
    if (!periodeMedIsoDatoer.fomDato || !periodeMedIsoDatoer.tomDato) return undefined;

    try {
      const bestemmelse = innvilgetMedlemskapsperioder[0]?.bestemmelse || "";
      const skalOpprette = erUlagretPeriode(periode.id);
      return await (skalOpprette
        ? PeriodeAdapter.opprettPeriode(behandlingID, periodeMedIsoDatoer, bestemmelse)
        : PeriodeAdapter.oppdaterPeriode(behandlingID, periodeMedIsoDatoer, bestemmelse));
    } catch (error) {
      setFeilmelding("Feil ved lagring av periode");
      return undefined;
    }
  };

  const lagreMedlemskapsperioder = useCallback(
    async (medlemskapsperioderFormValues: MedlemskapsperiodeFieldProps[]) => {
      type LagretPeriodeMedIndex = Avgiftspliktigperiode & { formValuesIndex: number };
      const endredeMedlemskapsperioder: LagretPeriodeMedIndex[] = [];
      for (const [index, periode] of medlemskapsperioderFormValues.entries()) {
        const lagretPeriode = await lagreAvgiftspliktigperiodeHvisEndret(periode, lagredeMedlemskapsperioder, index);
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
    medlemskapsperioderTidligere: MedlemskapsperiodeFieldProps[],
  ) => {
    const nåværendeListeMedRelevanteFelter = medlemskapsperioderNå.map((periode) => ({
      fomDato: periode.fomDato,
      tomDato: periode.tomDato,
      trygdedekning: erMedlemskapsperiodeEllerLovvalgsperiode(periode) ? periode.trygdedekning : "",
      bostedLandkode: erHelseutgiftdekkesperiodeTypeGuard(periode) ? periode.bostedLandkode : "",
    }));

    const forrigeListeMedRelevanteFelter = medlemskapsperioderTidligere.map((periode) => ({
      fomDato: periode.fomDato,
      tomDato: periode.tomDato,
      trygdedekning: erMedlemskapsperiodeEllerLovvalgsperiode(periode) ? periode.trygdedekning : "",
      bostedLandkode: erHelseutgiftdekkesperiodeTypeGuard(periode) ? periode.bostedLandkode : "",
    }));

    return !Utils._isEqual(nåværendeListeMedRelevanteFelter, forrigeListeMedRelevanteFelter);
  };

  const leggTilDefaultMedlemskapsperiode = () => {
    if (periodeType) {
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
    }
  };

  const slettMedlemskapsperiode = async (index: number) => {
    const periode = medlemskapsperioder[index];
    try {
      setLagreMedlemskapsperioderPaagar(true);
      if (erUlagretPeriode(periode.id)) {
        medlemskapsperioderRemove(index);
      } else {
        if (periodeType) {
          await PeriodeAdapter.slettPeriode(periodeType, behandlingID, periode.id);
        }
        medlemskapsperioderRemove(index);
        if (periodeType === "MEDLEMSKAPSPERIODE") {
          dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
        }
      }
      setLagreMedlemskapsperioderPaagar(false);
    } catch (error) {
      setFeilmelding("Feil ved sletting av periode");
    } finally {
      setLagreMedlemskapsperioderPaagar(false);
    }
  };

  // Auto-save periods when they change (only for editable periods)
  useEffect(() => {
    if (endeligAvgiftValg !== OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET || !medlemskapsperioder) return;

    const lagreMedlemskapsperioderEffect = async () => {
      if (redigerbart && !lagreMedlemskapsperioderPaagar) {
        if (medlemskapsperioder.length !== medlemskapsperioderForrigeAntall.current) {
          medlemskapsperioderForrigeAntall.current = medlemskapsperioder.length;
          setArrayValideringsfeil(undefined);
          return;
        }
        if (!medlemskapsperioderHarBrukerendringer(medlemskapsperioder, lagredeMedlemskapsperioder)) {
          return;
        }

        const erAllePerioderGyldige = medlemskapsperioder.every((periode: AvgiftspliktigperiodeFieldProps) => {
          if (!periode.fomDato || !periode.tomDato) return false;
          return true;
        });
        if (!erAllePerioderGyldige) {
          return;
        }

        setLagreMedlemskapsperioderPaagar(true);
        const medlemskapsperioderTilLagring = [...medlemskapsperioder];
        debouncedLagreMedlemskapsperioder(medlemskapsperioderTilLagring, () => {
          setLagreMedlemskapsperioderPaagar(false);
        });
      }
    };

    lagreMedlemskapsperioderEffect();
  }, [medlemskapsperioder, redigerbart, endeligAvgiftValg]);

  const handleBeregnTrygdeavgiftsperioder = useCallback(
    async (formVerdier: FieldValue<FormValuesProps>) => {
      await beregnTrygdeavgiftsperioder(formVerdier, {
        behandlingID,
        medlemskapstypeErPliktig,
        setFeilmelding,
        setAarsavregningResponse,
        setBeregningsforklaringer,
      });
    },
    [medlemskapstypeErPliktig, setFeilmelding, setAarsavregningResponse, setBeregningsforklaringer],
  );

  const debouncedBeregning = useCallback(() => {
    setDebouncedBeregningPagaar(false);

    if (
      !redigerbart ||
      !aarsavregningID ||
      endeligAvgiftValg === MANUELL_ENDELIG_AVGIFT ||
      beregningPaagar ||
      endrerEndeligAvgiftValg ||
      lagreMedlemskapsperioderPaagar
    ) {
      return;
    }

    const formState = mapFormState(getValues("skatteforholdsperioder"), getValues("inntektskilder"));

    if (!Utils._isEqual(formState, previousFormValues) && formIsValid && !isValidating) {
      const aktivFeilmelding = finnAktivFeilmelding({
        skatteforholdsperioder: formState.skatteforholdsperioder,
        inntektskilder: formState.inntektskilder,
        medlemskapsperiodeFomTom: avgiftspliktigperiode!,
        medlemskapstypeErPliktig,
      });
      if (!aktivFeilmelding) {
        setArrayValideringsfeil(undefined);
        setBeregningPaagar(true);
        handleBeregnTrygdeavgiftsperioder(getValues())
          .then(() => {
            setPreviousFormValues(formState);
          })
          .finally(() => {
            setBeregningPaagar(false);
          });
      } else {
        setArrayValideringsfeil(aktivFeilmelding);
      }
    } else {
      setArrayValideringsfeil(undefined);
    }
  }, [
    aarsavregningID,
    endeligAvgiftValg,
    beregningPaagar,
    endrerEndeligAvgiftValg,
    lagreMedlemskapsperioderPaagar,
    getValues,
    formIsValid,
    isValidating,
    handleBeregnTrygdeavgiftsperioder,
    previousFormValues,
    avgiftspliktigperiode,
    medlemskapstypeErPliktig,
  ]);

  // Lager en ny debounce funksjon når beregning callback endres
  useEffect(() => {
    debouncedBeregningRef.current = Utils._debounce(debouncedBeregning, 600);

    // Cancel på unmount
    return () => {
      if (debouncedBeregningRef.current?.cancel) {
        debouncedBeregningRef.current.cancel();
        setDebouncedBeregningPagaar(false);
      }
    };
  }, [debouncedBeregning]);

  // Håndterer kjøring av beregninger når skjemaverdier endres
  useEffect(() => {
    // Avbryter hvis vi allerede har en beregning som venter
    if (debouncedBeregningRef.current?.cancel) {
      debouncedBeregningRef.current.cancel();
    }
    if (debouncedBeregningRef.current) {
      if (
        redigerbart &&
        aarsavregningID &&
        (endeligAvgiftValg === OPPLYSNINGER_ENDRET ||
          endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET) &&
        !endrerEndeligAvgiftValg &&
        !lagreMedlemskapsperioderPaagar &&
        !nyVurderingHarFjernetAvgiftspliktigperiode
      ) {
        const currentFormState = mapFormState(getValues("skatteforholdsperioder"), getValues("inntektskilder"));

        if (!Utils._isEqual(currentFormState, previousFormValues)) {
          setDebouncedBeregningPagaar(true);
          debouncedBeregningRef.current();
        } else {
          setDebouncedBeregningPagaar(false);
          setArrayValideringsfeil(undefined);
        }
      }
    }
  }, [
    skatteforholdsperioder,
    endeligAvgiftValg,
    inntektskilder,
    formIsValid,
    isValidating,
    endrerEndeligAvgiftValg,
    lagreMedlemskapsperioderPaagar,
    aarsavregningID,
  ]);

  const stegErGyldig = useMemo(
    () =>
      Boolean(
        (formIsValid || nyVurderingHarFjernetAvgiftspliktigperiode) &&
          (endeligAvgiftValg === OPPLYSNINGER_ENDRET ||
            endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET) &&
          (aarsavregningResponse?.nyttTrygdeavgiftsGrunnlag || nyVurderingHarFjernetAvgiftspliktigperiode) &&
          !feilmelding &&
          !arrayValideringsfeil &&
          !lagreMedlemskapsperioderPaagar,
      ) ||
      Boolean(
        endeligAvgiftValg === MANUELL_ENDELIG_AVGIFT &&
          aarsavregningResponse?.avregning?.manueltAvgiftBeloep !== undefined &&
          aarsavregningResponse?.avregning?.manueltAvgiftBeloep !== null &&
          formIsValid &&
          !feilmelding,
      ),
    [
      endeligAvgiftValg,
      formIsValid,
      aarsavregningResponse,
      feilmelding,
      arrayValideringsfeil,
      lagreMedlemskapsperioderPaagar,
      nyVurderingHarFjernetAvgiftspliktigperiode,
    ],
  );

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const handleEndeligAvgiftValgChange = useCallback(
    async (value: string) => {
      setEndrerEndeligAvgiftValg(true);

      if (erEøsPensjonistToggleEnabled && periodeType) {
        try {
          await PeriodeAdapter.slettPerioderFraAvgiftssystemet(periodeType, behandlingID);
          const gjenværendePerioder = await PeriodeAdapter.hentPerioder(periodeType, behandlingID);
          const perioderSomFormValues = mapPerioder(gjenværendePerioder, sisteGjeldendeAvgiftspliktigperioder);
          const oppdatertePerioder =
            perioderSomFormValues.length > 0 ? perioderSomFormValues : [lagDefaultPeriode(periodeType)];
          setValue("avgiftspliktigperioder", oppdatertePerioder, { shouldValidate: false });
          setLagredeMedlemskapsperioder(oppdatertePerioder);
        } catch (error) {
          setFeilmelding("Feil ved sletting av perioder fra avgiftssystemet");
        }
      }

      Api.Aarsavregning.oppdaterEndeligAvgiftValg(behandlingID, value, aarsavregningID)
        .then((res) => {
          setPreviousFormValues(null);
          setAarsavregningResponse(res);
          setValue("manueltAvgiftBeloep", "", { shouldValidate: false, shouldDirty: false });
        })
        .finally(() => {
          setEndrerEndeligAvgiftValg(false);
        });
    },
    [
      aarsavregningID,
      setAarsavregningResponse,
      setEndrerEndeligAvgiftValg,
      Api.Aarsavregning,
      behandlingID,
      setValue,
      erEøsPensjonistToggleEnabled,
      periodeType,
      setLagredeMedlemskapsperioder,
      sisteGjeldendeAvgiftspliktigperioder,
    ],
  );

  const debouncedOppdaterManueltAvgiftBeloep = useCallback(
    Utils._debounce(
      async (value: string) =>
        Api.Aarsavregning.oppdaterManueltAvgiftBeloep(behandlingID, aarsavregningID, Number(value)).then((res) => {
          setAarsavregningResponse(res);
        }),
      350,
    ),
    [aarsavregningID, behandlingID],
  );

  const håndterBekreft = useCallback(() => {
    // noinspection JSIgnoredPromiseFromCall
    trigger();

    if (
      stegErGyldig &&
      !beregningPaagar &&
      !endrerEndeligAvgiftValg &&
      !debouncedBeregningPagaar &&
      !lagreMedlemskapsperioderPaagar
    ) {
      bekreft();
    }
  }, [
    trigger,
    stegErGyldig,
    beregningPaagar,
    bekreft,
    endrerEndeligAvgiftValg,
    debouncedBeregningPagaar,
    lagreMedlemskapsperioderPaagar,
  ]);

  const trygdeAvgiftSkalIkkeBetalesTilNav =
    medlemskapstypeErPliktig && erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder);

  const tidligereAarsavregningErManueltBeregnet = Boolean(
    aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep,
  );

  const minDate = initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 0, 1) : undefined;
  const maxDate =
    initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 11, 31, 23, 59, 59, 999) : undefined;

  // Perioder fra avgiftssystemet kan kun legges til når det er svart "Ja" på
  // "Avviker innbetalt trygdeavgift fra tidligere beregnet avgift?"
  const skalViseLeggTil = Boolean(aarsavregningResponse?.harInnbetaltTrygdeavgift);

  return (
    <>
      <EndeligAvgiftValgRadioGroup
        control={control}
        redigerbart={redigerbart}
        handleEndeligAvgiftValgChange={handleEndeligAvgiftValgChange}
        endeligAvgiftValg={endeligAvgiftValg}
      />

      {(endeligAvgiftValg === OPPLYSNINGER_ENDRET ||
        endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET) &&
        !endrerEndeligAvgiftValg &&
        !nyVurderingHarFjernetAvgiftspliktigperiode && (
          <BorderedFormContainer>
            <Nav.Heading className="endelige_opplysninger_heading" level="2">
              Inntekts- og skatteopplysninger for endelig trygdeavgift
            </Nav.Heading>
            {endeligAvgiftValg !== OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET &&
              (erHelseutgiftDekkesPeriode ? (
                sisteGjeldendeAvgiftspliktigperioder?.map((periode) => (
                  <Nav.BodyLong size="small" key={Utils._uuid()} style={{ marginBottom: "1rem" }}>
                    <span className="navds-label navds-label--small">Periode Norge dekker helseutgifter:</span>{" "}
                    {`${Utils.dato.formatterDatoTilNorsk(periode.fomDato)} - ${Utils.dato.formatterDatoTilNorsk(
                      periode.tomDato,
                    )}`}
                  </Nav.BodyLong>
                ))
              ) : (
                <MedlemskapsperioderDisplay medlemskapsperioder={innvilgetMedlemskapsperioder} />
              ))}

            {endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET && medlemskapsperioderFields && (
              <div
                className={`perioder${!redigerbart || beregningPaagar || !skalViseLeggTil ? " perioder--med-bunnmargin" : ""}`}
              >
                {medlemskapsperioderFields.map((field, index: number) => (
                  <AvgiftspliktigperiodeSkjema
                    key={field.id}
                    redigerbart={redigerbart && !beregningPaagar}
                    control={control}
                    field={field}
                    index={index}
                    remove={slettMedlemskapsperiode}
                    formValues={formValues}
                    handleLeggTil={leggTilDefaultMedlemskapsperiode}
                    visLeggTil={skalViseLeggTil}
                    maxDate={maxDate}
                    minDate={minDate}
                    trygdedekninger={erHelseutgiftDekkesPeriode ? [] : trygdedekninger}
                    setValue={setValue}
                    erDeltGrunnlag={false}
                    periodeType={periodeType}
                    skjulBostedLand={erHelseutgiftDekkesPeriode}
                  />
                ))}
              </div>
            )}

            <Skatteforholdsperioder
              formValues={formValues}
              redigerbart={redigerbart && !beregningPaagar}
              remove={skattRemove}
              append={skattAppend}
              control={control}
              fields={skattFields}
              minDate={minDate}
              maxDate={maxDate}
            />
            {!trygdeAvgiftSkalIkkeBetalesTilNav && (
              <Inntektskilder
                defaultPeriode={avgiftspliktigperiode}
                formValues={formValues}
                redigerbart={redigerbart && !beregningPaagar}
                update={inntektUpdate}
                remove={inntektRemove}
                append={inntektAppend}
                control={control}
                fields={inntektFields}
                medlemskapsTypeErPliktig={medlemskapstypeErPliktig!}
                skalViseErMaanedsBelopRadioGroup
                bestemmelse={innvilgetMedlemskapsperioder[0]?.bestemmelse}
                minDate={minDate}
                maxDate={maxDate}
                erHelseutgiftDekkesPeriode={erHelseutgiftDekkesPeriode}
              />
            )}

            {trygdeAvgiftSkalIkkeBetalesTilNav && <Aarsavregningsmeldinger.TrygdeavgiftSkalIkkeBetalesTilNav />}

            {formIsValid &&
              !debouncedBeregningPagaar &&
              !beregningPaagar &&
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
                      medlemskapsTypeErPliktig={medlemskapstypeErPliktig!}
                      beregningsforklaringer={beregningsforklaringer}
                    />
                  </Nav.ExpansionCard.Content>
                </Nav.ExpansionCard>
              )}

            {arrayValideringsfeil && (
              <Feilmelding type={arrayValideringsfeil} erHelseutgiftDekkesPeriode={erHelseutgiftDekkesPeriode} />
            )}
          </BorderedFormContainer>
        )}

      {(formIsValid || nyVurderingHarFjernetAvgiftspliktigperiode) &&
        !debouncedBeregningPagaar &&
        !beregningPaagar &&
        !feilmelding &&
        !arrayValideringsfeil &&
        aarsavregningResponse?.avregning &&
        (aarsavregningResponse?.nyttTrygdeavgiftsGrunnlag || nyVurderingHarFjernetAvgiftspliktigperiode) &&
        (endeligAvgiftValg === OPPLYSNINGER_ENDRET ||
          endeligAvgiftValg === OPPLYSNINGER_ENDRET_MED_PERIODE_FRA_AVGIFTSSYSTEMET) && (
          <SumArsavregningTabell
            nyTrygdeavgift={aarsavregningResponse.avregning.beregnetAvgiftBelop}
            tidligereTrygdeavgift={aarsavregningResponse.avregning.tidligereFakturertBeloep}
            harGrunnlagIMelosys
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

      {endeligAvgiftValg === MANUELL_ENDELIG_AVGIFT &&
        manueltAvgiftBeloep !== undefined &&
        manueltAvgiftBeloep !== null &&
        manueltAvgiftBeloep !== "" && (
          <SumArsavregningTabell
            harGrunnlagIMelosys={true}
            nyTrygdeavgift={Number(manueltAvgiftBeloep)}
            tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
          />
        )}

      {feilmelding && !beregningPaagar && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {feilmelding}
        </Nav.Alert>
      )}

      <Nav.Button
        variant="primary"
        loading={beregningPaagar || debouncedBeregningPagaar || lagreMedlemskapsperioderPaagar}
        disabled={!redigerbart}
        onClick={håndterBekreft}
      >
        Bekreft og fortsett
      </Nav.Button>
    </>
  );
}
