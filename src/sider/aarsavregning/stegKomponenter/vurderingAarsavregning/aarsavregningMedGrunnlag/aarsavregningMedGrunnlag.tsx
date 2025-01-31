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
import { feilMeldingBlokkerer, finnAktivFeilmelding } from "../meldinger";
import MKV from "../../../../../melosyskodeverk";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import { OK } from "../../../../../ducks/aarsavregning/types";
import TidligereGrunnlagsoversikt from "../komponenter/tidligereGrunnlagsoversikt";
import { sorterEtterISOFomDato } from "../../../../../utils/dato";

import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import { FeilmeldingOppsummering } from "../feilmeldingOppsummering";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import aarsavregningMedGrunnlagSchema from "./aarsavregningMedGrunnlagSchema";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { beregnTrygdeavgiftsperioder } from "../komponenter/utils";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

const lagInnvilgetMedlemskapsPeriode = (medlemskapsperioder?: Medlemskapsperiode[]) => {
  if (medlemskapsperioder && !Utils._isEmpty(medlemskapsperioder)) {
    const sorterteInnvilgedePerioder = [...medlemskapsperioder]
      .filter((periode) => periode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.INNVILGET)
      .sort(sorterEtterISOFomDato);
    return {
      fom: sorterteInnvilgedePerioder[0].fomDato,
      tom: sorterteInnvilgedePerioder[sorterteInnvilgedePerioder.length - 1].tomDato,
    };
  }
  return {
    tom: undefined,
    fom: undefined,
  };
};

export function AarsavregningMedGrunnlag({ bekreft, oppdaterStatus }: Props) {
  const [erAvvik, setErAvvik] = useState<boolean | undefined>(undefined);
  const [beregningError, setBeregningError] = useState<undefined | string>(undefined);
  const [brukerHarBekreftet, setBrukerHarBekreftet] = useState(false);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(undefined);

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
      !Utils._isEmpty(sorterteSkatteforhold)
        ? sorterteSkatteforhold.map((skatteforhold) => ({
            fomDato: Utils.dato.formatterDatoTilNorsk(skatteforhold.fomDato),
            tomDato: Utils.dato.formatterDatoTilNorsk(skatteforhold.tomDato),
            skatteplikttype: skatteforhold.skatteplikttype,
          }))
        : [],
    );

    resetInntektskilder(
      !Utils._isEmpty(sorterteInntekstkilder)
        ? sorterteInntekstkilder.map((inntektskilde) => ({
            kildetype: inntektskilde.type,
            arbAvgBetales: Utils.streng.boolTilUppercaseStreng(inntektskilde.arbeidsgiversavgiftBetales),
            bruttoInntekt: inntektskilde.avgiftspliktigInntekt,
            fomDato: Utils.dato.formatterDatoTilNorsk(inntektskilde.fomDato),
            tomDato: Utils.dato.formatterDatoTilNorsk(inntektskilde.tomDato),
            erMaanedsbelop: Utils.streng.boolTilUppercaseStreng(inntektskilde.erMaanedsbelop),
          }))
        : [],
    );
  };

  useEffect(() => {
    if (behandlingID) {
      Api.Aarsavregning.hentAarsavregning(behandlingID)
        .then((res) => {
          setAarsavregningResponse(res);
          if (!redigerbart) {
            setErAvvik(res.avvikFunnet);
          }
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

  const oppdaterNyttTotalbeloep = async (totalAvgift?: number) => {
    return Api.Aarsavregning.oppdaterTotalBelop(
      behandlingID,
      {
        avregning: {
          nyttTotalbeloep: totalAvgift,
        },
      },
      aarsavregningID,
    );
  };

  useEffect(() => {
    if (redigerbart && aarsavregningResponse?.nyttGrunnlag) {
      if (aarsavregningResponse.nyttGrunnlag?.avgift.totalAvgift !== aarsavregningResponse.avregning?.nyttTotalbeloep) {
        oppdaterNyttTotalbeloep(aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift).then(
          (res: AarsavregningResponse) => {
            setAarsavregningResponse(res);
          },
        );
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
        aarsavregningID,
        setBeregningError,
        setAarsavregningResponse,
      });
    },
    [behandlingID, medlemskapsTypeErPliktig, setBeregningError, setAarsavregningResponse, aarsavregningID],
  );

  const debounceBeregnTrygdeavgiftsperioderFormVerdier = useCallback(
    Utils._debounce((formVerdier) => handleBeregnTrygdeavgiftsperioder(formVerdier), 2000),
    [handleBeregnTrygdeavgiftsperioder],
  );

  const debouncedBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((trygdeavgiftsGrunnlagDto) => {
      Api.Trygdeavgift.beregnTrygdeavgiftsperioder(behandlingID, trygdeavgiftsGrunnlagDto);
    }, 1000), // 1000ms debounce delay
    [behandlingID], // Dependencies array
  );

  const aktivFeilmeldingType = finnAktivFeilmelding(
    formValues?.inntektskilder,
    formValues?.skatteforholdsperioder,
    medlemskapsperioder,
    innvilgetMedlemskapsperiode,
  );

  useEffect(() => {
    if (
      redigerbart &&
      erAvvik &&
      !isValidating &&
      formIsValid &&
      aarsavregningID &&
      !feilMeldingBlokkerer(aktivFeilmeldingType)
    ) {
      console.log(erAvvik);
      debounceBeregnTrygdeavgiftsperioderFormVerdier(formValues);
    }
  }, [isValidating, erAvvik]);

  const stegErGyldig =
    erAvvik === false || Boolean(formIsValid && erAvvik && aarsavregningResponse?.nyttGrunnlag && !beregningError);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const håndterAvvik = (value: boolean) => {
    if (!value) {
      console.log("Bruk gammelt grunnlag");
      Api.Trygdeavgift.slettTrygdeavgiftsperioder(behandlingID).then(() => {
        resetSkatteforholdsperioder([]);
        resetInntektskilder([]);
        oppdaterNyttTotalbeloep(aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift.totalAvgift).then(
          (res: AarsavregningResponse) => {
            setAarsavregningResponse(res);
            setSkjemaverdierFraTrygdeavgiftsgrunnlag(res.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag);
            if (res.tidligereGrunnlagsopplysninger !== undefined) {
              debouncedBeregnTrygdeavgiftsperioder({
                skatteforholdsperioder: res.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.skatteforholdsperioder,
                inntektskilder: res.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.inntektskperioder,
              });
            }
          },
        );
      });
    } else if (aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
      setSkjemaverdierFraTrygdeavgiftsgrunnlag(
        aarsavregningResponse.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag,
      );
    }
    setErAvvik(value);
  };

  const bekreftOnClick = () => {
    setBrukerHarBekreftet(true);
    if (stegErGyldig && !beregningError) {
      bekreft();
    }
  };

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
        </>
      )}

      {aarsavregningResponse?.tidligereGrunnlagsopplysninger && (
        <BeregnetTrygdeavgiftDetaljer
          grunnlag={aarsavregningResponse?.tidligereGrunnlagsopplysninger}
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
          tittel="Tidligere beregnet trygdeavgift"
        />
      )}

      {aarsavregningResponse?.tidligereGrunnlagsopplysninger && (
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
      )}
      {erAvvik && <Nav.Heading>Inntekts- og skatteopplysninger for endelig trygdeavgift</Nav.Heading>}

      {erAvvik && (
        <>
          <Skatteforholdsperioder
            formValues={formValues}
            redigerbart={redigerbart}
            remove={skattRemove}
            append={skattAppend}
            control={control}
            fields={skattFields}
          />
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
        </>
      )}

      {erAvvik && formIsValid && !beregningError && (
        <SumArsavregningTabell
          nyTrygdeavgift={aarsavregningResponse?.avregning?.nyttTotalbeloep}
          tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
        />
      )}

      {erAvvik && formIsValid && !beregningError && aarsavregningResponse?.nyttGrunnlag && (
        <BeregnetTrygdeavgiftDetaljer
          grunnlag={aarsavregningResponse.nyttGrunnlag}
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
          tittel="Endelig beregnet trygdeavgift"
        />
      )}

      {brukerHarBekreftet && <FeilmeldingOppsummering errors={formErrors} />}

      {beregningError && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {beregningError}
        </Nav.Alert>
      )}

      <Nav.Button variant="primary" disabled={!redigerbart} onClick={bekreftOnClick}>
        Bekreft og fortsett
      </Nav.Button>
    </>
  );
}
