import * as Api from "../../../../services/api";
import MedlemskapsPerioderTabell from "./komponenter/medlemskapsPerioderTabell";
import "./vurderingAarsavregning.css";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { AarsavregningResponse, Trygdeavgiftsgrunnlag } from "../../../../services/modules/aarsavregning/aarsavregning";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import * as Nav from "../../../../navFrontend";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { TidligereGrunnlagsopplysningerFinnesIkke } from "./komponenter/tidligereGrunnlagsopplysningerFinnesIkke";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";
import {
  FieldArrayProps,
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Utils from "../../../../utils";
import vurderingAarsavregningSchema from "./vurderingAarsavregningSchema";
import { feilMeldingBlokkerer, finnAktivFeilmelding } from "./meldinger";
import { erBrukerSkattepliktigIHelePerioden } from "../../../ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgiftSchema";
import MKV from "../../../../melosyskodeverk";
import { SumArsavregningTabell } from "./komponenter/sumArsavregningTabell";
import { BeregnetTrygdeavgiftDetaljer } from "./komponenter/beregnetTrygdeavgiftDetaljer";
import { OK } from "../../../../ducks/aarsavregning/types";
import TidligereGrunnlagsoversikt from "./komponenter/tidligereGrunnlagsoversikt";
import { sorterEtterISOFomDato } from "../../../../utils/dato";
import GrunnlagsopplysningerSkjema from "./komponenter/grunnlagsopplysningerSkjema";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { NyBehandlingForTidligereAarsavregningMelding } from "../../../../felleskomponenter/alertmeldinger/alertmeldinger";

import { behandlingsresultatOperations, behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";

import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from "../../../../ducks/medlemskapsperioder";
import { MedlemskapsperiodeProp } from "../../../ftrl/saksbehandling/stegKomponenter/vurderingPeriode/komponenter/types";
import { Medlemskapsperioder } from "./komponenter/medlemskapsperioder";
import { InntektskildeDto, SkatteforholdDto } from "../../../../services/modules/trygdeavgift";
import { FeilmeldingOppsummering } from "./feilmeldingOppsummering";
import { Medlemskapsperiode } from "../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

const { AVSLAATT } = MKV.Koder.innvilgelsesResultat;

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

const mapInitialMedlemskapsperioder = (
  medlemskapsperioder: Api.MedlemAvFolketrygden.Medlemskapsperioder.Medlemskapsperiode[],
): MedlemskapsperiodeProp[] =>
  [...medlemskapsperioder]
    .sort((a, b) => Utils.dato.sorterEtterISOFomDato(a, b) || (a.innvilgelsesResultat === AVSLAATT ? -1 : 1))
    .map(mapTilMedlemskapsperiodeProps);

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

const { FASTSATT_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingsresultattyper;

// TODO: Boolean for årsavregningstype mangler. Automatisk opprettet årsavregning skal ha år tilknyttet og dermed skal årvelger skjules
export function VurderingAarsavregningUtenGrunnlag({ bekreft, oppdaterStatus }: Props) {
  const [valgtÅr, setValgtÅr] = useState<number | null>(null);
  const [initieltÅr, setInitieltÅr] = useState<number | null>(null);
  const [erAvvik, setErAvvik] = useState<boolean | undefined>(undefined);
  const [erIngenGrunnlag, setErIngenGrunnlag] = useState<boolean | undefined>(undefined);
  const [feil, setFeil] = useState<undefined | string>(undefined);
  const [formBekreftet, setFormBekreftet] = useState(false);

  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(undefined);
  const [nyVurderingÅrsavregning, setNyVurderingÅrsavregning] = useState<boolean>(false);
  const [bestemmelser, setBestemmelser] = useState<[]>([]);
  const [visLeggTilMedlemskapsperioder, setVisLeggTilMedlemskapsperioder] = useState<boolean>(false);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const aarsavregningID = useSelector(behandlingsresultatSelectors.ÅrsavregningIDSelector);
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector) as any;
  const lagredeMedlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const sisteMuligeÅr = new Date().getFullYear() - 1;
  const antallÅrTilbakeITid = 6;
  const muligeAar = Array.from({ length: antallÅrTilbakeITid }, (_, i) => sisteMuligeÅr - i);
  const dispatch = useDispatch();

  useEffect(() => {
    if (behandlingstema) {
      Api.Ftrl.hentBestemmelser(behandlingstema).then((res: any) => setBestemmelser(res.bestemmelser));
    }
  }, [behandlingstema]);

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
    dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
    trigger("medlemskapsperioder").then((isValid) => setVisLeggTilMedlemskapsperioder(isValid));
    if (behandlingID && aarsavregningID) {
      Api.Aarsavregning.hentAarsavregning(behandlingID, aarsavregningID)
        .then((res) => {
          setAarsavregningResponse(res);
          oppdaterErIngenGrunnlag(res);
          // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
          dispatch({ type: OK, data: res });
          setInitieltÅr(res.aar);
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
    if (erIngenGrunnlag && lagredeMedlemskapsperioder)
      setValue("medlemskapsperioder", mapInitialMedlemskapsperioder(lagredeMedlemskapsperioder));
    setValue(
      "skatteforholdsperioder",
      mapTilSkatteforholdProps(aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag.skatteforholdsperioder),
    );
    setValue(
      "inntektskilder",
      mapTilInntektskilderProps(aarsavregningResponse?.nyttGrunnlag?.trygdeavgiftsgrunnlag.inntektskperioder),
    );
  }, [lagredeMedlemskapsperioder, erIngenGrunnlag, aarsavregningResponse]);
  // Innlasting ved valg av år, oppretter eller henter årsavregning
  useEffect(() => {
    /* TODO: Refaktorert api skal ha nytt endepunkt som lar oss sjekke om et gitt år og behandlingID har en aktiv årsavregning.
    Legg til kall mot dette endepunktet og kjør enten hent eller lag basert på responsen.
    */
    if (redigerbart && valgtÅr && valgtÅr !== aarsavregningResponse?.aar) {
      setErIngenGrunnlag(undefined);
      setErAvvik(undefined);
      resetInntektskilder([]);
      resetSkatteforholdsperioder([]);
      resetMedlemskapsperioder([]);
      Api.Aarsavregning.hentFiltrertAarsavregningList(saksnummer, valgtÅr, FASTSATT_TRYGDEAVGIFT).then((res) => {
        setNyVurderingÅrsavregning(res.length > 0);
      });

      Api.Aarsavregning.lagAarsavregning(behandlingID, { aar: valgtÅr })
        .then((res) => {
          setAarsavregningResponse(res);
          oppdaterErIngenGrunnlag(res);
          // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
          dispatch({ type: OK, data: res });
          if (res?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
            setSkjemaverdierFraTrygdeavgiftsgrunnlag(res?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag);
          }
          setValue("totaltForskuddsvisFakturert", "");
          dispatch(behandlingsresultatOperations.hent(behandlingID));
          dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
        })
        .catch((error: any) => {
          setFeil(error.body?.message || error);
        });
    }
  }, [valgtÅr]);

  const oppdaterErIngenGrunnlag = (nyAarsavregningResponse?: AarsavregningResponse) => {
    innvilgetMedlemskapsperiode = lagInnvilgetMedlemskapsPeriode(
      nyAarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder,
    );

    if (
      nyAarsavregningResponse?.tidligereGrunnlagsopplysninger === null &&
      Utils._isEmpty(innvilgetMedlemskapsperiode.fom)
    ) {
      setErIngenGrunnlag(true);
    }
  };

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
            oppdaterErIngenGrunnlag(response);
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
    resolver: yupResolver(vurderingAarsavregningSchema),
    context: {
      medlemskapsperiode: innvilgetMedlemskapsperiode,
      medlemskapsTypeErPliktig,
      erÅpenSluttDato: false,
      erAvvik,
      erIngenGrunnlag,
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
    replace: resetMedlemskapsperioder,
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
    if (formBekreftet && Object.keys(formErrors).length === 0) {
      setFormBekreftet(false);
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
            oppdaterErIngenGrunnlag(response);
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
      (erAvvik || erIngenGrunnlag) &&
      !isValidating &&
      formIsValid &&
      aarsavregningID &&
      !feilMeldingBlokkerer(aktivFeilmeldingType)
    ) {
      debounceBeregnTrygdeavgiftsperioder(formValues);
    }
  }, [isValidating, erAvvik, formIsValid, erIngenGrunnlag, aarsavregningID]);

  const stegErGyldig =
    (erAvvik === false && !erIngenGrunnlag) ||
    Boolean(formIsValid && (erAvvik || erIngenGrunnlag) && aarsavregningResponse?.nyttGrunnlag);

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  // TODO legg avvik i schema context, nå trigger ikke endring til true automatisk beregning, man må "touche" brutto inntekt i weben
  const håndterAvvik = (value: boolean) => {
    if (!value) {
      Api.Trygdeavgift.slettTrygdeavgiftsperioder(behandlingID).then(() => {
        resetSkatteforholdsperioder([]);
        resetInntektskilder([]);
        oppdaterNyttTotalbeloep(aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift.totalAvgift).then(() => {
          Api.Aarsavregning.hentAarsavregning(behandlingID, aarsavregningID).then((response: AarsavregningResponse) => {
            setAarsavregningResponse(response);
            oppdaterErIngenGrunnlag(response);
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

  const håndterEndringAvÅr = (event: ChangeEvent<HTMLSelectElement>) => {
    const år = event.target.value ? parseInt(event.target.value, 10) : undefined;
    setFeil(undefined);
    setValgtÅr(år || null);
  };

  const bekreftOnClick = () => {
    setFormBekreftet(true);
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

    const response: any = await (medlemskapsperiode.ny
      ? dispatch(medlemskapsperioderOperations.opprettMedlemskapsperiode(behandlingID, periodeRequest))
      : dispatch(
        medlemskapsperioderOperations.oppdaterMedlemskapsperiode(
          behandlingID,
          medlemskapsperiode.periodeId,
          periodeRequest,
        ),
      ));

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
        setVisLeggTilMedlemskapsperioder(true);
      } else {
        setVisLeggTilMedlemskapsperioder(false);
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
    debouncedLagreMedlemskapsperioder(formValues.medlemskapsperioder, undefined);
  };

  const handleSlett = async (index: number) => {
    const medlemskapsperiode = formValues.medlemskapsperioder[index];

    if (medlemskapsperiode.ny) {
      medlemskapsperioderRemove(index);
    } else {
      await dispatch(medlemskapsperioderOperations.slettMedlemskapsperiode(behandlingID, medlemskapsperiode.periodeId));
    }

    setVisLeggTilMedlemskapsperioder(await trigger("medlemskapsperioder"));
  };
  return (
    <div className="vurderingAarsavregning">
      <Nav.Heading level="1" className="stegvelgertittel">
        Årsavregning
      </Nav.Heading>
      <Nav.Fieldset className="select" legend={<LabelMedHjelpetekst bold label="År" placement="left-start" />}>
        <Nav.Row>
          <Nav.Column xs="4">
            <Nav.Select
              label=""
              id="aarVelger"
              value={(valgtÅr || initieltÅr)?.toString() ?? ""}
              onChange={håndterEndringAvÅr}
              readOnly={!redigerbart}
            >
              <option value="" disabled>
                Velg...
              </option>
              {muligeAar.map((aar) => (
                <option key={aar} value={aar.toString()}>
                  {aar}
                </option>
              ))}
            </Nav.Select>
          </Nav.Column>
        </Nav.Row>
        {nyVurderingÅrsavregning && (
          <Nav.Row>
            <NyBehandlingForTidligereAarsavregningMelding />
          </Nav.Row>
        )}
      </Nav.Fieldset>
      {aarsavregningResponse?.tidligereGrunnlagsopplysninger === null &&
        aarsavregningResponse.aar === (valgtÅr || initieltÅr) && (
          <TidligereGrunnlagsopplysningerFinnesIkke
            formValues={formValues}
            control={control}
            redigerbart={redigerbart}
          />
        )}
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
      {(erAvvik || erIngenGrunnlag) && valgtÅr && (
        <Nav.Heading size="large">Inntekts- og skatteopplysninger for endelig trygdeavgift</Nav.Heading>
      )}

      {erIngenGrunnlag &&
        medlemskapsperioderFields.map((field, index) => (
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
            visLeggTil={visLeggTilMedlemskapsperioder}
          />
        ))}

      {(erAvvik || erIngenGrunnlag) && (
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

      {(erAvvik || erIngenGrunnlag) && formIsValid && (
        <SumArsavregningTabell
          nyTrygdeavgift={aarsavregningResponse?.avregning?.nyttTotalbeloep}
          tidligereTrygdeavgift={aarsavregningResponse?.avregning?.tidligereFakturertBeloep}
        />
      )}

      {(erAvvik || erIngenGrunnlag) && formIsValid && aarsavregningResponse?.nyttGrunnlag && (
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
    </div>
  );
}
