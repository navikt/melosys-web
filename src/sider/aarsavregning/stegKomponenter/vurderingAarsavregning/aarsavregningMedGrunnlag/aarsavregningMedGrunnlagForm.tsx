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
import { beregnTrygdeavgiftsperioder, erBrukerSkattepliktigIHelePerioden, mapFeilmelding } from "../komponenter/utils";
import TidligereGrunnlagsoversikt from "../komponenter/tidligereGrunnlagsoversikt";
import { Aarsavregningsmeldinger } from "../komponenter/aarsavregningsmeldinger";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { InitiellData } from "./aarsavregningMedGrunnlag";
import * as Forms from "../../../../../felleskomponenter/forms";

interface Props {
  initiellData: InitiellData;
  bekreft: () => void;
  oppdaterStatus: (isValid: boolean) => void;
}

export function AarsavregningMedGrunnlagForm({ initiellData, bekreft, oppdaterStatus }: Props) {
  const [feilmelding, setFeilmelding] = useState<undefined | string>(undefined);
  const [brukerHarBekreftet, setBrukerHarBekreftet] = useState(false);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(
    initiellData.aarsavregningResponse,
  );
  const [beregningPaagar, setBeregningPaagar] = useState(false);
  const [harValidertSkjema, setHarValidertSkjema] = useState(false);
  const [previousFormValues, setPreviousFormValues] = useState<string | null>(null);

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
  const erAvvikForm = watch("erAvvik");

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
  }, [erAvvikForm]);

  useEffect(() => {
    if (erAvvikForm !== true || !redigerbart || !aarsavregningID || beregningPaagar) {
      return;
    }

    const formState = {
      skatteforholdsperioder:
        skatteforholdsperioder?.map((skatteforhold: Skatteforhold) => ({
          fomDato: skatteforhold.fomDato,
          tomDato: skatteforhold.tomDato,
          skatteplikttype: skatteforhold.skatteplikttype,
        })) || [],
      inntektskilder:
        inntektskilder?.map((inntektskilde: Inntektskilde) => ({
          fomDato: inntektskilde.fomDato,
          tomDato: inntektskilde.tomDato,
          kildetype: inntektskilde.kildetype,
          bruttoInntekt: inntektskilde.bruttoInntekt,
          arbAvgBetales: inntektskilde.arbAvgBetales,
          erMaanedsbelop: inntektskilde.erMaanedsbelop,
        })) || [],
    };

    // Serialize to compare with previous state
    const stateStr = JSON.stringify(formState);

    // Only process if form state has changed
    if (stateStr !== previousFormValues) {
      setPreviousFormValues(stateStr);

      const validationTimeout = setTimeout(() => {
        trigger().then((isValid) => {
          if (isValid && formIsValid && !isValidating) {
            setBeregningPaagar(true);
            debounceBeregnTrygdeavgiftsperioder(getValues());
          }
        });
      }, 500);

      return () => clearTimeout(validationTimeout);
    }
  }, [
    skatteforholdsperioder,
    inntektskilder,
    erAvvikForm,
    redigerbart,
    formIsValid,
    isValidating,
    aarsavregningID,
    beregningPaagar,
  ]);

  const stegErGyldig = useMemo(
    () =>
      erAvvikForm === false ||
      Boolean(formIsValid && erAvvikForm === true && aarsavregningResponse?.nyttGrunnlag && !feilmelding),
    [erAvvikForm, formIsValid, aarsavregningResponse?.nyttGrunnlag, feilmelding],
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
      Api.Aarsavregning.oppdaterAvvik(behandlingID, value, aarsavregningID);
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
      bekreft();
    }
  }, [harValidertSkjema, trigger, stegErGyldig, beregningPaagar, bekreft]);

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

      {erAvvikForm === true && (
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

          {nyttGrunnlagHarTrygdeavgiftsgrunnlag && formIsValid && !feilmelding && aarsavregningResponse?.avregning && (
            <SumArsavregningTabell
              nyTrygdeavgift={aarsavregningResponse.avregning.nyttTotalbeloep}
              tidligereTrygdeavgift={aarsavregningResponse.avregning.tidligereFakturertBeloep}
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
