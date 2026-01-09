import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import {
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Api from "../../../../../services/api";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import * as Utils from "../../../../../utils";
import { Aarsavregningsmeldinger } from "../komponenter/aarsavregningsmeldinger";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import { BorderedFormContainer } from "../komponenter/borderedFormContainer";
import { EndeligAvgiftValgRadioGroup } from "../komponenter/endeligAvgiftValgRadioGroup";
import { ManuellAvgiftFormPart } from "../komponenter/manuellAvgiftFormPart";
import { MedlemskapsperioderDisplay } from "../komponenter/medlemskapsperiodeDisplay";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import { harInnvilgelsesResultat } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { beregnTrygdeavgiftsperioder, erBrukerSkattepliktigIHelePerioden, finnMedlemskapsperiode } from "../utils";
import "../vurderingAarsavregningInngang.less";
import { InitiellData } from "./aarsavregningMedGrunnlag";
import aarsavregningMedGrunnlagSchema from "./aarsavregningMedGrunnlagSchema";
import { Feilmelding, finnAktivFeilmelding } from "./valideringsfeil";

const { OPPLYSNINGER_ENDRET, MANUELL_ENDELIG_AVGIFT } = MKV.Koder.endeligAvgiftValg;

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
  const [beregningPaagar, setBeregningPaagar] = useState(false);
  const [previousFormValues, setPreviousFormValues] = useState<MappedFormState | null>(null);
  const [endrerEndeligAvgiftValg, setEndrerEndeligAvgiftValg] = useState(false);
  const [debouncedBeregningPagaar, setDebouncedBeregningPagaar] = useState(false);
  const [arrayValideringsfeil, setArrayValideringsfeil] = useState<string | undefined>(undefined);

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as number;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);

  const { innvilgetMedlemskapsperioder, medlemskapstypeErPliktig } = initiellData;

  const medlemskapsperiode = useMemo(() => {
    return finnMedlemskapsperiode(innvilgetMedlemskapsperioder);
  }, [innvilgetMedlemskapsperioder]);

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
      medlemskapsperiode,
      medlemskapsTypeErPliktig: medlemskapstypeErPliktig,
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

  const formValues = watch();
  const skatteforholdsperioder = watch("skatteforholdsperioder");
  const inntektskilder = watch("inntektskilder");
  const endeligAvgiftValg = watch("endeligAvgiftValg");
  const manueltAvgiftBeloep = watch("manueltAvgiftBeloep");
  const debouncedBeregningRef = useRef<ReturnType<typeof Utils._debounce> | null>(null);

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

  const handleBeregnTrygdeavgiftsperioder = useCallback(
    async (formVerdier: FieldValue<FormValuesProps>) => {
      await beregnTrygdeavgiftsperioder(formVerdier, {
        behandlingID,
        medlemskapstypeErPliktig,
        setFeilmelding,
        setAarsavregningResponse,
      });
    },
    [medlemskapstypeErPliktig, setFeilmelding, setAarsavregningResponse],
  );

  const debouncedBeregning = useCallback(() => {
    /* eslint-disable-next-line no-console */
    console.log("[debouncedBeregning] debouncedBeregningPagaar set false", debouncedBeregningPagaar);
    setDebouncedBeregningPagaar(false);
    if (
      !redigerbart ||
      !aarsavregningID ||
      endeligAvgiftValg !== OPPLYSNINGER_ENDRET ||
      beregningPaagar ||
      endrerEndeligAvgiftValg
    ) {
      return;
    }

    const formState = mapFormState(getValues("skatteforholdsperioder"), getValues("inntektskilder"));

    if (!Utils._isEqual(formState, previousFormValues) && formIsValid && !isValidating) {
      const aktivFeilmelding = finnAktivFeilmelding({
        skatteforholdsperioder: formState.skatteforholdsperioder,
        inntektskilder: formState.inntektskilder,
        medlemskapsperiodeFomTom: medlemskapsperiode!,
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
    getValues,
    formIsValid,
    isValidating,
    handleBeregnTrygdeavgiftsperioder,
    previousFormValues,
    medlemskapsperiode,
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
      if (redigerbart && aarsavregningID && endeligAvgiftValg === OPPLYSNINGER_ENDRET && !endrerEndeligAvgiftValg) {
        const currentFormState = mapFormState(getValues("skatteforholdsperioder"), getValues("inntektskilder"));

        if (!Utils._isEqual(currentFormState, previousFormValues)) {
          /* eslint-disable-next-line no-console */
          // console.log("[useEffect] currentFormState", currentFormState);
          /* eslint-disable-next-line no-console */
          // console.log("[useEffect] previousFormValues", previousFormValues);
          setDebouncedBeregningPagaar(true);
          debouncedBeregningRef.current();
        } else {
          setDebouncedBeregningPagaar(false);
          setArrayValideringsfeil(undefined);
        }
      }
    }
  }, [skatteforholdsperioder, endeligAvgiftValg, inntektskilder, formIsValid, isValidating, endrerEndeligAvgiftValg]);

  const stegErGyldig = useMemo(
    () =>
      Boolean(
        formIsValid &&
          endeligAvgiftValg === OPPLYSNINGER_ENDRET &&
          aarsavregningResponse?.nyttTrygdeavgiftsGrunnlag &&
          !feilmelding &&
          !arrayValideringsfeil,
      ) ||
      Boolean(
        endeligAvgiftValg === MANUELL_ENDELIG_AVGIFT &&
          aarsavregningResponse?.avregning?.manueltAvgiftBeloep !== undefined &&
          aarsavregningResponse?.avregning?.manueltAvgiftBeloep !== null &&
          formIsValid &&
          !feilmelding,
      ),
    [endeligAvgiftValg, formIsValid, aarsavregningResponse, feilmelding, arrayValideringsfeil],
  );

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  useEffect(() => {
    if (redigerbart && aarsavregningResponse?.nyttTrygdeavgiftsGrunnlag && aarsavregningID) {
      const { totalAvgift } = aarsavregningResponse.nyttTrygdeavgiftsGrunnlag.avgift;
      const beregnetAvgiftBelop = aarsavregningResponse.avregning?.beregnetAvgiftBelop;

      if (totalAvgift !== beregnetAvgiftBelop) {
        Api.Aarsavregning.oppdaterBeregnetAvgiftBeloep(behandlingID, aarsavregningID, totalAvgift).then(
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
    aarsavregningResponse?.nyttTrygdeavgiftsGrunnlag?.avgift.totalAvgift,
    aarsavregningResponse?.avregning?.beregnetAvgiftBelop,
  ]);

  const handleEndeligAvgiftValgChange = useCallback(
    (value: string) => {
      setEndrerEndeligAvgiftValg(true);
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
    [aarsavregningID, setAarsavregningResponse, setEndrerEndeligAvgiftValg, Api.Aarsavregning, behandlingID, setValue],
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

    if (stegErGyldig && !beregningPaagar && !endrerEndeligAvgiftValg && !debouncedBeregningPagaar) {
      bekreft();
    }
  }, [trigger, stegErGyldig, beregningPaagar, bekreft, endrerEndeligAvgiftValg, debouncedBeregningPagaar]);

  const trygdeAvgiftSkalIkkeBetalesTilNav =
    medlemskapstypeErPliktig && erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder);

  const tidligereAarsavregningErManueltBeregnet = Boolean(
    aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger?.tidligereÅrsavregningManueltAvgiftBeloep,
  );

  const minDate = initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 0, 1) : undefined;
  const maxDate =
    initiellData.valgtÅr !== undefined ? new Date(initiellData.valgtÅr, 11, 31, 23, 59, 59, 999) : undefined;

  return (
    <>
      <EndeligAvgiftValgRadioGroup
        control={control}
        redigerbart={redigerbart}
        handleEndeligAvgiftValgChange={handleEndeligAvgiftValgChange}
        endeligAvgiftValg={endeligAvgiftValg}
      />

      {endeligAvgiftValg === OPPLYSNINGER_ENDRET && !endrerEndeligAvgiftValg && (
        <BorderedFormContainer>
          <Nav.Heading className="endelige_opplysninger_heading" level="2">
            Inntekts- og skatteopplysninger for endelig trygdeavgift
          </Nav.Heading>

          <MedlemskapsperioderDisplay medlemskapsperioder={innvilgetMedlemskapsperioder} />

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
              defaultPeriode={medlemskapsperiode}
              formValues={formValues}
              redigerbart={redigerbart && !beregningPaagar}
              update={inntektUpdate}
              remove={inntektRemove}
              append={inntektAppend}
              control={control}
              fields={inntektFields}
              medlemskapsTypeErPliktig={medlemskapstypeErPliktig!}
              skalViseErMaanedsBelopRadioGroup
              bestemmelse={
                innvilgetMedlemskapsperioder[0] && harInnvilgelsesResultat(innvilgetMedlemskapsperioder[0])
                  ? innvilgetMedlemskapsperioder[0].bestemmelse
                  : undefined
              }
              minDate={minDate}
              maxDate={maxDate}
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
                  />
                </Nav.ExpansionCard.Content>
              </Nav.ExpansionCard>
            )}

          {arrayValideringsfeil && <Feilmelding type={arrayValideringsfeil} />}
        </BorderedFormContainer>
      )}

      {formIsValid &&
        !debouncedBeregningPagaar &&
        !beregningPaagar &&
        !feilmelding &&
        !arrayValideringsfeil &&
        aarsavregningResponse?.avregning &&
        endeligAvgiftValg === OPPLYSNINGER_ENDRET && (
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
        loading={beregningPaagar || debouncedBeregningPagaar}
        disabled={!redigerbart}
        onClick={håndterBekreft}
      >
        Bekreft og fortsett
      </Nav.Button>
    </>
  );
}
