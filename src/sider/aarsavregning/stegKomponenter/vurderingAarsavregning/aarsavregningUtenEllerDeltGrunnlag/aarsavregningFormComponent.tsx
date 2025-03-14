import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import {
  Medlemskapsperiode,
  OppdaterMedlemskapsperiode,
} from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { FieldValue, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import MKV from "../../../../../melosyskodeverk";
import { hentMedlemskapsFomTomDato } from "../aarsavregningHelpers";
import * as Utils from "../../../../../utils";
import { yupResolver } from "@hookform/resolvers/yup";
import aarsavregningUtenEllerDeltGrunnlagSchema from "./aarsavregningUtenEllerDeltGrunnlagSchema";
import { FieldArrayProps, FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Api from "../../../../../services/api";
import { medlemskapsperioderOperations, medlemskapsperioderTypes } from "../../../../../ducks/medlemskapsperioder";
import { beregnTrygdeavgiftsperioder, erBrukerSkattepliktigIHelePerioden } from "../komponenter/utils";
import MedlemskapsPerioderTabell from "../komponenter/medlemskapsPerioderTabell";
import TidligereGrunnlagsoversikt from "../komponenter/tidligereGrunnlagsoversikt";
import { Aarsavregningsmeldinger } from "../komponenter/aarsavregningsmeldinger";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import { TidligereFakturertIAvgiftssystemetInput } from "../komponenter/tidligereFakturertIAvgiftssystemetInput";
import * as Nav from "../../../../../navFrontend";
import { MedlemskapsperiodeSkjema } from "../komponenter/medlemskapsperiodeSkjema";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import {
  AarsavregningFormValuesProps,
  DEFAULT_MEDLEMSKAPSPERIODE,
  ULAGRET_MEDLEMSKAPSPERIODE_ID,
} from "./aarsavregningUtenEllerDeltGrunnlag";

const { DELVIS_INNVILGET, INNVILGET } = MKV.Koder.innvilgelsesResultat;

const harIdentiskMedlemskapsperiodeLagret = (
  periodeRequest: OppdaterMedlemskapsperiode,
  periodeId: number,
  lagredeMedlemskapsperioder: Medlemskapsperiode[],
) => {
  return lagredeMedlemskapsperioder.some(
    (lagretPeriode) =>
      lagretPeriode.id === periodeId &&
      lagretPeriode.fomDato === periodeRequest.fomDato &&
      lagretPeriode.tomDato === periodeRequest.tomDato &&
      lagretPeriode.bestemmelse === periodeRequest.bestemmelse &&
      lagretPeriode.trygdedekning === periodeRequest.trygdedekning,
  );
};

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
  const [lagredeMedlemskapsperioder, setLagredeMedlemskapsperioder] = useState<Medlemskapsperiode[]>(
    initialData.lagredeMedlemskapsperioder,
  );
  const [initiellBeregningUtført, setInitiellBeregningUtført] = useState(false);
  const [harValidertSkjema, setHarValidertSkjema] = useState(false);

  // Redux selectors
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);
  const dispatch = useDispatch();

  const medlemskapsTypeErPliktig = lagredeMedlemskapsperioder?.every(
    (periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG,
  );
  const innvilgetMedlemskapsperiode = hentMedlemskapsFomTomDato(lagredeMedlemskapsperioder);

  const defaultPeriode = {
    fomDato: Utils.dato.formatterDatoTilNorsk(innvilgetMedlemskapsperiode?.fom),
    tomDato: Utils.dato.formatterDatoTilNorsk(innvilgetMedlemskapsperiode?.tom),
  };

  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { isValid: formIsValid, isDirty },
  } = useForm({
    resolver: yupResolver(aarsavregningUtenEllerDeltGrunnlagSchema),
    context: {
      medlemskapsperiode: innvilgetMedlemskapsperiode,
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

  const prevTotaltForskuddsvisFakturert = useRef(totaltForskuddsvisFakturert);

  // Kjør initiell beregning
  useEffect(() => {
    if (formIsValid && !initiellBeregningUtført) {
      handleBeregnTrygdeavgiftsperioder(watch()).then(() => {
        setInitiellBeregningUtført(true);
      });
    }
  }, [formIsValid]);

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

  const lagreMedlemskapsperiode = async (medlemskapsperiode: Medlemskapsperiode) => {
    const periodeRequest = {
      fomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato, "") as string,
      tomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato, "") as string,
      trygdedekning: medlemskapsperiode.trygdedekning,
      bestemmelse: medlemskapsperiode.bestemmelse,
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
    } as OppdaterMedlemskapsperiode;

    if (!harIdentiskMedlemskapsperiodeLagret(periodeRequest, medlemskapsperiode.id, lagredeMedlemskapsperioder)) {
      const response: any = await (medlemskapsperiode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID
        ? Api.MedlemAvFolketrygden.Medlemskapsperioder.opprettMedlemskapsperioder(behandlingID, periodeRequest)
        : Api.MedlemAvFolketrygden.Medlemskapsperioder.oppdaterMedlemskapsperioder(
            behandlingID,
            medlemskapsperiode.id,
            periodeRequest,
          ));

      if (response.type === medlemskapsperioderTypes.FEILET) {
        setMedlemskapsperiodeFeilmelding(response?.data?.data?.message);
      }
    }
  };

  const debouncedLagreMedlemskapsperioder = useCallback(
    Utils._debounce(async (medlemskapsperioderFormValues) => {
      if (!isDirty) return;

      const isValid = await trigger("medlemskapsperioder");
      if (isValid) {
        // eslint-disable-next-line no-restricted-syntax
        for (const periode of medlemskapsperioderFormValues) {
          await lagreMedlemskapsperiode(periode);
        }

        Api.MedlemAvFolketrygden.Medlemskapsperioder.hentMedlemskapsperioder(behandlingID).then(
          (medlemskapsperioderRes) => {
            const innvilgedeMedlemskapsperioder = medlemskapsperioderRes.filter(
              (periode: Medlemskapsperiode) =>
                periode.innvilgelsesResultat === INNVILGET || periode.innvilgelsesResultat === DELVIS_INNVILGET,
            );
            setLagredeMedlemskapsperioder(innvilgedeMedlemskapsperioder);

            if (
              medlemskapsperioderFormValues.some(
                (periode: Medlemskapsperiode) => periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID,
              )
            ) {
              setValue(
                "medlemskapsperioder",
                medlemskapsperioderFormValues.map((periode: Medlemskapsperiode) => {
                  if (periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID) {
                    const innvilgetPeriode = innvilgedeMedlemskapsperioder.find(
                      (lagretPeriode: Medlemskapsperiode) =>
                        lagretPeriode.fomDato === Utils.dato.formatterDatoTilISO(periode.fomDato, ""),
                    );
                    return { ...periode, id: innvilgetPeriode?.id };
                  }
                  return periode;
                }),
                { shouldValidate: false, shouldDirty: false },
              );
            }
          },
        );

        if (initiellBeregningUtført && (await trigger())) {
          setFeilmelding(undefined);
          await handleBeregnTrygdeavgiftsperioder(watch());
        }
      }
    }, 1000),
    [initiellBeregningUtført, isDirty],
  );

  useEffect(() => {
    if (redigerbart && isDirty) {
      setMedlemskapsperiodeFeilmelding(undefined);
      if (medlemskapsperioder.length !== medlemskapsperioderPrevLength.current) {
        medlemskapsperioderPrevLength.current = medlemskapsperioder.length;
        return;
      }
      debouncedLagreMedlemskapsperioder(medlemskapsperioder);
    }
  }, [medlemskapsperioder, isDirty]);

  const handleLeggTilMedlemskapsperiode = () => {
    const nyMedlemskapsperiode = DEFAULT_MEDLEMSKAPSPERIODE;
    // @ts-expect-error generisk beskrivelse
    medlemskapsperioderAppend(nyMedlemskapsperiode);
  };

  const handleSlett = async (index: number) => {
    const periode = medlemskapsperioder[index];

    if (periode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID) {
      medlemskapsperioderRemove(index);
    } else {
      Api.MedlemAvFolketrygden.Medlemskapsperioder.slettMedlemskapsperiode(behandlingID, periode.id).then(() => {
        medlemskapsperioderRemove(index);
        dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
      });
    }
    if (await trigger()) {
      setFeilmelding(undefined);
      await handleBeregnTrygdeavgiftsperioder(watch());
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
      await handleBeregnTrygdeavgiftsperioder(watch());
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
      isDirty &&
      prevTotaltForskuddsvisFakturert.current !== totaltForskuddsvisFakturert &&
      (totaltForskuddsvisFakturert || totaltForskuddsvisFakturert === "") &&
      totaltForskuddsvisFakturert !== aarsavregningResponse?.avregning?.tidligereFakturertBeloepAvgiftssystem
    ) {
      debouncedOppdaterTotaltForskuddsvisFakturert({
        avregning: {
          tidligereFakturertBeloepAvgiftssystem: totaltForskuddsvisFakturert,
        },
      });
    }

    prevTotaltForskuddsvisFakturert.current = totaltForskuddsvisFakturert;
  }, [totaltForskuddsvisFakturert, isDirty]);

  const handleBeregnTrygdeavgiftsperioder = useCallback(
    async (formVerdier: FieldValue<FormValuesProps>) => {
      setBeregningPaagar(true);
      await beregnTrygdeavgiftsperioder(formVerdier, {
        behandlingID,
        medlemskapsTypeErPliktig,
        setFeilmelding,
        setAarsavregningResponse,
      });
      setBeregningPaagar(false);
    },
    [behandlingID, medlemskapsTypeErPliktig, setFeilmelding, setAarsavregningResponse, aarsavregningID],
  );

  const debounceBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((formVerdier) => handleBeregnTrygdeavgiftsperioder(formVerdier), 1000),
    [handleBeregnTrygdeavgiftsperioder],
  );

  useEffect(() => {
    if (
      redigerbart &&
      aarsavregningID &&
      initiellBeregningUtført &&
      isDirty
    ) {
      const beregnHvisSkjemaErGyldig = async () => {
        const isValid = await trigger();
        if (isValid) {
          setBeregningPaagar(true);
          setFeilmelding(undefined);
          debounceBeregnTrygdeavgiftsperioder(formValues);
        }
      };
      beregnHvisSkjemaErGyldig();
    }
  }, [inntektskilder, skatteforholdsperioder, isDirty]);

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
    medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder);
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
            medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
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
            remove={handleSlett}
            formValues={formValues}
            bestemmelser={initialData.bestemmelser}
            handleUpdate={medlemskapsperioderUpdate}
            handleLeggTil={handleLeggTilMedlemskapsperiode}
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
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
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
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
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
