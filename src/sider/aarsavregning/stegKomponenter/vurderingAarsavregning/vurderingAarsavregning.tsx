import * as Api from "../../../../services/api";
import MedlemskapsPerioderTabell from "./komponenter/medlemskapsPerioderTabell";
import "./vurderingAarsavregning.css";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Skatteforholdsperioder } from "../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Utils from "../../../../utils";
import vurderingAarsavregningSchema from "./vurderingAarsavregningSchema";
import { Feilmelding, feilMeldingBlokkerer, finnAktivFeilmelding } from "./meldinger";
import { erBrukerSkattepliktigIHelePerioden } from "../../../ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgiftSchema";
import MKV from "../../../../melosyskodeverk";
import { BeregnetTrygdeavgift } from "../../../../services/modules/trygdeavgift";
import { SumArsavregningTabell } from "./komponenter/sumArsavregningTabell";
import { BeregnetTrygdeavgiftDetaljer } from "./komponenter/beregnetTrygdeavgiftDetaljer";
import { OK } from "../../../../ducks/aarsavregning/types";
import { aarsavregningOperations } from "../../../../ducks/aarsavregning";
import TidligereGrunnlagsoversikt from "./komponenter/tidligereGrunnlagsoversikt";
import { Medlemskapsperioder } from "../../../../felleskomponenter/trygdeavgift/komponenter/medlemskapsperioder";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

interface AarsavregningFormValuesProps extends FormValuesProps {
  totaltForskuddsvisFakturert?: number | string;
}

export const VurderingAarsavregning = ({ bekreft, oppdaterStatus }: Props) => {
  const [valgtÅr, setValgtÅr] = useState<number | null>(null);
  const [erAvvik, setErAvvik] = useState<boolean | undefined>(undefined);
  const [feil, setFeil] = useState<undefined | string>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lagretTrygdeavgiftsperioder, setTrygdeavgiftsperioder] = useState<BeregnetTrygdeavgift | undefined>(undefined);
  const [lagretTrygdeavgift, setLagretTrygdeavgift] = useState<AarsavregningResponse | undefined>(undefined);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const sisteMuligeÅr = new Date().getFullYear() - 1;
  const antallÅrTilbakeITid = 6;
  const muligeAar = Array.from({ length: antallÅrTilbakeITid }, (_, i) => sisteMuligeÅr - i);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lagrePending, setLagrePending] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [trygdeavgiftsperioderHentingPending, setTrygdeavgiftsperioderHentingPending] = useState(false);
  const dispatch = useDispatch();

  const defaultPeriode = useMemo(() => {
    if (lagretTrygdeavgift?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.skatteforholdsperioder) {
      const perioder = lagretTrygdeavgift.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.skatteforholdsperioder;
      const minFomDato = perioder.sort((a, b) => a.fomDato.localeCompare(b.fomDato))[0].fomDato;
      const maxTomDato = perioder.sort((a, b) => b.tomDato.localeCompare(a.tomDato))[0].tomDato;
      return { fomDato: minFomDato, tomDato: maxTomDato };
    }
    return undefined;
  }, [lagretTrygdeavgift]);

  const medlemskapsperioder =
    lagretTrygdeavgift?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder;
  const innvilgetMedlemskapsperiode = {
    fom: defaultPeriode?.fomDato,
    tom: defaultPeriode?.tomDato,
  };

  useEffect(() => {
    if (behandlingID) {
      setTrygdeavgiftsperioderHentingPending(true);
      Api.Trygdeavgift.hentBeregnetTrygdeavgift(behandlingID)
        .then((result) => {
          setTrygdeavgiftsperioder(result);
        })
        .catch((error) => {
          setFeil(error);
        })
        .finally(() => {
          setTrygdeavgiftsperioderHentingPending(false);
        });
    }
  }, [behandlingID]);

  const medlemskapsTypeErPliktig = medlemskapsperioder?.every(
    (periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG
  );

  const {
    control,
    watch,
    setValue,
    formState: { isValid: formIsValid, isValidating, errors },
  } = useForm({
    resolver: yupResolver(vurderingAarsavregningSchema),
    context: {
      medlemskapsperiode: innvilgetMedlemskapsperiode,
      medlemskapsTypeErPliktig,
      erÅpenSluttDato: false,
    },
    mode: "onChange",
    defaultValues: {
      skatteforholdsperioder: [{}],
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

  const aktivFeilmeldingType = finnAktivFeilmelding(
    formValues?.inntektskilder,
    formValues?.skatteforholdsperioder,
    medlemskapsperioder,
    innvilgetMedlemskapsperiode
  );

  useEffect(() => {
    if (redigerbart && formValues.totaltForskuddsvisFakturert) {
      Api.Aarsavregning.oppdaterTotalBelop(behandlingID, {
        avregning: {
          tidligereFakturertBeloep: formValues.totaltForskuddsvisFakturert,
        },
      });
    }
  }, [formValues.totaltForskuddsvisFakturert]);

  useEffect(() => {
    fetchAvregningsData();
  }, [lagretTrygdeavgiftsperioder]);

  useEffect(() => {
    if (redigerbart && lagretTrygdeavgift) {
      Api.Aarsavregning.oppdaterTotalBelop(behandlingID, {
        avregning: {
          nyttTotalbeloep: lagretTrygdeavgift?.nyttGrunnlag?.avgift.totalAvgift,
        },
      });
    }
  }, [lagretTrygdeavgift?.nyttGrunnlag?.avgift.totalAvgift]);

  const fetchAvregningsData = () => {
    return Api.Aarsavregning.hentAvregningsData(behandlingID)
      .then((response: AarsavregningResponse) => {
        // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
        dispatch({ type: OK, data: response });
        setLagretTrygdeavgift(response);
        setValue("totaltForskuddsvisFakturert", response.avregning?.tidligereFakturertBeloep);
        return response;
      })
      .catch((error: any) => {
        if (error.response?.status === 404) {
          setLagretTrygdeavgift(undefined);
          dispatch(aarsavregningOperations.resetAarsavregning());
        }
      });
  };

  const beregnTrygdeavgiftsperioder = useCallback(
    (formVerdier: FieldValue<FormValuesProps>) => {
      setFeil(undefined);
      setLagrePending(true);
      const erBrukerPliktigMedlemOgSkattepliktig =
        medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(formVerdier.skatteforholdsperioder);
      if (!lagretTrygdeavgift?.tidligereGrunnlagsopplysninger) return;
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
              avgiftspliktigInntektMnd: inntektskilde.bruttoInntekt,
              fomDato: Utils.dato.formatterDatoTilISO(inntektskilde.fomDato),
              tomDato: Utils.dato.formatterDatoTilISO(inntektskilde.tomDato, null),
            }))
          : [],
      })
        .then((beregnetTrygdeavgift) => {
          setFeil(undefined);
          setTrygdeavgiftsperioder(beregnetTrygdeavgift);
        })
        .catch((error) => setFeil(mapFeilmelding(error)))
        .finally(() => setLagrePending(false));
    },
    [behandlingID, medlemskapsTypeErPliktig, setFeil, setLagrePending, setTrygdeavgiftsperioder]
  );

  const debounceBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((formVerdier, isValid) => isValid && beregnTrygdeavgiftsperioder(formVerdier), 500),
    [beregnTrygdeavgiftsperioder]
  );

  useEffect(() => {
    if (redigerbart && !isValidating) {
      debounceBeregnTrygdeavgiftsperioder(formValues, formIsValid && !feilMeldingBlokkerer(aktivFeilmeldingType));
    }
  }, [
    formIsValid,
    aktivFeilmeldingType,
    isValidating,
    formValues?.inntektskilder?.length,
    formValues?.skatteforholdsperioder?.length,
    redigerbart,
    debounceBeregnTrygdeavgiftsperioder,
  ]);

  const mapFeilmelding = (error: any) => {
    const feilmelding = "Finner ikke trygdeavgiftssats. Melosys har ikke satser for årene før 2014.";

    const ingenGjeldendeSats = error.body?.feilkoder?.some((feilkode: string) =>
      feilkode.startsWith("Ingen gjeldende sats finnes for perioden")
    );

    if (ingenGjeldendeSats) return feilmelding;

    return error.body?.feilkoder || error.body?.message || error;
  };

  const håndterLagretTrygdeavgiftsgrunnlag = (trygdeavgiftsgrunnlag: Trygdeavgiftsgrunnlag) => {
    const { inntektskperioder, skatteforholdsperioder } = trygdeavgiftsgrunnlag;
    const sorterteInntekstkilder = inntektskperioder?.sort(Utils.dato.sorterEtterISOFomDato);
    const sorterteSkatteforhold = skatteforholdsperioder?.sort(Utils.dato.sorterEtterISOFomDato);
    resetSkatteforholdsperioder(
      !Utils._isEmpty(sorterteSkatteforhold)
        ? sorterteSkatteforhold.map((skatteforhold) => ({
            fomDato: Utils.dato.formatterDatoTilNorsk(skatteforhold.fomDato),
            tomDato: Utils.dato.formatterDatoTilNorsk(skatteforhold.tomDato),
            skatteplikttype: skatteforhold.skatteplikttype,
          }))
        : [defaultPeriode!]
    );
    resetInntektskilder(
      !Utils._isEmpty(sorterteInntekstkilder)
        ? sorterteInntekstkilder.map((inntektskilde) => ({
            kildetype: inntektskilde.type,
            arbAvgBetales: Utils.streng.boolTilUppercaseStreng(inntektskilde.arbeidsgiversavgiftBetales),
            bruttoInntekt: inntektskilde.avgiftspliktigInntektMnd,
            fomDato: Utils.dato.formatterDatoTilNorsk(inntektskilde.fomDato),
            tomDato: Utils.dato.formatterDatoTilNorsk(inntektskilde.tomDato),
          }))
        : [defaultPeriode!]
    );
  };

  useEffect(() => {
    setValgtÅr(lagretTrygdeavgift?.aar || null);

    if (lagretTrygdeavgift) {
      if (lagretTrygdeavgift.avvikFunnet === true) {
        håndterAvvik(lagretTrygdeavgift.avvikFunnet);
      }
    }

    setErAvvik(lagretTrygdeavgift?.avvikFunnet);
  }, [lagretTrygdeavgift]);

  const håndterAvvik = (avvik: boolean) => {
    setErAvvik(avvik);

    if (avvik && lagretTrygdeavgift?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
      håndterLagretTrygdeavgiftsgrunnlag(
        lagretTrygdeavgift.nyttGrunnlag?.trygdeavgiftsgrunnlag ||
          lagretTrygdeavgift.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag
      );
    } else if (defaultPeriode) {
      resetSkatteforholdsperioder([defaultPeriode]);
      resetInntektskilder([defaultPeriode]);
    }
  };

  useEffect(() => {
    if (erAvvik === false) {
      Api.Trygdeavgift.slettTrygdeavgiftsperioder(behandlingID).then(() => {
        resetSkatteforholdsperioder([]);
        resetInntektskilder([]);
        fetchAvregningsData();
      });
    }
  }, [erAvvik]);

  const håndterEndringAvÅr = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const år = event.target.value ? parseInt(event.target.value, 10) : undefined;
    setFeil(undefined);
    setValgtÅr(år || null);
  };

  useEffect(() => {
    if (errors) {
      console.log("errors", errors);
    }
    if (errors.skatteforholdsperioder) {
      console.log("Skatteforholdsperioder Errors:", errors.skatteforholdsperioder);
    }
    if (errors.inntektskilder) {
      console.log("Inntektskilder Errors:", errors.inntektskilder);
    }
  }, [errors.skatteforholdsperioder, errors.inntektskilder]);

  useEffect(() => {
    if (!valgtÅr || lagretTrygdeavgift?.aar === valgtÅr) {
      return;
    }

    Api.Aarsavregning.lagAvregningsData(behandlingID, { aar: valgtÅr })
      .then((nyAvregningsData) => {
        setLagretTrygdeavgift(nyAvregningsData);
        resetSkatteforholdsperioder([]);
        resetInntektskilder([]);
      })
      .catch((error: any) => {
        setFeil(error.body?.message || error);
      });
    setErAvvik(undefined);
    setValue("totaltForskuddsvisFakturert", undefined);
  }, [valgtÅr, behandlingID, lagretTrygdeavgift?.aar]);

  // TODO: 0 grunnlag og 0 avvik må også kreve at totalt tidligere fakturert trygdeavgift er registrert
  const stegErGyldig = Boolean(erAvvik === false || (erAvvik && lagretTrygdeavgift?.nyttGrunnlag));

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  return (
    <div className="vurderingAarsavregning">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Årsavregning</Nav.Typo.Innholdstittel>
      <Nav.Fieldset className="select" legend={<LabelMedHjelpetekst bold label="År" placement="left-start" />}>
        <Nav.Row>
          <Nav.Column xs="4">
            <Nav.Select
              label=""
              id="aarVelger"
              value={valgtÅr?.toString() ?? ""}
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
      </Nav.Fieldset>
      {feil && <Nav.Alert variant="error">{feil}</Nav.Alert>}
      {lagretTrygdeavgift?.tidligereGrunnlagsopplysninger === null && lagretTrygdeavgift.aar === valgtÅr && (
        <TidligereGrunnlagsopplysningerFinnesIkke formValues={formValues} control={control} redigerbart={redigerbart} />
      )}
      {lagretTrygdeavgift?.tidligereGrunnlagsopplysninger && (
        <>
          <MedlemskapsPerioderTabell
            perioder={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.medlemskapsperioder}
          />
          <TidligereGrunnlagsoversikt
            skatteforholdsperioder={
              lagretTrygdeavgift.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.skatteforholdsperioder
            }
            inntektsperioder={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.inntektskperioder}
            avgift={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.avgift}
          />
        </>
      )}

      {lagretTrygdeavgift?.tidligereGrunnlagsopplysninger && (
        <BeregnetTrygdeavgiftDetaljer
          grunnlag={lagretTrygdeavgift?.tidligereGrunnlagsopplysninger}
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!!}
          tittel="Forskuddsvis beregnet trygdeavgift"
        />
      )}

      {lagretTrygdeavgift?.tidligereGrunnlagsopplysninger && (
        <Nav.RadioGroup
          onChange={(value) => håndterAvvik(value)}
          value={erAvvik}
          legend="Er det avvik i opplysningene fra skatt eller bruker?"
          readOnly={!redigerbart}
        >
          <Nav.Radio value>Ja</Nav.Radio>
          <Nav.Radio value={false}>Nei</Nav.Radio>
        </Nav.RadioGroup>
      )}

      {(erAvvik ||
        (lagretTrygdeavgift?.tidligereGrunnlagsopplysninger === null && lagretTrygdeavgift.aar === valgtÅr)) && (
        <Nav.Row>
          <Nav.Column>
            <Medlemskapsperioder
              formValues={formValues}
              redigerbart={redigerbart}
              control={control}
              fields={skattFields}
            />
          </Nav.Column>
        </Nav.Row>
      )}

      {(erAvvik ||
        (lagretTrygdeavgift?.tidligereGrunnlagsopplysninger === null && lagretTrygdeavgift.aar === valgtÅr)) && (
        <Nav.Row>
          <Nav.Column>
            <Skatteforholdsperioder
              formValues={formValues}
              redigerbart={redigerbart}
              remove={skattRemove}
              append={skattAppend}
              control={control}
              defaultPeriode={defaultPeriode}
              fields={skattFields}
            />
          </Nav.Column>
        </Nav.Row>
      )}

      {(erAvvik ||
        (lagretTrygdeavgift?.tidligereGrunnlagsopplysninger === null && lagretTrygdeavgift.aar === valgtÅr)) && (
        <Inntektskilder
          formValues={formValues}
          redigerbart={redigerbart}
          update={inntektUpdate}
          remove={inntektRemove}
          append={inntektAppend}
          control={control}
          defaultPeriode={defaultPeriode}
          fields={inntektFields}
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!!}
        />
      )}

      {(erAvvik ||
        (lagretTrygdeavgift?.tidligereGrunnlagsopplysninger === null && lagretTrygdeavgift.aar === valgtÅr)) &&
        lagretTrygdeavgift?.nyttGrunnlag && (
          <SumArsavregningTabell
            nyTrygdeavgift={lagretTrygdeavgift?.nyttGrunnlag?.avgift.totalAvgift}
            tidligereTrygdeavgift={lagretTrygdeavgift?.tidligereGrunnlagsopplysninger?.avgift.totalAvgift}
          />
        )}

      {(erAvvik ||
        (lagretTrygdeavgift?.tidligereGrunnlagsopplysninger === null && lagretTrygdeavgift.aar === valgtÅr)) &&
        lagretTrygdeavgift?.nyttGrunnlag && (
          <BeregnetTrygdeavgiftDetaljer
            grunnlag={lagretTrygdeavgift.nyttGrunnlag}
            medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!!}
            tittel="Endelig beregnet trygdeavgift"
          />
        )}

      <Feilmelding type={aktivFeilmeldingType} />

      <Nav.Button variant="primary" disabled={!stegErGyldig || !redigerbart} onClick={bekreft}>
        Bekreft og fortsett
      </Nav.Button>
    </div>
  );
};
