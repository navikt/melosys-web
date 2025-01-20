import * as Api from "../../../../../services/api";
import MedlemskapsPerioderTabell from "../komponenter/medlemskapsPerioderTabell";
import "../vurderingAarsavregning.css";
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
import {
  FieldArrayProps,
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Utils from "../../../../../utils";
import { feilMeldingBlokkerer, finnAktivFeilmelding } from "../meldinger";
import { erBrukerSkattepliktigIHelePerioden } from "../../../../ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgiftSchema";
import MKV from "../../../../../melosyskodeverk";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import { OK } from "../../../../../ducks/aarsavregning/types";
import TidligereGrunnlagsoversikt from "../komponenter/tidligereGrunnlagsoversikt";
import { sorterEtterISOFomDato } from "../../../../../utils/dato";
import GrunnlagsopplysningerSkjema from "../komponenter/grunnlagsopplysningerSkjema";

import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";

import { medlemskapsperioderSelectors } from "../../../../../ducks/medlemskapsperioder";
import { InntektskildeDto, SkatteforholdDto } from "../../../../../services/modules/trygdeavgift";
import { FeilmeldingOppsummering } from "../feilmeldingOppsummering";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import aarsavregningMedGrunnlagSchema from "./aarsavregningMedGrunnlagSchema";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

const mapTilSkatteforholdProps = (skatteforhold?: SkatteforholdDto[]) => {
  if (skatteforhold !== undefined) {
    return skatteforhold?.map((forhold) => ({
      fomDato: Utils.dato.formatterDatoTilNorsk(forhold.fomDato),
      tomDato: Utils.dato.formatterDatoTilNorsk(forhold.tomDato),
      skatteplikttype: forhold.skatteplikttype,
    }));
  }
  return [{}];
};

const mapTilInntektskilderProps = (inntektskilder?: InntektskildeDto[]) => {
  if (inntektskilder !== undefined) {
    return inntektskilder?.map((kilde) => ({
      fomDato: Utils.dato.formatterDatoTilNorsk(kilde.fomDato),
      tomDato: Utils.dato.formatterDatoTilNorsk(kilde.tomDato),
      kildetype: kilde.type,
      arbAvgBetales: Utils.streng.boolTilUppercaseStreng(kilde.arbeidsgiversavgiftBetales),
      bruttoInntekt: kilde.avgiftspliktigInntekt,
      erMaanedsbelop: Utils.streng.boolTilUppercaseStreng(kilde.erMaanedsbelop),
    }));
  }
  return [{}];
};

interface AarsavregningFormValuesProps extends FormValuesProps {
  totaltForskuddsvisFakturert?: number | string;
}

const mapFeilmelding = (error: any) => {
  const feilmelding = "Finner ikke trygdeavgiftssats. Melosys har ikke satser for årene før 2014.";

  const ingenGjeldendeSats = error.body?.feilkoder?.some((feilkode: string) =>
    feilkode.startsWith("Ingen gjeldende sats finnes for perioden"),
  );

  if (ingenGjeldendeSats) return feilmelding;

  return error.body?.feilkoder || error.body?.message || error;
};

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
  const [feil, setFeil] = useState<undefined | string>(undefined);
  const [formBekreftet, setFormBekreftet] = useState(false);

  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(undefined);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);
  const lagredeMedlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const dispatch = useDispatch();

  const medlemskapsperioder =
    aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder;

  let innvilgetMedlemskapsperiode = lagInnvilgetMedlemskapsPeriode(medlemskapsperioder);
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
    if (behandlingID && aarsavregningID) {
      Api.Aarsavregning.hentAarsavregning(behandlingID, aarsavregningID)
        .then((res) => {
          setAarsavregningResponse(res);
          // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
          dispatch({ type: OK, data: res });
          setValue("totaltForskuddsvisFakturert", res.avregning?.tidligereFakturertBeloep);

          setErAvvik(res.nyttGrunnlag === null ? undefined : res.nyttGrunnlag !== null);

          if (res.avvikFunnet && res?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
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
  }, [behandlingID, aarsavregningID]);

  useEffect(() => {
    setValue(
      "skatteforholdsperioder",
      mapTilSkatteforholdProps(aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag.skatteforholdsperioder),
    );
    setValue(
      "inntektskilder",
      mapTilInntektskilderProps(aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag.inntektskperioder),
    );
  }, [lagredeMedlemskapsperioder, aarsavregningResponse]);

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
        oppdaterNyttTotalbeloep(aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift).then(() =>
          Api.Aarsavregning.hentAarsavregning(behandlingID, aarsavregningID).then((response: AarsavregningResponse) => {
            setAarsavregningResponse(response);
          }),
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
    setValue,
    trigger,
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
      skatteforholdsperioder: mapTilSkatteforholdProps(
        aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag.skatteforholdsperioder,
      ),
      inntektskilder: [{}],
      totaltForskuddsvisFakturert: "",
    } as FieldValue<AarsavregningFormValuesProps>,
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
    if (formBekreftet && Object.keys(formErrors).length === 0) {
      setFormBekreftet(false);
    }
  }, [formValues]);

  useEffect(() => {
    if (
      redigerbart &&
      (formValues.totaltForskuddsvisFakturert || formValues.totaltForskuddsvisFakturert === "") &&
      formValues.totaltForskuddsvisFakturert !== aarsavregningResponse?.avregning?.tidligereFakturertBeloep
    ) {
      Api.Aarsavregning.oppdaterTotalBelop(
        behandlingID,
        {
          avregning: {
            tidligereFakturertBeloep: formValues.totaltForskuddsvisFakturert,
          },
        },
        aarsavregningID,
      );
    }
  }, [formValues.totaltForskuddsvisFakturert]);

  const beregnTrygdeavgiftsperioder = useCallback(
    (formVerdier: FieldValue<FormValuesProps>) => {
      setFeil(undefined);
      const erBrukerPliktigMedlemOgSkattepliktig =
        medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(formVerdier.skatteforholdsperioder);
      Api.Trygdeavgift.beregnTrygdeavgiftsperioder(behandlingID, {
        skatteforholdsperioder: formVerdier.skatteforholdsperioder.map((skatteforhold: Skatteforhold) => ({
          fomDato: Utils.dato.formatterDatoTilISO(skatteforhold.fomDato),
          tomDato: Utils.dato.formatterDatoTilISO(skatteforhold.tomDato, null),
          skatteplikttype: skatteforhold.skatteplikttype,
        })),
        inntektskilder: !erBrukerPliktigMedlemOgSkattepliktig
          ? formVerdier.inntektskilder.map((inntektskilde: Inntektskilde) => ({
              type: inntektskilde.kildetype,
              arbeidsgiversavgiftBetales: Utils.streng.uppercaseStrengTilBool(inntektskilde.arbAvgBetales) || false,
              avgiftspliktigInntekt: inntektskilde.bruttoInntekt,
              fomDato: Utils.dato.formatterDatoTilISO(inntektskilde.fomDato),
              tomDato: Utils.dato.formatterDatoTilISO(inntektskilde.tomDato, null),
              erMaanedsbelop: Utils.streng.uppercaseStrengTilBool(inntektskilde.erMaanedsbelop) || false,
            }))
          : [],
      })
        .then(() => {
          Api.Aarsavregning.hentAarsavregning(behandlingID, aarsavregningID).then((response: AarsavregningResponse) => {
            setAarsavregningResponse(response);
          });
          setFeil(undefined);
        })
        .catch((error) => setFeil(mapFeilmelding(error)));
    },
    [behandlingID, medlemskapsTypeErPliktig, setFeil, setAarsavregningResponse, aarsavregningID],
  );

  const debounceBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((formVerdier) => beregnTrygdeavgiftsperioder(formVerdier), 1000),
    [beregnTrygdeavgiftsperioder],
  );

  const aktivFeilmeldingType = finnAktivFeilmelding(
    formValues?.inntektskilder,
    formValues?.skatteforholdsperioder,
    medlemskapsperioder,
    innvilgetMedlemskapsperiode,
  );

  // erAvvik trigger en beregning på gammelt grunnlag etter å ha oppdatert skjemaverdier i håndterAvvik. Dette må gjøres for å oppdatere lagrede verdier i api
  useEffect(() => {
    if (
      redigerbart &&
      erAvvik &&
      !isValidating &&
      formIsValid &&
      aarsavregningID &&
      !feilMeldingBlokkerer(aktivFeilmeldingType)
    ) {
      debounceBeregnTrygdeavgiftsperioder(formValues);
    }
  }, [isValidating, erAvvik]);

  const stegErGyldig = erAvvik === false || Boolean(formIsValid && erAvvik && aarsavregningResponse?.nyttGrunnlag);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const håndterAvvik = (value: boolean) => {
    if (!value) {
      Api.Trygdeavgift.slettTrygdeavgiftsperioder(behandlingID).then(() => {
        resetSkatteforholdsperioder([]);
        resetInntektskilder([]);
        oppdaterNyttTotalbeloep(aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift.totalAvgift).then(() => {
          Api.Aarsavregning.hentAarsavregning(behandlingID, aarsavregningID).then((response: AarsavregningResponse) => {
            setAarsavregningResponse(response);
            setSkjemaverdierFraTrygdeavgiftsgrunnlag(response.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag);
          });
        });
      });
    } else if (aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
      setSkjemaverdierFraTrygdeavgiftsgrunnlag(
        aarsavregningResponse.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag,
      );
    }
    setErAvvik(value);
  };

  const bekreftOnClick = () => {
    setFormBekreftet(true);
    if (stegErGyldig) {
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
      {erAvvik && <Nav.Heading size="large">Inntekts- og skatteopplysninger for endelig trygdeavgift</Nav.Heading>}

      {erAvvik && (
        <GrunnlagsopplysningerSkjema
          defaultPeriode={defaultPeriode}
          formValues={formValues}
          inntektFields={inntektFields}
          skattFields={skattFields}
          control={control}
          inntektUpdate={inntektUpdate}
          inntektRemove={inntektRemove}
          inntektAppend={inntektAppend}
          skattRemove={skattRemove}
          skattAppend={skattAppend}
          redigerbart={redigerbart}
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
        />
      )}

      {erAvvik && formIsValid && (
        <SumArsavregningTabell
          nyTrygdeavgift={aarsavregningResponse?.avregning?.nyttTotalbeloep}
          tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
        />
      )}

      {erAvvik && formIsValid && aarsavregningResponse?.nyttGrunnlag && (
        <BeregnetTrygdeavgiftDetaljer
          grunnlag={aarsavregningResponse.nyttGrunnlag}
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!}
          tittel="Endelig beregnet trygdeavgift"
        />
      )}

      {formBekreftet && <FeilmeldingOppsummering errors={formErrors} />}

      {feil && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {feil}
        </Nav.Alert>
      )}

      <Nav.Button variant="primary" disabled={!redigerbart || !formIsValid} onClick={bekreftOnClick}>
        Bekreft og fortsett
      </Nav.Button>
    </>
  );
}
