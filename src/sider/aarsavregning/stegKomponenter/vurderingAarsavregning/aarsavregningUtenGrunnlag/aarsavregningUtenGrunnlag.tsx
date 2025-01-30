import * as Api from "../../../../../services/api";
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
import { TidligereGrunnlagsopplysningerFinnesIkke } from "../komponenter/tidligereGrunnlagsopplysningerFinnesIkke";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";
import { FieldArrayProps, FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Utils from "../../../../../utils";
import { feilMeldingBlokkerer, finnAktivFeilmelding } from "../meldinger";
import MKV from "../../../../../melosyskodeverk";
import { SumArsavregningTabell } from "../komponenter/sumArsavregningTabell";
import { BeregnetTrygdeavgiftDetaljer } from "../komponenter/beregnetTrygdeavgiftDetaljer";
import { OK } from "../../../../../ducks/aarsavregning/types";
import { sorterEtterISOFomDato } from "../../../../../utils/dato";

import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";

import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from "../../../../../ducks/medlemskapsperioder";
import { MedlemskapsperiodeProp } from "../../../../ftrl/saksbehandling/stegKomponenter/vurderingPeriode/komponenter/types";
import { Medlemskapsperioder } from "../komponenter/medlemskapsperioder";
import { InntektskildeDto, SkatteforholdDto } from "../../../../../services/modules/trygdeavgift";
import { FeilmeldingOppsummering } from "../feilmeldingOppsummering";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import aarsavregningUtenGrunnlagSchema from "./aarsavregningUtenGrunnlagSchema";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { beregnTrygdeavgiftsperioder } from "../komponenter/utils";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export interface MedlemskapTomFomDatoer {
  fom?: string;
  tom?: string;
}

const hentMedlemskapsFomTomDato = (
  medlemskapsperioder?: MedlemskapsperiodeProp[] | Medlemskapsperiode[],
): MedlemskapTomFomDatoer => {
  if (medlemskapsperioder && !Utils._isEmpty(medlemskapsperioder)) {
    const sorterteInnvilgedePerioder = [...medlemskapsperioder].sort(sorterEtterISOFomDato);
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

const mapTilMedlemskapsperiodeProps = (
  medlemskapsperiode: Api.MedlemAvFolketrygden.Medlemskapsperioder.Medlemskapsperiode,
): MedlemskapsperiodeProp => ({
  ...medlemskapsperiode,
  fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato),
  tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato),
  ny: false,
  feil: undefined,
  periodeId: medlemskapsperiode.id,
});

const mapTilSkatteforholdProps = (
  skatteforhold?: SkatteforholdDto[],
  medlemskapsperioder?: MedlemskapsperiodeProp[],
) => {
  const medlemskapsFomTomDato = hentMedlemskapsFomTomDato(medlemskapsperioder);

  if (skatteforhold !== undefined) {
    return skatteforhold?.map((forhold) => ({
      fomDato: Utils.dato.formatterDatoTilNorsk(forhold.fomDato),
      tomDato: Utils.dato.formatterDatoTilNorsk(forhold.tomDato),
      skatteplikttype: forhold.skatteplikttype,
    }));
  }

  if (medlemskapsFomTomDato.fom !== undefined && medlemskapsFomTomDato.tom !== undefined) {
    return [
      {
        fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsFomTomDato.fom),
        tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsFomTomDato.tom),
        skatteplikttype: undefined,
      },
    ];
  }
  return [{}];
};

const mapTilInntektskilderProps = (
  inntektskilder?: InntektskildeDto[],
  medlemskapsperioder?: MedlemskapsperiodeProp[],
) => {
  const medlemskapsTomFomDato = hentMedlemskapsFomTomDato(medlemskapsperioder);

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

  if (medlemskapsTomFomDato.fom !== undefined && medlemskapsTomFomDato.tom !== undefined) {
    return [
      {
        fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsTomFomDato.fom),
        tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsTomFomDato.tom),
        kildetype: undefined,
        arbAvgBetales: Utils.streng.boolTilUppercaseStreng(false),
        bruttoInntekt: undefined,
        erMaanedsbelop: Utils.streng.boolTilUppercaseStreng(false),
      },
    ];
  }
  return [{}];
};

const mapInitialMedlemskapsperioder = (
  medlemskapsperioder: Api.MedlemAvFolketrygden.Medlemskapsperioder.Medlemskapsperiode[],
): MedlemskapsperiodeProp[] =>
  [...medlemskapsperioder].sort((a, b) => Utils.dato.sorterEtterISOFomDato(a, b)).map(mapTilMedlemskapsperiodeProps);

interface AarsavregningFormValuesProps extends FormValuesProps {
  totaltForskuddsvisFakturert?: number | string;
}

export function AarsavregningUtenGrunnlag({ bekreft, oppdaterStatus }: Props) {
  const [valgtÅr, setValgtÅr] = useState<number | null>(null);
  const [beregningError, setBeregningError] = useState<undefined | string>(undefined);
  const [brukerHarBekreftet, setBrukerHarBekreftet] = useState(false);

  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(undefined);
  const [bestemmelser, setBestemmelser] = useState<[]>([]);
  const [visLeggTilMedlemskapsperioder, setVisLeggTilMedlemskapsperioder] = useState<boolean>(true); // TODO diskuter nødvendigheten av denne
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);
  const lagredeMedlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (behandlingstema) {
      Api.Ftrl.hentBestemmelser(behandlingstema).then((res: any) => setBestemmelser(res.bestemmelser));
    }
  }, [behandlingstema]);

  useEffect(() => {
    dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
    if (behandlingID) {
      Api.Aarsavregning.hentAarsavregning(behandlingID)
        .then((res) => {
          setAarsavregningResponse(res);
          // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
          dispatch({ type: OK, data: res });
          setValgtÅr(res.aar);
          setValue("totaltForskuddsvisFakturert", res.avregning?.tidligereFakturertBeloep);
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            setAarsavregningResponse(undefined);
          }
        });
    }
  }, []);

  useEffect(() => {
    if (lagredeMedlemskapsperioder) {
      const mappedLagredeMedlemskapsperioder = mapInitialMedlemskapsperioder(lagredeMedlemskapsperioder);
      setValue("medlemskapsperioder", mappedLagredeMedlemskapsperioder);
      setValue(
        "skatteforholdsperioder",
        mapTilSkatteforholdProps(
          aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag.skatteforholdsperioder,
          mappedLagredeMedlemskapsperioder,
        ),
      );
      setValue(
        "inntektskilder",
        mapTilInntektskilderProps(
          aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag.inntektskperioder,
          mappedLagredeMedlemskapsperioder,
        ),
      );
    }
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
        oppdaterNyttTotalbeloep(aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift).then(
          (response: AarsavregningResponse) => {
            setAarsavregningResponse(response);
          },
        );
      }
    }
  }, [aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift]);

  const medlemskapsTypeErPliktig = lagredeMedlemskapsperioder?.every(
    (periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG,
  );

  const innvilgetMedlemskapsperiode = hentMedlemskapsFomTomDato(lagredeMedlemskapsperioder);

  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors: formErrors, isValid: formIsValid, isValidating },
  } = useForm({
    resolver: yupResolver(aarsavregningUtenGrunnlagSchema),
    context: {
      medlemskapsperiode: innvilgetMedlemskapsperiode,
      medlemskapsTypeErPliktig,
      valgtår: valgtÅr,
    },
    mode: "onChange",
    defaultValues: {
      medlemskapsperioder: mapInitialMedlemskapsperioder(lagredeMedlemskapsperioder),
      skatteforholdsperioder: mapTilSkatteforholdProps(
        aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag.skatteforholdsperioder,
      ),
      inntektskilder: [{}],
      totaltForskuddsvisFakturert: "",
    } as FieldValue<AarsavregningFormValuesProps>,
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

  useEffect(() => {
    if (medlemskapsperioderFields.length === 0) {
      handleLeggTilMedlemskapsperiode();
    }
  }, [medlemskapsperioderFields]);

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

  const debounceBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((formVerdier) => handleBeregnTrygdeavgiftsperioder(formVerdier), 1000),
    [handleBeregnTrygdeavgiftsperioder],
  );

  const aktivFeilmeldingType = finnAktivFeilmelding(
    formValues?.inntektskilder,
    formValues?.skatteforholdsperioder,
    lagredeMedlemskapsperioder,
    innvilgetMedlemskapsperiode,
  );

  useEffect(() => {
    if (redigerbart && !isValidating && formIsValid && aarsavregningID && !feilMeldingBlokkerer(aktivFeilmeldingType)) {
      debounceBeregnTrygdeavgiftsperioder(formValues);
    }
  }, [isValidating, aarsavregningID]);

  const stegErGyldig = Boolean(formIsValid && aarsavregningResponse?.nyttGrunnlag);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const bekreftOnClick = () => {
    setBrukerHarBekreftet(true);
    if (stegErGyldig) {
      bekreft();
    }
  };

  const lagreMedlemskapsperiode = async (medlemskapsperiode: MedlemskapsperiodeProp, index: number) => {
    const periodeRequest = {
      fomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato, "") as string,
      tomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato, "") as string,
      trygdedekning: medlemskapsperiode.trygdedekning,
      bestemmelse: medlemskapsperiode.bestemmelse,
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
    };

    const response: any = medlemskapsperiode.ny
      ? dispatch(medlemskapsperioderOperations.opprettMedlemskapsperiode(behandlingID, periodeRequest))
      : dispatch(
          medlemskapsperioderOperations.oppdaterMedlemskapsperiode(
            behandlingID,
            medlemskapsperiode.periodeId,
            periodeRequest,
          ),
        );

    // @ts-expect-error generisk beskrivelse
    medlemskapsperioderUpdate(index, mapTilMedlemskapsperiodeProps(response.data));
  };

  const debouncedLagreMedlemskapsperioder = useCallback(
    Utils._debounce(async (alleMedlemskapsperioder, overskrevetIndex) => {
      const isValid = await trigger("medlemskapsperioder");
      if (isValid) {
        // eslint-disable-next-line no-restricted-syntax
        for (const periode of alleMedlemskapsperioder) {
          const index = overskrevetIndex !== undefined ? overskrevetIndex : alleMedlemskapsperioder.indexOf(periode);
          await lagreMedlemskapsperiode(periode, index);
        }
        dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
      } else {
        // setVisLeggTilMedlemskapsperioder(false); TODO trenger vi denne
      }
    }, 1000),
    [],
  );

  const handleLeggTilMedlemskapsperiode = () => {
    const nyMedlemskapsperiode = {
      periodeId: Utils._uuid(),
      ny: true,
      fomDato: "",
      tomDato: "",
      innvilgelsesResultat: "",
      trygdedekning: "",
      bestemmelse: "",
    };
    // @ts-expect-error generisk beskrivelse
    medlemskapsperioderAppend(nyMedlemskapsperiode);
  };

  const handleSlett = async (index: number) => {
    const medlemskapsperiode = formValues.medlemskapsperioder[index];

    if (medlemskapsperiode.ny) {
      medlemskapsperioderRemove(index);
    } else {
      dispatch(medlemskapsperioderOperations.slettMedlemskapsperiode(behandlingID, medlemskapsperiode.periodeId));
    }
  };
  return (
    <div className="vurderingAarsavregning">
      <TidligereGrunnlagsopplysningerFinnesIkke formValues={formValues} control={control} redigerbart={redigerbart} />

      {medlemskapsperioderFields.map((field, index) => (
        <Medlemskapsperioder
          redigerbart={redigerbart}
          control={control}
          field={field}
          index={index}
          remove={handleSlett}
          formValues={formValues}
          bestemmelser={bestemmelser}
          handleChange={debouncedLagreMedlemskapsperioder}
          handleUpdate={medlemskapsperioderUpdate}
          handleLeggTil={handleLeggTilMedlemskapsperiode}
          visLeggTil
        />
      ))}

      <Skatteforholdsperioder
        formValues={formValues}
        redigerbart={redigerbart}
        remove={skattRemove}
        append={skattAppend}
        control={control}
        fields={skattFields}
      />
      <Inntektskilder
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

      {formIsValid && (
        <SumArsavregningTabell
          nyTrygdeavgift={aarsavregningResponse?.avregning?.nyttTotalbeloep}
          tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
        />
      )}

      {formIsValid && aarsavregningResponse?.nyttGrunnlag && (
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

      <Nav.Button variant="primary" disabled={!redigerbart || !formIsValid} onClick={bekreftOnClick}>
        Bekreft og fortsett
      </Nav.Button>
    </div>
  );
}
