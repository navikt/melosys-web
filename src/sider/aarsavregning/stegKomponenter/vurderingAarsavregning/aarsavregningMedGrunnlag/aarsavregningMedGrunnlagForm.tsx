import * as Api from "../../../../../services/api";
import MedlemskapsPerioderTabell from "../komponenter/medlemskapsPerioderTabell";
import "../vurderingAarsavregningInngang.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { mapTilInntektskilderProps, mapTilSkatteforholdProps } from "../aarsavregningHelpers";
import { Feilmelding, finnAktivFeilmelding } from "./valideringsfeil";
import MKV from "../../../../../melosyskodeverk";
import { BehandlingsvalgRadioGroup } from "../komponenter/behandlingsvalgRadioGroup";
import { ManuellAvgiftFormPart } from "../komponenter/manuellAvgiftFormPart";

const { OPPLYSNINGER_ENDRET, OPPLYSNINGER_UENDRET, MANUELL_ENDELIG_AVGIFT } = MKV.Koder.aarsavregningBehandlingsvalg;

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
  const [previousFormValues, setPreviousFormValues] = useState<any | null>(null);
  const [endrerBehandlingsvalg, setEndrerBehandlingsvalg] = useState(false);
  const [debouncedBeregningPagaar, setDebouncedBeregningPagaar] = useState(false);
  const [arrayValideringsfeil, setArrayValideringsfeil] = useState<string | undefined>(undefined);

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
    setValue,
  } = useForm({
    resolver: yupResolver(aarsavregningMedGrunnlagSchema),
    context: {
      medlemskapsperiode: innvilgetMedlemskapsperiode,
      medlemskapsTypeErPliktig: medlemskapstypeErPliktig,
    },
    mode: "onChange",
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
  const behandlingsvalg = watch("behandlingsvalg");
  const manueltAvgiftBeloep = watch("manueltAvgiftBeloep");
  const debouncedBeregningRef = useRef<any>(null);

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
    console.log("[debouncedBeregning] debouncedBeregningPagaar set false", debouncedBeregningPagaar);
    setDebouncedBeregningPagaar(false);
    if (
      !redigerbart ||
      !aarsavregningID ||
      behandlingsvalg !== OPPLYSNINGER_ENDRET ||
      beregningPaagar ||
      endrerBehandlingsvalg
    ) {
      return;
    }

    const formState = mapFormState(getValues("skatteforholdsperioder"), getValues("inntektskilder"));

    if (!Utils._isEqual(formState, previousFormValues) && formIsValid && !isValidating) {
      const aktivFeilmelding = finnAktivFeilmelding({
        skatteforholdsperioder: formState.skatteforholdsperioder,
        inntektskilder: formState.inntektskilder,
        medlemskapsperiode: innvilgetMedlemskapsperiode,
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
    behandlingsvalg,
    beregningPaagar,
    endrerBehandlingsvalg,
    getValues,
    formIsValid,
    isValidating,
    handleBeregnTrygdeavgiftsperioder,
    previousFormValues,
    innvilgetMedlemskapsperiode,
    medlemskapstypeErPliktig,
  ]);

  // Lager en ny debounce funksjon når beregning callback endres
  useEffect(() => {
    debouncedBeregningRef.current = Utils._debounce(debouncedBeregning, 350);

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
      if (redigerbart && aarsavregningID && behandlingsvalg === OPPLYSNINGER_ENDRET && !endrerBehandlingsvalg) {
        const currentFormState = mapFormState(getValues("skatteforholdsperioder"), getValues("inntektskilder"));

        if (!Utils._isEqual(currentFormState, previousFormValues)) {
          console.log("[useEffect] currentFormState", currentFormState);
          console.log("[useEffect] previousFormValues", previousFormValues);
          setDebouncedBeregningPagaar(true);
          debouncedBeregningRef.current();
        } else {
          setDebouncedBeregningPagaar(false);
          setArrayValideringsfeil(undefined);
        }
      }
    }
  }, [skatteforholdsperioder, behandlingsvalg, inntektskilder, formIsValid, isValidating, endrerBehandlingsvalg]);

  const stegErGyldig = useMemo(
    () =>
      behandlingsvalg === OPPLYSNINGER_UENDRET ||
      Boolean(
        formIsValid &&
          behandlingsvalg === OPPLYSNINGER_ENDRET &&
          aarsavregningResponse?.nyttGrunnlag &&
          !feilmelding &&
          !arrayValideringsfeil,
      ) ||
      Boolean(
        behandlingsvalg === MANUELL_ENDELIG_AVGIFT &&
          aarsavregningResponse?.avregning?.manueltAvgiftBeloep &&
          !feilmelding,
      ),
    [behandlingsvalg, formIsValid, aarsavregningResponse?.nyttGrunnlag, feilmelding, arrayValideringsfeil],
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

  const handleBehandlingsvalgChange = useCallback(
    (value: string) => {
      setEndrerBehandlingsvalg(true);

      Api.Aarsavregning.oppdaterBehandlingsvalg(behandlingID, value, aarsavregningID)
        .then((res) => {
          setAarsavregningResponse(res);
          setValue("manueltAvgiftBeloep", "", { shouldValidate: false, shouldDirty: false });
          // TODO: Beregning skal ikke være nødvendig. API må gjøre opprydning ved endring av behandlingsvalg
          if (value === OPPLYSNINGER_UENDRET || value === MANUELL_ENDELIG_AVGIFT) {
            setBeregningPaagar(true);
            const skatteforholdFraGrunnlag =
              res.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.skatteforholdsperioder;
            const inntektskilderFraGrunnlag =
              res.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.inntektskperioder;
            handleBeregnTrygdeavgiftsperioder({
              skatteforholdsperioder: mapTilSkatteforholdProps(skatteforholdFraGrunnlag),
              inntektskilder: mapTilInntektskilderProps(inntektskilderFraGrunnlag),
            }).finally(() => {
              setPreviousFormValues(null);
              setBeregningPaagar(false);
            });
          }
        })
        .finally(() => {
          setEndrerBehandlingsvalg(false);
        });
    },
    [
      aarsavregningID,
      handleBeregnTrygdeavgiftsperioder,
      setBeregningPaagar,
      setAarsavregningResponse,
      setPreviousFormValues,
      setEndrerBehandlingsvalg,
      Api.Aarsavregning,
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
    [aarsavregningID],
  );

  const håndterBekreft = useCallback(() => {
    // noinspection JSIgnoredPromiseFromCall
    trigger();

    if (stegErGyldig && !beregningPaagar && !endrerBehandlingsvalg && !debouncedBeregningPagaar) {
      bekreft();
    }
  }, [trigger, stegErGyldig, beregningPaagar, bekreft, endrerBehandlingsvalg, debouncedBeregningPagaar]);

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

      <BehandlingsvalgRadioGroup
        control={control}
        redigerbart={redigerbart}
        handleBehandlingsvalgChange={handleBehandlingsvalgChange}
        erMedGrunnlagFlyt={true}
      />

      {behandlingsvalg === OPPLYSNINGER_ENDRET && !endrerBehandlingsvalg && (
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
            !debouncedBeregningPagaar &&
            formIsValid &&
            !feilmelding &&
            !arrayValideringsfeil &&
            aarsavregningResponse?.avregning && (
              <SumArsavregningTabell
                nyTrygdeavgift={aarsavregningResponse.avregning.nyttTotalbeloep}
                tidligereTrygdeavgift={aarsavregningResponse.avregning.tidligereFakturertBeloep}
                harGrunnlagIMelosys
              />
            )}

          {formIsValid &&
            !debouncedBeregningPagaar &&
            !beregningPaagar &&
            behandlingsvalg !== MANUELL_ENDELIG_AVGIFT &&
            !feilmelding &&
            !arrayValideringsfeil &&
            aarsavregningResponse?.nyttGrunnlag && (
              <BeregnetTrygdeavgiftDetaljer
                grunnlag={aarsavregningResponse.nyttGrunnlag}
                medlemskapsTypeErPliktig={medlemskapstypeErPliktig!}
                tittel="Endelig beregnet trygdeavgift"
              />
            )}

          {arrayValideringsfeil && <Feilmelding type={arrayValideringsfeil} />}
        </>
      )}

      {feilmelding && !beregningPaagar && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {feilmelding}
        </Nav.Alert>
      )}

      <ManuellAvgiftFormPart
        control={control}
        redigerbart={redigerbart}
        behandlingsvalg={behandlingsvalg}
        manueltAvgiftBeloep={manueltAvgiftBeloep}
        debouncedOppdaterManueltAvgiftBeloep={debouncedOppdaterManueltAvgiftBeloep}
        tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
        erMedGrunnlagFlyt={true}
        harDeltGrunnlag={false}
      />

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
