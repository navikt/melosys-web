import * as Api from "../../../../../services/api";
import MedlemskapsPerioderTabell from "../komponenter/medlemskapsPerioderTabell";
import "../vurderingAarsavregningInngang.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { useSelector } from "react-redux";
import * as Nav from "../../../../../navFrontend";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";
import {
  FieldArrayProps,
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Utils from "../../../../../utils";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import aarsavregningMedGrunnlagSchema from "./aarsavregningMedGrunnlagSchema";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { beregnTrygdeavgiftsperioder, erBrukerSkattepliktigIHelePerioden } from "../komponenter/utils";
import TidligereGrunnlagsoversikt from "../komponenter/tidligereGrunnlagsoversikt";
import { Aarsavregningsmeldinger } from "../komponenter/aarsavregningsmeldinger";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { InitiellData } from "./aarsavregningMedGrunnlag";
import * as Forms from "../../../../../felleskomponenter/forms";
import { mapTilInntektskilderProps, mapTilSkatteforholdProps } from "../aarsavregningHelpers";

interface Props {
  initiellData: InitiellData;
  bekreft: () => void;
  oppdaterStatus: (isValid: boolean) => void;
}

export function AarsavregningMedGrunnlagForm({ initiellData, bekreft, oppdaterStatus }: Props) {
  const [feilmelding, setFeilmelding] = useState<undefined | string>(undefined);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(
    initiellData.aarsavregningResponse,
  );
  const [beregningPaagar, setBeregningPaagar] = useState(false);
  const [harValidertSkjema, setHarValidertSkjema] = useState(false);
  const [previousFormValues, setPreviousFormValues] = useState<any | null>(null);
  const [endrerAvvik, setEndrerAvvik] = useState(false);

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);

  const { innvilgetMedlemskapsperiode, innvilgetMedlemskapsperiodeBestemmelse, medlemskapstypeErPliktig } =
    initiellData;

  const {
    control,
    watch,
    formState: { isValid: formIsValid, isValidating },
    trigger,
    getValues,
  } = useForm({
    resolver: yupResolver(aarsavregningMedGrunnlagSchema),
    context: {
      medlemskapsperiode: innvilgetMedlemskapsperiode,
      medlemskapsTypeErPliktig: medlemskapstypeErPliktig,
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
  const skatteforholdsperioder = watch("skatteforholdsperioder");
  const inntektskilder = watch("inntektskilder");
  const erAvvik = watch("erAvvik");

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
    Utils._debounce(
      (formVerdier, callbackEtterBeregning) =>
        handleBeregnTrygdeavgiftsperioder(formVerdier).finally(() => {
          if (callbackEtterBeregning) callbackEtterBeregning();
        }),
      1500,
    ),
    [handleBeregnTrygdeavgiftsperioder],
  );

  useEffect(() => {
    if (erAvvik !== true || !redigerbart || !aarsavregningID || beregningPaagar || endrerAvvik) {
      return;
    }

    const formState = {
      skatteforholdsperioder: getValues("skatteforholdsperioder").map((skatteforhold: Skatteforhold) => ({
        fomDato: skatteforhold.fomDato,
        tomDato: skatteforhold.tomDato,
        skatteplikttype: skatteforhold.skatteplikttype,
      })),
      inntektskilder: getValues("inntektskilder").map((inntektskilde: Inntektskilde) => ({
        fomDato: inntektskilde.fomDato,
        tomDato: inntektskilde.tomDato,
        kildetype: inntektskilde.kildetype,
        bruttoInntekt: inntektskilde.bruttoInntekt,
        arbAvgBetales: inntektskilde.arbAvgBetales,
        erMaanedsbelop: inntektskilde.erMaanedsbelop,
      })),
    };
    if (!Utils._isEqual(formState, previousFormValues)) {
      const validationTimeout = setTimeout(() => {
        trigger().then((isValid) => {
          if (isValid && formIsValid && !isValidating) {
            setBeregningPaagar(true);
            debounceBeregnTrygdeavgiftsperioder(getValues(), () => {
              setPreviousFormValues(formState);
            });
          }
        });
      }, 300);

      /* eslint-disable-next-line consistent-return */
      return () => {
        clearTimeout(validationTimeout);
      };
    }
  }, [skatteforholdsperioder, erAvvik, inntektskilder, formIsValid, isValidating, endrerAvvik]);

  const stegErGyldig = useMemo(
    () =>
      erAvvik === false ||
      Boolean(formIsValid && erAvvik === true && aarsavregningResponse?.nyttGrunnlag && !feilmelding),
    [erAvvik, formIsValid, aarsavregningResponse?.nyttGrunnlag, feilmelding],
  );

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  useEffect(() => {
    if (redigerbart && aarsavregningResponse?.nyttGrunnlag && aarsavregningID) {
      const { totalAvgift } = aarsavregningResponse.nyttGrunnlag.avgift;
      const nyttTotalbeloep = aarsavregningResponse.avregning?.nyttTotalbeloep;

      if (totalAvgift !== nyttTotalbeloep) {
        Api.Aarsavregning.oppdaterTotalAvgift(behandlingID, aarsavregningID, totalAvgift).then(
          (res: AarsavregningResponse) => {
            setAarsavregningResponse(res);
          },
        );
      }
    }
  }, [
    redigerbart,
    behandlingID,
    aarsavregningID,
    aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift,
    aarsavregningResponse?.avregning?.nyttTotalbeloep,
  ]);

  const håndterAvvik = useCallback(
    (value: boolean) => {
      setEndrerAvvik(true);

      Api.Aarsavregning.oppdaterAvvik(behandlingID, value, aarsavregningID)
        .then((res) => {
          setAarsavregningResponse(res);
          if (!value) {
            setBeregningPaagar(true);
            handleBeregnTrygdeavgiftsperioder({
              skatteforholdsperioder: mapTilSkatteforholdProps(
                res.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.skatteforholdsperioder!,
              ),
              inntektskilder: mapTilInntektskilderProps(
                res.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.inntektskperioder!,
              ),
            }).finally(() => {
              setPreviousFormValues(null);
              setBeregningPaagar(false);
            });
          }
        })
        .finally(() => {
          setEndrerAvvik(false);
        });
    },
    [
      behandlingID,
      aarsavregningID,
      handleBeregnTrygdeavgiftsperioder,
      setBeregningPaagar,
      setFeilmelding,
      setAarsavregningResponse,
      setPreviousFormValues,
      setEndrerAvvik,
    ],
  );

  const håndterBekreft = useCallback(() => {
    if (!harValidertSkjema) {
      trigger();
      setHarValidertSkjema(true);
    }
    if (stegErGyldig && !beregningPaagar && !endrerAvvik) {
      bekreft();
    }
  }, [harValidertSkjema, trigger, stegErGyldig, beregningPaagar, bekreft, endrerAvvik]);

  const trygdeAvgiftSkalIkkeBetalesTilNav =
    medlemskapstypeErPliktig && erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder);
  const forskuddsvisFakturertTrygdeavgift =
    (aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift?.totalAvgift ?? 0) > 0;
  const nyttGrunnlagHarTrygdeavgiftsgrunnlag = aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag != null;

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

      <Forms.RadioGroup
        name="erAvvik"
        control={control}
        legend="Er det avvik i opplysningene fra skatt eller bruker?"
        readOnly={!redigerbart}
        onChange={(value) => {
          håndterAvvik(value);
        }}
      >
        <Nav.HStack gap="6">
          <Nav.Radio value={true}>Ja</Nav.Radio>
          <Nav.Radio value={false}>Nei</Nav.Radio>
        </Nav.HStack>
      </Forms.RadioGroup>

      {erAvvik === true && !endrerAvvik && (
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
              defaultPeriode={innvilgetMedlemskapsperiode}
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

          {nyttGrunnlagHarTrygdeavgiftsgrunnlag &&
            !beregningPaagar &&
            formIsValid &&
            !feilmelding &&
            aarsavregningResponse?.avregning && (
              <SumArsavregningTabell
                nyTrygdeavgift={aarsavregningResponse.avregning.nyttTotalbeloep}
                tidligereTrygdeavgift={aarsavregningResponse.avregning.tidligereFakturertBeloep}
              />
            )}

          {formIsValid && !beregningPaagar && !feilmelding && aarsavregningResponse?.nyttGrunnlag && (
            <BeregnetTrygdeavgiftDetaljer
              grunnlag={aarsavregningResponse.nyttGrunnlag}
              medlemskapsTypeErPliktig={medlemskapstypeErPliktig!}
              tittel="Endelig beregnet trygdeavgift"
            />
          )}
        </>
      )}

      {feilmelding && !beregningPaagar && (
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
