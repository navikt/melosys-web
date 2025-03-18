import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useRef, useState } from "react";
import { FieldValue, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import { medlemskapsperioderOperations } from "../../../../../ducks/medlemskapsperioder";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { FieldArrayProps, FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
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

export function AarsavregningFormComponent({
  initialData,
  bekreft,
  oppdaterStatus,
  harDeltGrunnlag,
}: {
  initialData: {
    valgtÅr?: number;
    aarsavregningResponse?: AarsavregningResponse;
    lagredeMedlemskapsperioder: Medlemskapsperiode[];
    bestemmelser: string[];
    formDefaultValues: FieldValue<AarsavregningFormValuesProps>;
  };
  bekreft: () => void;
  oppdaterStatus: (isValid: boolean) => void;
  harDeltGrunnlag: boolean;
}) {
  const [feilmelding, setFeilmelding] = useState<undefined | string>(undefined);
  const [medlemskapsperiodeFeilmelding, setMedlemskapsperiodeFeilmelding] = useState<undefined | string>(undefined);
  const [beregningPaagar, setBeregningPaagar] = useState(false);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(
    initialData.aarsavregningResponse,
  );

  const [initiellBeregningUtført, setInitiellBeregningUtført] = useState(false);
  const [harValidertSkjema, setHarValidertSkjema] = useState(false);

  // TODO: Siden vi ikke bruker dette i context av yup, kan de konverteres til useMemo lenger nede.
  const [medlemskapsperiodeContext, setMedlemskapsperiodeContext] = useState(
    hentMedlemskapsFomTomDato(initialData.lagredeMedlemskapsperioder),
  );
  const [medlemskapstypeErPliktigContext, setMedlemskapstypeErPliktigContext] = useState(
    initialData.lagredeMedlemskapsperioder?.every(
      (periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG,
    ),
  );

  // Redux selectors
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);
  const dispatch = useDispatch();

  const defaultPeriode = {
    fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiodeContext?.fom),
    tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiodeContext?.tom),
  };

  // Log initial data when component mounts
  useEffect(() => {
    console.log("Initial data:", initialData);
  }, [initialData]);

  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { isValid: formIsValid, errors: formErrors },
  } = useForm({
    resolver: yupResolver(aarsavregningUtenEllerDeltGrunnlagSchema),
    context: {
      aar: initialData.valgtÅr,
    },
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: initialData.formDefaultValues,
  });

  const {
    fields: medlemskapsperioderFields,
    append: medlemskapsperioderAppend,
    remove: medlemskapsperioderRemove,
    update: medlemskapsperioderUpdate,
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
  const medlemskapsperioder = useWatch({ control, name: "medlemskapsperioder" });
  const medlemskapsperioderPrevLength = useRef(medlemskapsperioder.length);
  const totaltForskuddsvisFakturert = useWatch({ control, name: "totaltForskuddsvisFakturert" });
  const skatteforholdsperioder = useWatch({ control, name: "skatteforholdsperioder" });
  const inntektskilder = useWatch({ control, name: "inntektskilder" });

  const prevMedlemskapsperioder = useRef(medlemskapsperioder);
  const prevTotaltForskuddsvisFakturert = useRef(totaltForskuddsvisFakturert);

  // Kjør initiell beregning
  useEffect(() => {
    if (formIsValid && !initiellBeregningUtført) {
      const freshFormValues = watch();
      handleBeregnTrygdeavgiftsperioder(freshFormValues).then(() => {
        setInitiellBeregningUtført(true);
      });
    }
  }, [formIsValid]);

  // Setter context for medlemskapsperiode og medlemskapstypeErPliktig, som brukes i Schema-validering
  useEffect(() => {
    const gyldigePerioderMedDatoer = medlemskapsperioder.filter(
      (periode: Medlemskapsperiode) => periode.fomDato && periode.tomDato,
    );
    if (gyldigePerioderMedDatoer.length === 0) {
      return;
    }
    const sortertePerioder = [...gyldigePerioderMedDatoer].sort(Utils.dato.sorterEtterNorskFomDato);
    const nyMedlemskapsperiodeContext = hentMedlemskapsFomTomDato(sortertePerioder);
    setMedlemskapsperiodeContext(nyMedlemskapsperiodeContext);

    const nyMedlemskapstypeErPliktigContext = sortertePerioder
      .filter((periode: Medlemskapsperiode) => periode.id !== ULAGRET_MEDLEMSKAPSPERIODE_ID)
      .every((periode: Medlemskapsperiode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG);
    setMedlemskapstypeErPliktigContext(nyMedlemskapstypeErPliktigContext);

    console.log("nyMedlemskapstypeErPliktigContext", nyMedlemskapstypeErPliktigContext);
    console.log("nyMedlemskapsperiodeContext", nyMedlemskapsperiodeContext);
  }, [medlemskapsperioder]);

  useEffect(() => {
    // Kun vis komplekse feil hvis det ikke finnes andre feil i medlemskapsperioder
    if (formErrors.medlemskapsperioder) {
      const harFeltFeil = Object.keys(formErrors.medlemskapsperioder).some((key) => !Number.isNaN(parseInt(key, 10)));

      if (!harFeltFeil && formErrors.medlemskapsperioder.type) {
        setMedlemskapsperiodeFeilmelding(formErrors.medlemskapsperioder.message as string);
      } else {
        setMedlemskapsperiodeFeilmelding(undefined);
      }
    } else {
      setMedlemskapsperiodeFeilmelding(undefined);
    }
  }, [formErrors.medlemskapsperioder]);

  useEffect(() => {
    if (redigerbart && aarsavregningResponse?.nyttGrunnlag) {
      if (aarsavregningResponse.nyttGrunnlag?.avgift.totalAvgift !== aarsavregningResponse.avregning?.nyttTotalbeloep) {
        Api.Aarsavregning.oppdaterTotalAvgift(
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
    medlemskapsperiode: Medlemskapsperiode,
    index: number,
    previousMedlemskapsperioder: Medlemskapsperiode[],
  ) => {
    const periodeRequest = {
      fomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato, "") as string,
      tomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato, "") as string,
      trygdedekning: medlemskapsperiode.trygdedekning,
      bestemmelse: medlemskapsperiode.bestemmelse,
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
    } as OppdaterMedlemskapsperiode;

    const previousPerioderIndex = previousMedlemskapsperioder[index];

    if (
      previousPerioderIndex.id === ULAGRET_MEDLEMSKAPSPERIODE_ID ||
      previousPerioderIndex.fomDato !== medlemskapsperiode.fomDato ||
      previousPerioderIndex.tomDato !== medlemskapsperiode.tomDato ||
      previousPerioderIndex.bestemmelse !== medlemskapsperiode.bestemmelse ||
      previousPerioderIndex.trygdedekning !== medlemskapsperiode.trygdedekning
    ) {
      try {
        const response: any = await (medlemskapsperiode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID
          ? Api.MedlemAvFolketrygden.Medlemskapsperioder.opprettMedlemskapsperioder(behandlingID, periodeRequest)
          : Api.MedlemAvFolketrygden.Medlemskapsperioder.oppdaterMedlemskapsperioder(
              behandlingID,
              medlemskapsperiode.id,
              periodeRequest,
            ));

        return response;
      } catch (error) {
        setMedlemskapsperiodeFeilmelding("Feil ved lagring av medlemskapsperiode");
        console.error("Feil ved lagring av medlemskapsperiode:", error);
        return undefined;
      }
    }

    return undefined;
  };

  const debouncedLagreMedlemskapsperioder = useCallback(
    Utils._debounce(async (medlemskapsperioderFormValues, previousMedlemskapsperioder) => {
      const erMedlemskapsperioderGyldig = await trigger("medlemskapsperioder");
      if (erMedlemskapsperioderGyldig) {
        const nyeLagredeMedlemskapsperioder: { formValuesIndex: number; lagretPeriode: Medlemskapsperiode }[] = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const [index, periode] of medlemskapsperioderFormValues.entries()) {
          const lagretPeriode = await lagreMedlemskapsperiodeHvisEndret(periode, index, previousMedlemskapsperioder);
          if (lagretPeriode)
            nyeLagredeMedlemskapsperioder.push({
              formValuesIndex: index,
              lagretPeriode: lagretPeriode as Medlemskapsperiode,
            });
        }

        if (nyeLagredeMedlemskapsperioder.length > 0) {
          setFeilmelding(undefined);
          const freshFormValues = watch();
          // Revalider så feilmeldinger forsvinner før beregning
          const erGyldigSkjema = await trigger();
          if (erGyldigSkjema) {
            await handleBeregnTrygdeavgiftsperioder(freshFormValues);
          }
          console.log("context fra lagring", medlemskapsperiodeContext, medlemskapstypeErPliktigContext);

          setValue(
            "medlemskapsperioder",
            medlemskapsperioderFormValues.map((periode: any, index: number) => {
              const lagretPeriodeMedID = nyeLagredeMedlemskapsperioder.find(
                (backendPeriode: any) => backendPeriode.formValuesIndex === index,
              );
              if (lagretPeriodeMedID) {
                return {
                  ...periode,
                  medlemskapstype: lagretPeriodeMedID.lagretPeriode.medlemskapstype,
                  id: lagretPeriodeMedID.lagretPeriode.id,
                };
              }
              return periode;
            }),
          );
        }
      }
    }, 1000),
    [initiellBeregningUtført],
  );

  const medlemskapsperioderHarBrukerendringer = (currentArray: any[], prevArray: any[]) => {
    if (currentArray.length !== prevArray.length) {
      return false;
    }

    // Kun plukk ut de spesifikke feltene vi bryr oss om
    const currentArrayRelevantFields = currentArray.map(({ fomDato, tomDato, bestemmelse, trygdedekning }) => ({
      fomDato,
      tomDato,
      bestemmelse,
      trygdedekning,
    }));

    const prevArrayRelevantFields = prevArray.map(({ fomDato, tomDato, bestemmelse, trygdedekning }) => ({
      fomDato,
      tomDato,
      bestemmelse,
      trygdedekning,
    }));

    // Sorter arrayene etter fomDato
    const sortByFomDato = (a: any, b: any) => {
      if (!a.fomDato || !b.fomDato) return 0;
      return a.fomDato.localeCompare(b.fomDato);
    };

    currentArrayRelevantFields.sort(sortByFomDato);
    prevArrayRelevantFields.sort(sortByFomDato);

    // Bruker Lodash's deep comparison kun for de spesifikke feltene
    return Utils._isEqual(currentArrayRelevantFields, prevArrayRelevantFields) === false;
  };

  useEffect(() => {
    const lagreMedlemskapsperioder = async () => {
      if (redigerbart) {
        setMedlemskapsperiodeFeilmelding(undefined);
        if (medlemskapsperioder.length !== medlemskapsperioderPrevLength.current) {
          medlemskapsperioderPrevLength.current = medlemskapsperioder.length;
          return;
        }

        if (!medlemskapsperioderHarBrukerendringer(medlemskapsperioder, prevMedlemskapsperioder.current)) {
          prevMedlemskapsperioder.current = medlemskapsperioder;
          console.log("Ingen brukerendringer, ingen lagring");
          return;
        }

        const erGyldigSkjema = await trigger("medlemskapsperioder");

        if (!erGyldigSkjema) {
          console.log("Skjemaet er ikke gyldig, ingen lagring");
          return;
        }

        const randomTall = Math.floor(Math.random() * 1000);
        console.log("forrige medlemskapsperioder ", randomTall.toString(), prevMedlemskapsperioder.current);
        console.log("nåværende medlemskapsperioder ", randomTall.toString(), medlemskapsperioder);

        console.log("Lagrer medlemskapsperioder nå.");

        debouncedLagreMedlemskapsperioder(medlemskapsperioder, prevMedlemskapsperioder.current);
        prevMedlemskapsperioder.current = medlemskapsperioder;
      }
    };

    lagreMedlemskapsperioder();
  }, [medlemskapsperioder]);

  const leggTilDefaultMedlemskapsperiode = () => {
    const nyMedlemskapsperiode = DEFAULT_MEDLEMSKAPSPERIODE;
    // @ts-expect-error generisk beskrivelse
    medlemskapsperioderAppend(nyMedlemskapsperiode);
  };

  const slettMedlemskapsperiode = async (index: number) => {
    const periode = medlemskapsperioder[index];

    try {
      if (periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID) {
        medlemskapsperioderRemove(index);
      } else {
        await Api.MedlemAvFolketrygden.Medlemskapsperioder.slettMedlemskapsperiode(behandlingID, periode.id);
        medlemskapsperioderRemove(index);
        dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
      }

      if (await trigger()) {
        setFeilmelding(undefined);
        const freshFormValues = watch();
        await handleBeregnTrygdeavgiftsperioder(freshFormValues);
      }
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
    await Api.Aarsavregning.oppdaterAarsavregning(behandlingid, request, aarsavregningid);
    if (await trigger()) {
      setFeilmelding(undefined);
      const freshFormValues = watch();
      await handleBeregnTrygdeavgiftsperioder(freshFormValues);
    }
  };

  const debouncedOppdaterTotaltForskuddsvisFakturert = useCallback(
    Utils._debounce(
      (request: Api.Aarsavregning.AarsavregningRequest) =>
        handleOppdaterTotaltForskuddsvisFakturert(behandlingID, request, aarsavregningID),
      1000,
    ),
    [behandlingID, aarsavregningID],
  );

  useEffect(() => {
    if (
      redigerbart &&
      prevTotaltForskuddsvisFakturert.current !== totaltForskuddsvisFakturert &&
      (totaltForskuddsvisFakturert || totaltForskuddsvisFakturert === undefined) &&
      totaltForskuddsvisFakturert !== aarsavregningResponse?.avregning?.tidligereFakturertBeloepAvgiftssystem
    ) {
      debouncedOppdaterTotaltForskuddsvisFakturert({
        avregning: {
          tidligereFakturertBeloepAvgiftssystem: totaltForskuddsvisFakturert,
        },
      });
    }

    prevTotaltForskuddsvisFakturert.current = totaltForskuddsvisFakturert;
  }, [totaltForskuddsvisFakturert]);

  const handleBeregnTrygdeavgiftsperioder = useCallback(
    // TODO: Clear state i frontend, nå som vi har slettet alt i backend uansett.
    async (formVerdier: FieldValue<FormValuesProps>) => {
      setBeregningPaagar(true);
      console.log("Beregner trygdeavgiftsperioder", formVerdier);
      await beregnTrygdeavgiftsperioder(formVerdier, {
        behandlingID,
        medlemskapsTypeErPliktig: medlemskapstypeErPliktigContext,
        setFeilmelding,
        setAarsavregningResponse,
      });
      setBeregningPaagar(false);
    },
    [behandlingID, medlemskapstypeErPliktigContext, setFeilmelding, setAarsavregningResponse, aarsavregningID],
  );

  const debounceBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((formVerdier) => handleBeregnTrygdeavgiftsperioder(formVerdier), 1000),
    [handleBeregnTrygdeavgiftsperioder],
  );

  useEffect(() => {
    if (redigerbart && aarsavregningID && initiellBeregningUtført) {
      const beregnHvisSkjemaErGyldig = async () => {
        const erSkjemaGyldig = await trigger();
        if (erSkjemaGyldig) {
          setBeregningPaagar(true);
          setFeilmelding(undefined);
          debounceBeregnTrygdeavgiftsperioder(formValues);
        }
      };

      beregnHvisSkjemaErGyldig();
    }
  }, [inntektskilder, skatteforholdsperioder]);

  const stegErGyldig = Boolean(formIsValid && aarsavregningResponse?.nyttGrunnlag && feilmelding === undefined);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig, oppdaterStatus]);

  const bekreftOnClick = () => {
    if (!harValidertSkjema) {
      trigger();
      setHarValidertSkjema(true);
    }
    if (stegErGyldig && !beregningPaagar) {
      bekreft();
    }
  };

  const trygdeAvgiftSkalIkkeBetalesTilNav =
    medlemskapstypeErPliktigContext && erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder);
  const forskuddsvisFakturertTrygdeavgift =
    (aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift?.totalAvgift ?? 0) > 0;

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
            medlemskapsTypeErPliktig={medlemskapstypeErPliktigContext}
            tittel="Tidligere beregnet trygdeavgift"
          />
        </>
      )}

      <TidligereFakturertIAvgiftssystemetInput
        control={control}
        redigerbart={redigerbart}
        harDeltGrunnlag={harDeltGrunnlag}
      />

      <Nav.Heading className="endelige_opplysninger_heading" level="2">
        Inntekts- og skatteopplysninger for endelig trygdeavgift
      </Nav.Heading>

      <div className="medlemskapsperioder">
        {medlemskapsperioderFields.map((field, index) => (
          <MedlemskapsperiodeSkjema
            key={field.id}
            redigerbart={redigerbart}
            control={control}
            field={field}
            index={index}
            remove={slettMedlemskapsperiode}
            formValues={formValues}
            bestemmelser={initialData.bestemmelser}
            handleUpdate={medlemskapsperioderUpdate}
            handleLeggTil={leggTilDefaultMedlemskapsperiode}
            visLeggTil
            maksVerdi={
              initialData.valgtÅr !== undefined ? new Date(initialData.valgtÅr, 11, 31, 23, 59, 59, 999) : undefined
            }
            minVerdi={initialData.valgtÅr !== undefined ? new Date(initialData.valgtÅr, 0, 1) : undefined}
          />
        ))}
      </div>

      <Skatteforholdsperioder
        defaultPeriode={defaultPeriode}
        formValues={formValues}
        redigerbart={redigerbart}
        remove={skattRemove}
        append={skattAppend}
        control={control}
        fields={skattFields}
      />
      {!trygdeAvgiftSkalIkkeBetalesTilNav && (
        <Inntektskilder
          defaultPeriode={defaultPeriode}
          formValues={formValues}
          redigerbart={redigerbart}
          update={inntektUpdate}
          remove={inntektRemove}
          append={inntektAppend}
          control={control}
          fields={inntektFields}
          medlemskapsTypeErPliktig={medlemskapstypeErPliktigContext}
          skalViseErMaanedsBelopRadioGroup
        />
      )}
      {formIsValid && trygdeAvgiftSkalIkkeBetalesTilNav && (
        <Aarsavregningsmeldinger.TrygdeavgiftSkalIkkeBetalesTilNav />
      )}

      {formIsValid && !beregningPaagar && !feilmelding && (
        <SumArsavregningTabell
          nyTrygdeavgift={aarsavregningResponse?.avregning?.nyttTotalbeloep}
          tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
          tidligereTrygdeavgiftAvgiftssystem={aarsavregningResponse?.avregning?.tidligereFakturertBeloepAvgiftssystem}
        />
      )}

      {formIsValid && !beregningPaagar && !feilmelding && aarsavregningResponse?.nyttGrunnlag && (
        <BeregnetTrygdeavgiftDetaljer
          grunnlag={aarsavregningResponse.nyttGrunnlag}
          medlemskapsTypeErPliktig={medlemskapstypeErPliktigContext}
          tittel="Endelig beregnet trygdeavgift"
        />
      )}

      {medlemskapsperiodeFeilmelding && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {medlemskapsperiodeFeilmelding}
        </Nav.Alert>
      )}

      {feilmelding && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {feilmelding}
        </Nav.Alert>
      )}

      <Nav.Button variant="primary" loading={beregningPaagar} disabled={!redigerbart} onClick={bekreftOnClick}>
        Bekreft og fortsett
      </Nav.Button>
    </div>
  );
}
