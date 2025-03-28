import * as Api from "../../../../../services/api";
import MedlemskapsPerioderTabell from "../komponenter/medlemskapsPerioderTabell";
import "../vurderingAarsavregningInngang.css";
import { useCallback, useEffect, useState, useMemo } from "react";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { useSelector } from "react-redux";
import * as Nav from "../../../../../navFrontend";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";
import { FieldArrayProps, FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Utils from "../../../../../utils";
import MKV from "../../../../../melosyskodeverk";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import aarsavregningMedGrunnlagSchema from "./aarsavregningMedGrunnlagSchema";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import {
  beregnTrygdeavgiftsperioder,
  erBrukerSkattepliktigIHelePerioden,
  fomTomErFyltUt,
  harInntektsKildeType,
  hentMedlemskapsperiodeBestemmelse,
  lagInnvilgetMedlemskapsPeriode,
  mapFeilmelding,
} from "../komponenter/utils";
import TidligereGrunnlagsoversikt from "../komponenter/tidligereGrunnlagsoversikt";
import { Aarsavregningsmeldinger } from "../komponenter/aarsavregningsmeldinger";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";

interface Props {
  initiellData: {
    aarsavregningResponse?: AarsavregningResponse;
    formDefaultValues: FieldValue<FormValuesProps>;
    erAvvik?: boolean;
  };
  bekreft: () => void;
  oppdaterStatus: (isValid: boolean) => void;
}

export function AarsavregningMedGrunnlagForm({ initiellData, bekreft, oppdaterStatus }: Props) {
  const [erAvvik, setErAvvik] = useState<boolean | undefined>(initiellData.erAvvik);
  const [feilmelding, setFeilmelding] = useState<undefined | string>(undefined);
  const [brukerHarBekreftet, setBrukerHarBekreftet] = useState(false);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(
    initiellData.aarsavregningResponse,
  );
  const [beregningPaagar, setBeregningPaagar] = useState(false);
  const [harValidertSkjema, setHarValidertSkjema] = useState(false);

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);

  const medlemskapsperioder = useMemo(
    () => aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder,
    [aarsavregningResponse?.tidligereGrunnlagsopplysninger],
  );
  const innvilgetMedlemskapsperiode = useMemo(
    () => lagInnvilgetMedlemskapsPeriode(medlemskapsperioder),
    [medlemskapsperioder],
  );
  const innvilgetMedlemskapsperiodeBestemmelse = useMemo(
    () => hentMedlemskapsperiodeBestemmelse(false, medlemskapsperioder),
    [medlemskapsperioder],
  );
  const defaultPeriode = useMemo(
    () => ({
      fomDato: Utils.dato.formatterDatoTilNorsk(innvilgetMedlemskapsperiode?.fom),
      tomDato: Utils.dato.formatterDatoTilNorsk(innvilgetMedlemskapsperiode?.tom),
    }),
    [innvilgetMedlemskapsperiode?.fom, innvilgetMedlemskapsperiode?.tom],
  );

  const medlemskapstypeErPliktig = useMemo(
    () => medlemskapsperioder?.every((periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG),
    [medlemskapsperioder],
  );

  const {
    control,
    watch,
    formState: { isValid: formIsValid, isValidating },
    trigger,
  } = useForm({
    resolver: yupResolver(aarsavregningMedGrunnlagSchema),
    context: {
      medlemskapsperiode: innvilgetMedlemskapsperiode,
      medlemskapsTypeErPliktig: medlemskapstypeErPliktig,
      erÅpenSluttDato: false,
      erAvvik,
    },
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: initiellData.formDefaultValues,
  });

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

  const trygdeAvgiftSkalIkkeBetalesTilNav = useMemo(
    () => medlemskapstypeErPliktig && erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder),
    [medlemskapstypeErPliktig, formValues.skatteforholdsperioder],
  );
  const forskuddsvisFakturertTrygdeavgift = useMemo(
    () => (aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift?.totalAvgift ?? 0) > 0,
    [aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift?.totalAvgift],
  );
  const nyttGrunnlagHarTrygdeavgiftsgrunnlag = useMemo(
    () => aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag != null,
    [aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag],
  );

  const handleBeregnTrygdeavgiftsperioder = useCallback(
    async (formVerdier: FieldValue<FormValuesProps>) => {
      await beregnTrygdeavgiftsperioder(formVerdier, {
        behandlingID,
        medlemskapstypeErPliktig,
        setFeilmelding,
        setAarsavregningResponse,
      });
      setBeregningPaagar(false);
    },
    [behandlingID, medlemskapstypeErPliktig, setFeilmelding, setAarsavregningResponse],
  );

  const debounceBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((formVerdier) => handleBeregnTrygdeavgiftsperioder(formVerdier), 2000),
    [handleBeregnTrygdeavgiftsperioder],
  );

  useEffect(() => {
    setBrukerHarBekreftet(false);
    setHarValidertSkjema(false);
  }, [erAvvik]);

  useEffect(() => {
    const skalBeregne =
      redigerbart &&
      aarsavregningID &&
      erAvvik &&
      !isValidating &&
      formIsValid &&
      fomTomErFyltUt(formValues.inntektskilder, formValues.skatteforholdsperioder) &&
      harInntektsKildeType(formValues.inntektskilder, trygdeAvgiftSkalIkkeBetalesTilNav);

    if (skalBeregne) {
      setBeregningPaagar(true);
      setFeilmelding(undefined);
      debounceBeregnTrygdeavgiftsperioder(formValues);
    }
  }, [redigerbart, aarsavregningID, isValidating, formIsValid, debounceBeregnTrygdeavgiftsperioder]);

  const stegErGyldig = useMemo(
    () => erAvvik === false || Boolean(formIsValid && erAvvik && aarsavregningResponse?.nyttGrunnlag && !feilmelding),
    [erAvvik, formIsValid, aarsavregningResponse?.nyttGrunnlag, feilmelding],
  );

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const håndterAvvik = useCallback(
    (value: boolean) => {
      if (!value) {
        Api.Trygdeavgift.slettTrygdeavgiftsperioder(behandlingID).then(() => {
          const totalAvgift = aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift?.totalAvgift;

          if (aarsavregningID && totalAvgift !== undefined) {
            Api.Aarsavregning.oppdaterTotalAvgift(behandlingID, aarsavregningID, totalAvgift).then(
              (res: AarsavregningResponse) => {
                setAarsavregningResponse(res);

                if (res.tidligereGrunnlagsopplysninger) {
                  setBeregningPaagar(true);
                  Api.Trygdeavgift.beregnTrygdeavgiftsperioder(behandlingID, {
                    skatteforholdsperioder:
                      res.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.skatteforholdsperioder,
                    inntektskilder: res.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.inntektskperioder,
                  })
                    .catch((error) => setFeilmelding(mapFeilmelding(error)))
                    .finally(() => {
                      setBeregningPaagar(false);
                    });
                }
              },
            );
          }
        });
      }

      if (aarsavregningID) {
        Api.Aarsavregning.oppdaterAvvik(behandlingID, value, aarsavregningID).then(() => setErAvvik(value));
      }
    },
    [behandlingID, aarsavregningID, aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift?.totalAvgift],
  );

  const håndterBekreft = useCallback(() => {
    if (!harValidertSkjema) {
      trigger();
      setHarValidertSkjema(true);
    }
    setBrukerHarBekreftet(true);
    if (stegErGyldig && !beregningPaagar) {
      console.log("TEST");
      Api.Aarsavregning.oppdaterTotalAvgift(
        behandlingID,
        aarsavregningID,
        aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift,
      ).then((res: AarsavregningResponse) => {
        setAarsavregningResponse(res);
      });
      bekreft();
    }
  }, [harValidertSkjema, trigger, stegErGyldig, beregningPaagar, bekreft]);

  return (
    <>
      {aarsavregningResponse && aarsavregningResponse.tidligereGrunnlagsopplysninger && (
        <>
          <MedlemskapsPerioderTabell
            perioder={aarsavregningResponse.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.medlemskapsperioder}
          />
          <TidligereGrunnlagsoversikt
            skatteforholdsperioder={
              aarsavregningResponse.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.skatteforholdsperioder
            }
            inntektsperioder={
              aarsavregningResponse.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.inntektskperioder
            }
            avgift={aarsavregningResponse.tidligereGrunnlagsopplysninger.avgift}
          />

          {!forskuddsvisFakturertTrygdeavgift && <Aarsavregningsmeldinger.TrygdeavgiftErIkkeForskuddsvisFakturert />}

          <BeregnetTrygdeavgiftDetaljer
            grunnlag={aarsavregningResponse.tidligereGrunnlagsopplysninger}
            medlemskapsTypeErPliktig={medlemskapstypeErPliktig!}
            tittel="Tidligere beregnet trygdeavgift"
          />
        </>
      )}

      <Nav.RadioGroup
        onChange={håndterAvvik}
        value={erAvvik}
        legend="Er det avvik i opplysningene fra skatt eller bruker?"
        readOnly={!redigerbart}
      >
        <Nav.HStack gap="6">
          <Nav.Radio value>Ja</Nav.Radio>
          <Nav.Radio value={false}>Nei</Nav.Radio>
        </Nav.HStack>
      </Nav.RadioGroup>

      {erAvvik && (
        <>
          <Nav.Heading className="endelige_opplysninger_heading" level="2">
            Inntekts- og skatteopplysninger for endelig trygdeavgift
          </Nav.Heading>
          <Skatteforholdsperioder
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
              medlemskapsTypeErPliktig={medlemskapstypeErPliktig!}
              skalViseErMaanedsBelopRadioGroup
              bestemmelse={innvilgetMedlemskapsperiodeBestemmelse}
            />
          )}

          {trygdeAvgiftSkalIkkeBetalesTilNav && <Aarsavregningsmeldinger.TrygdeavgiftSkalIkkeBetalesTilNav />}

          {nyttGrunnlagHarTrygdeavgiftsgrunnlag && formIsValid && !feilmelding && aarsavregningResponse?.avregning && (
            <SumArsavregningTabell
              nyTrygdeavgift={aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift}
              tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
            />
          )}

          {formIsValid && !feilmelding && aarsavregningResponse?.nyttGrunnlag && (
            <BeregnetTrygdeavgiftDetaljer
              grunnlag={aarsavregningResponse.nyttGrunnlag}
              medlemskapsTypeErPliktig={medlemskapstypeErPliktig!}
              tittel="Endelig beregnet trygdeavgift"
            />
          )}
        </>
      )}

      {brukerHarBekreftet && feilmelding && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {feilmelding}
        </Nav.Alert>
      )}

      <Nav.Button variant="primary" loading={beregningPaagar} disabled={!redigerbart} onClick={håndterBekreft}>
        Bekreft og fortsett
      </Nav.Button>
    </>
  );
}
