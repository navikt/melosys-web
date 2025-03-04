import * as Api from "../../../../../services/api";
import MedlemskapsPerioderTabell from "../komponenter/medlemskapsPerioderTabell";
import "../vurderingAarsavregningInngang.css";
import { useCallback, useEffect, useState } from "react";
import {
  AarsavregningResponse,
  Trygdeavgiftsgrunnlag,
} from "../../../../../services/modules/aarsavregning/aarsavregning";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import * as Nav from "../../../../../navFrontend";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";
import { FieldArrayProps, FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Utils from "../../../../../utils";
import MKV from "../../../../../melosyskodeverk";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import { OK } from "../../../../../ducks/aarsavregning/types";
import TidligereGrunnlagsoversikt from "../komponenter/tidligereGrunnlagsoversikt";

import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import { FeilmeldingOppsummering } from "../feilmeldingOppsummering";
import aarsavregningMedGrunnlagSchema from "./aarsavregningMedGrunnlagSchema";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import {
  beregnTrygdeavgiftsperioder,
  erBrukerSkattepliktigIHelePerioden,
  fomTomErFyltUt,
  harInntektsKildeType,
  lagInnvilgetMedlemskapsPeriode,
} from "../komponenter/utils";
import { mapTilInntektskilderProps, mapTilSkatteforholdProps } from "../aarsavregningHelpers";
import { Aarsavregningsmeldinger } from "../komponenter/aarsavregningsmeldinger";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export function AarsavregningMedGrunnlag({ bekreft, oppdaterStatus }: Props) {
  const [erAvvik, setErAvvik] = useState<boolean | undefined>(undefined);
  const [feilmelding, setFeilmelding] = useState<undefined | string>(undefined);
  const [brukerHarBekreftet, setBrukerHarBekreftet] = useState(false);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(undefined);
  const [beregningPaagar, setBeregningPaagar] = useState(false);

  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);
  const dispatch = useDispatch();

  const medlemskapsperioder =
    aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder;
  const innvilgetMedlemskapsperiode = lagInnvilgetMedlemskapsPeriode(medlemskapsperioder);
  const defaultPeriode = {
    fomDato: Utils.dato.formatterDatoTilNorsk(innvilgetMedlemskapsperiode?.fom),
    tomDato: Utils.dato.formatterDatoTilNorsk(innvilgetMedlemskapsperiode?.tom),
  };

  const setSkjemaverdierFraTrygdeavgiftsgrunnlag = (trygdeavgiftsgrunnlag?: Trygdeavgiftsgrunnlag) => {
    if (!trygdeavgiftsgrunnlag) return;
    const { inntektskperioder, skatteforholdsperioder } = trygdeavgiftsgrunnlag;
    const sorterteInntekstkilder = [...inntektskperioder].sort(Utils.dato.sorterEtterISOFomDato);
    const sorterteSkatteforhold = [...skatteforholdsperioder].sort(Utils.dato.sorterEtterISOFomDato);
    resetSkatteforholdsperioder(
      !Utils._isEmpty(sorterteSkatteforhold) ? mapTilSkatteforholdProps(sorterteSkatteforhold) : [],
    );

    resetInntektskilder(
      !Utils._isEmpty(sorterteInntekstkilder) ? mapTilInntektskilderProps(sorterteInntekstkilder) : [],
    );
  };

  useEffect(() => {
    if (behandlingID) {
      Api.Aarsavregning.hentAarsavregning(behandlingID)
        .then((res) => {
          setAarsavregningResponse(res);
          setErAvvik(res.harAvvik);
          // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
          dispatch({ type: OK, data: res });

          if (res?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
            setSkjemaverdierFraTrygdeavgiftsgrunnlag(
              res.nyttGrunnlag?.trygdeavgiftsgrunnlag || res.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag,
            );
          }
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            setAarsavregningResponse(undefined);
          }
        });
    }
  }, []);

  useEffect(() => {
    if (redigerbart && aarsavregningResponse?.nyttGrunnlag) {
      if (aarsavregningResponse.nyttGrunnlag?.avgift.totalAvgift !== aarsavregningResponse.avregning?.nyttTotalbeloep) {
        Api.Aarsavregning.oppdaterTotalAvgift(
          behandlingID,
          aarsavregningID,
          aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift,
        ).then((res: AarsavregningResponse) => {
          setAarsavregningResponse(res);
        });
      }
    }
  }, [aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift]);

  const medlemskapsTypeErPliktig = medlemskapsperioder?.every(
    (periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG,
  );

  const {
    control,
    watch,
    formState: { errors: formErrors, isValid: formIsValid, isValidating },
  } = useForm({
    resolver: yupResolver(aarsavregningMedGrunnlagSchema),
    context: {
      medlemskapsperiode: innvilgetMedlemskapsperiode,
      medlemskapsTypeErPliktig,
      erÅpenSluttDato: false,
      erAvvik,
    },
    mode: "onChange",
    defaultValues: {
      skatteforholdsperioder: [{}],
      inntektskilder: [{}],
    } as FieldValue<FormValuesProps>,
  });

  const {
    fields: skattFields,
    append: skattAppend,
    remove: skattRemove,
    replace: resetSkatteforholdsperioder,
  } = useFieldArray<FieldArrayProps, "skatteforholdsperioder", "id">({ control, name: "skatteforholdsperioder" });

  const {
    fields: inntektFields,
    append: inntektAppend,
    remove: inntektRemove,
    update: inntektUpdate,
    replace: resetInntektskilder,
  } = useFieldArray<FieldArrayProps, "inntektskilder", "id">({ control, name: "inntektskilder" });
  const formValues = watch();

  useEffect(() => {
    if (brukerHarBekreftet && Object.keys(formErrors).length === 0) {
      setBrukerHarBekreftet(false);
    }
  }, [formValues]);

  const handleBeregnTrygdeavgiftsperioder = useCallback(
    async (formVerdier: FieldValue<FormValuesProps>) => {
      await beregnTrygdeavgiftsperioder(formVerdier, {
        behandlingID,
        medlemskapsTypeErPliktig,
        setFeilmelding,
        setAarsavregningResponse,
      });
      setBeregningPaagar(false);
    },
    [behandlingID, medlemskapsTypeErPliktig, setFeilmelding, setAarsavregningResponse],
  );

  const debounceBeregnTrygdeavgiftsperioderOgOppdaterFormVerdier = useCallback(
    Utils._debounce((formVerdier) => handleBeregnTrygdeavgiftsperioder(formVerdier), 2000),
    [handleBeregnTrygdeavgiftsperioder],
  );

  const debouncedBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((trygdeavgiftsGrunnlagDto) => {
      Api.Trygdeavgift.beregnTrygdeavgiftsperioder(behandlingID, trygdeavgiftsGrunnlagDto);
    }, 1000),
    [behandlingID],
  );

  useEffect(() => {
    if (
      redigerbart &&
      aarsavregningID &&
      erAvvik &&
      !isValidating &&
      formIsValid &&
      fomTomErFyltUt(formValues.inntektskilder, formValues.skatteforholdsperioder) &&
      harInntektsKildeType(formValues.inntektskilder, trygdeAvgiftSkalIkkeBetalesTilNav)
    ) {
      setBeregningPaagar(true);
      setFeilmelding(undefined);
      debounceBeregnTrygdeavgiftsperioderOgOppdaterFormVerdier(formValues);
    }
  }, [formIsValid, isValidating, erAvvik, formValues.inntektskilder.length, formValues.skatteforholdsperioder.length]);

  const stegErGyldig =
    erAvvik === false || Boolean(formIsValid && erAvvik && aarsavregningResponse?.nyttGrunnlag && !feilmelding);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const håndterAvvik = (value: boolean) => {
    if (!value) {
      Api.Trygdeavgift.slettTrygdeavgiftsperioder(behandlingID).then(() => {
        resetSkatteforholdsperioder([]);
        resetInntektskilder([]);
        Api.Aarsavregning.oppdaterTotalAvgift(
          behandlingID,
          aarsavregningID,
          aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift.totalAvgift,
        ).then((res: AarsavregningResponse) => {
          setAarsavregningResponse(res);
          setSkjemaverdierFraTrygdeavgiftsgrunnlag(res.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag);
          if (res.tidligereGrunnlagsopplysninger !== undefined) {
            setBeregningPaagar(true);
            debouncedBeregnTrygdeavgiftsperioder({
              skatteforholdsperioder: res.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.skatteforholdsperioder,
              inntektskilder: res.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.inntektskperioder,
            });
          }
        });
      });
    } else if (aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
      setSkjemaverdierFraTrygdeavgiftsgrunnlag(
        aarsavregningResponse.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag,
      );
    }
    Api.Aarsavregning.oppdaterAvvik(behandlingID, value, aarsavregningID);
    setErAvvik(value);
  };

  const bekreftOnClick = () => {
    setBrukerHarBekreftet(true);
    if (formIsValid && stegErGyldig && !feilmelding) {
      bekreft();
    }
  };

  const trygdeAvgiftSkalIkkeBetalesTilNav =
    medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder);
  const forskuddsvisFakturertTrygdeavgift =
    (aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift?.totalAvgift ?? 0) > 0;
  const nyttGrunnlagHarTrygdeavgiftsperioder = (aarsavregningResponse?.nyttGrunnlag?.avgift?.totalAvgift ?? 0) > 0;

  return (
    <>
      {aarsavregningResponse?.tidligereGrunnlagsopplysninger && (
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
            grunnlag={aarsavregningResponse?.tidligereGrunnlagsopplysninger}
            medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
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
              medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
              skalViseErMaanedsBelopRadioGroup
            />
          )}

          {trygdeAvgiftSkalIkkeBetalesTilNav && <Aarsavregningsmeldinger.TrygdeavgiftSkalIkkeBetalesTilNav />}

          {nyttGrunnlagHarTrygdeavgiftsperioder && formIsValid && !feilmelding && (
            <SumArsavregningTabell
              nyTrygdeavgift={aarsavregningResponse?.avregning?.nyttTotalbeloep}
              tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
            />
          )}

          {formIsValid && !feilmelding && (
            <BeregnetTrygdeavgiftDetaljer
              grunnlag={aarsavregningResponse?.nyttGrunnlag}
              medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
              tittel="Endelig beregnet trygdeavgift"
            />
          )}
        </>
      )}

      {brukerHarBekreftet && <FeilmeldingOppsummering errors={formErrors} />}

      {feilmelding && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {feilmelding}
        </Nav.Alert>
      )}

      <Nav.Button
        variant="primary"
        disabled={!redigerbart || beregningPaagar || !stegErGyldig}
        onClick={bekreftOnClick}
      >
        Bekreft og fortsett
      </Nav.Button>
    </>
  );
}
