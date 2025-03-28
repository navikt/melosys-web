import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FieldValue, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
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
import BestemmelseSelect from "../komponenter/bestemmelseSelect";
import {
  AarsavregningFormValuesProps,
  DEFAULT_MEDLEMSKAPSPERIODE,
  ULAGRET_MEDLEMSKAPSPERIODE_ID,
} from "./aarsavregningUtenEllerDeltGrunnlag";
import aarsavregningUtenEllerDeltGrunnlagSchema from "./aarsavregningUtenEllerDeltGrunnlagSchema";
import { medlemskapsperioderOperations } from "../../../../../ducks/medlemskapsperioder";

export function AarsavregningForm({
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
  const [medlemskapsperiodeFeilmelding, setMedlemskapsperiodeFeilmelding] = useState<undefined | string>(undefined);
  const [beregningPaagar, setBeregningPaagar] = useState(false);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(
    initiellData.aarsavregningResponse,
  );
  const [trygdedekninger, setTrygdedekninger] = useState<string[]>(initiellData.trygdedekninger || []);
  const [endrerBestemmelse, setEndrerBestemmelse] = useState(false);
  const [harValidertSkjema, setHarValidertSkjema] = useState(false);
  const [lagrerMedlemskapsperioder, setLagrerMedlemskapsperioder] = useState(false);
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
    formState: { isValid: formIsValid, errors: formErrors },
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

  const forrigeTotaltForskuddsvisFakturert = useRef(totaltForskuddsvisFakturert);

  const medlemskapstypeErPliktig = useMemo(() => {
    return medlemskapsperioder
      .filter((periode: Medlemskapsperiode) => periode.id !== ULAGRET_MEDLEMSKAPSPERIODE_ID)
      .every((periode: Medlemskapsperiode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG);
  }, [medlemskapsperioder]);

  const defaultPeriode = useMemo(() => {
    const sorterteGyldigePerioder = medlemskapsperioder
      .filter((periode: Medlemskapsperiode) => periode.fomDato && periode.tomDato)
      .sort(Utils.dato.sorterEtterNorskFomDato);
    const medlemskapsperiodeFomTom = hentMedlemskapsFomTomDato(sorterteGyldigePerioder);

    return {
      fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiodeFomTom?.fom),
      tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiodeFomTom?.tom),
    };
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

  const lagreMedlemskapsperiodeHvisEndret = async (medlemskapsperiode: Medlemskapsperiode, index: number) => {
    const periodeRequest = {
      fomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato, "") as string,
      tomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato, "") as string,
      trygdedekning: medlemskapsperiode.trygdedekning,
      bestemmelse: getValues("bestemmelse"),
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
    } as OppdaterMedlemskapsperiode;

    const lagretMedlemskapsperiode = lagredeMedlemskapsperioder[index];
    const harEndringer =
      !lagretMedlemskapsperiode ||
      medlemskapsperiode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID ||
      medlemskapsperiode.fomDato !== lagretMedlemskapsperiode.fomDato ||
      medlemskapsperiode.tomDato !== lagretMedlemskapsperiode.tomDato ||
      medlemskapsperiode.trygdedekning !== lagretMedlemskapsperiode.trygdedekning;

    if (harEndringer) {
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

  const handleBeregnTrygdeavgiftsperioder = useCallback(
    async (formVerdier: FieldValue<FormValuesProps>) => {
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

  const lagreMedlemskapsperioder = useCallback(
    async (medlemskapsperioderFormValues: Medlemskapsperiode[]) => {
      interface LagredeMedlemskapsperioder extends Medlemskapsperiode {
        formValuesIndex: number;
      }

      const nyeLagredeMedlemskapsperioder: LagredeMedlemskapsperioder[] = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const [index, periode] of medlemskapsperioderFormValues.entries()) {
        const lagretPeriode = await lagreMedlemskapsperiodeHvisEndret(periode, index);
        if (lagretPeriode)
          nyeLagredeMedlemskapsperioder.push({
            ...(lagretPeriode as Medlemskapsperiode),
            formValuesIndex: index,
          });
      }

      if (nyeLagredeMedlemskapsperioder.length > 0) {
        setFeilmelding(undefined);
        // Revalider så feilmeldinger forsvinner før beregning
        const erGyldigSkjema = await trigger();
        if (erGyldigSkjema) {
          await handleBeregnTrygdeavgiftsperioder({
            skatteforholdsperioder: getValues("skatteforholdsperioder"),
            inntektskilder: getValues("inntektskilder"),
          });
        }

        const oppdaterteMedlemskapsperioder = medlemskapsperioderFormValues.map((periode: any, index: number) => {
          const lagretPeriodeMedID = nyeLagredeMedlemskapsperioder.find(
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

        setLagredeMedlemskapsperioder(oppdaterteMedlemskapsperioder);
        setValue("medlemskapsperioder", oppdaterteMedlemskapsperioder);
      }
    },
    [
      trigger,
      handleBeregnTrygdeavgiftsperioder,
      setValue,
      setLagredeMedlemskapsperioder,
      lagreMedlemskapsperiodeHvisEndret,
    ],
  );

  const debouncedLagreMedlemskapsperioder = useCallback(
    Utils._debounce((medlemskapsperioderFormValues, callbackEtterLagring) => {
      lagreMedlemskapsperioder(medlemskapsperioderFormValues).finally(() => {
        if (callbackEtterLagring) callbackEtterLagring();
      });
    }, 1000),
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
      if (redigerbart && !endrerBestemmelse && !lagrerMedlemskapsperioder) {
        setMedlemskapsperiodeFeilmelding(undefined);

        if (medlemskapsperioder.length !== medlemskapsperioderForrigeAntall.current) {
          medlemskapsperioderForrigeAntall.current = medlemskapsperioder.length;
          return;
        }
        if (!medlemskapsperioderHarBrukerendringer(medlemskapsperioder, lagredeMedlemskapsperioder)) {
          return;
        }

        const erGyldigSkjema = await trigger("medlemskapsperioder");
        if (!erGyldigSkjema || !bestemmelse) {
          return;
        }

        setLagrerMedlemskapsperioder(true);
        const medlemskapsperioderTilLagring = [...medlemskapsperioder];

        debouncedLagreMedlemskapsperioder(medlemskapsperioderTilLagring, () => {
          setLagrerMedlemskapsperioder(false);
        });
      }
    };

    lagreMedlemskapsperioderEffect();
  }, [medlemskapsperioder, redigerbart, endrerBestemmelse, bestemmelse, lagrerMedlemskapsperioder]);

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
      if (periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID) {
        medlemskapsperioderRemove(index);
      } else {
        await Api.MedlemAvFolketrygden.Medlemskapsperioder.slettMedlemskapsperiode(behandlingID, periode.id);
        medlemskapsperioderRemove(index);
        dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
      }

      if (await trigger()) {
        setFeilmelding(undefined);
        await handleBeregnTrygdeavgiftsperioder({
          skatteforholdsperioder: getValues("skatteforholdsperioder"),
          inntektskilder: getValues("inntektskilder"),
        });
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
      await handleBeregnTrygdeavgiftsperioder({
        skatteforholdsperioder: getValues("skatteforholdsperioder"),
        inntektskilder: getValues("inntektskilder"),
      });
    }
  };

  const debouncedOppdaterTotaltForskuddsvisFakturert = useCallback(
    Utils._debounce(
      (request: Api.Aarsavregning.AarsavregningRequest) =>
        handleOppdaterTotaltForskuddsvisFakturert(behandlingID, request, aarsavregningID),
      1000,
    ),
    [aarsavregningID],
  );

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

  const debounceBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((formVerdier) => handleBeregnTrygdeavgiftsperioder(formVerdier), 1000),
    [handleBeregnTrygdeavgiftsperioder],
  );

  useEffect(() => {
    if (redigerbart && aarsavregningID && !endrerBestemmelse) {
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

  const stegErGyldig = useMemo(
    () => Boolean(formIsValid && aarsavregningResponse?.nyttGrunnlag && feilmelding === undefined),
    [formIsValid, aarsavregningResponse?.nyttGrunnlag, feilmelding],
  );

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
    medlemskapstypeErPliktig && erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder);
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
            medlemskapsTypeErPliktig={medlemskapstypeErPliktig}
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

      <BestemmelseSelect
        control={control}
        setValue={setValue}
        bestemmelser={initiellData.bestemmelser}
        harDeltGrunnlag={harDeltGrunnlag}
        behandlingID={behandlingID}
        redigerbart={redigerbart}
        setTrygdedekninger={setTrygdedekninger}
        setFeilmelding={setFeilmelding}
        setEndrerBestemmelse={setEndrerBestemmelse}
        lagreMedlemskapsperioderHvisGyldig={lagreMedlemskapsperioderEtterBestemmelseEndringHvisGyldig}
      />

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
            handleLeggTil={leggTilDefaultMedlemskapsperiode}
            visLeggTil
            maksVerdi={
              initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 11, 31, 23, 59, 59, 999) : undefined
            }
            minVerdi={initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 0, 1) : undefined}
            trygdedekninger={trygdedekninger}
            setValue={setValue}
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
          medlemskapsTypeErPliktig={medlemskapstypeErPliktig}
          skalViseErMaanedsBelopRadioGroup
          bestemmelse={bestemmelse}
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
          medlemskapsTypeErPliktig={medlemskapstypeErPliktig}
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
