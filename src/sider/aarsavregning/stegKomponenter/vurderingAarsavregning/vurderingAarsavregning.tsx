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

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

interface AarsavregningFormValuesProps extends FormValuesProps {
  totaltForskuddsvisFakturert?: number | string;
}

const mapFeilmelding = (error: any) => {
  const feilmelding = "Finner ikke trygdeavgiftssats. Melosys har ikke satser for årene før 2014.";

  const ingenGjeldendeSats = error.body?.feilkoder?.some((feilkode: string) =>
    feilkode.startsWith("Ingen gjeldende sats finnes for perioden")
  );

  if (ingenGjeldendeSats) return feilmelding;

  return error.body?.feilkoder || error.body?.message || error;
};

export const VurderingAarsavregning = ({ bekreft, oppdaterStatus }: Props) => {
  const [valgtÅr, setValgtÅr] = useState<number | null>(null);
  const [initieltÅr, setInitieltÅr] = useState<number | null>(null);
  const [erAvvik, setErAvvik] = useState<boolean | undefined>(undefined);
  const [feil, setFeil] = useState<undefined | string>(undefined);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(undefined);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const sisteMuligeÅr = new Date().getFullYear() - 1;
  const antallÅrTilbakeITid = 6;
  const muligeAar = Array.from({ length: antallÅrTilbakeITid }, (_, i) => sisteMuligeÅr - i);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lagrePending, setLagrePending] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dispatch = useDispatch();

  // TODO: Refaktorere perioder
  const defaultPeriode = useMemo(() => {
    if (aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.skatteforholdsperioder) {
      const perioder =
        aarsavregningResponse.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.skatteforholdsperioder;
      const minFomDato = perioder.sort((a, b) => a.fomDato.localeCompare(b.fomDato))[0].fomDato;
      const maxTomDato = perioder.sort((a, b) => b.tomDato.localeCompare(a.tomDato))[0].tomDato;
      return { fomDato: minFomDato, tomDato: maxTomDato };
    }
    return undefined;
  }, [aarsavregningResponse]);

  const medlemskapsperioder =
    aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder;
  const innvilgetMedlemskapsperiode = {
    fom: defaultPeriode?.fomDato,
    tom: defaultPeriode?.tomDato,
  };

  const håndterLagretTrygdeavgiftsgrunnlag = (trygdeavgiftsgrunnlag: Trygdeavgiftsgrunnlag) => {
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
    Api.Aarsavregning.hentAarsavregning(behandlingID)
      .then((res) => {
        // TODO: Set nødvendig state for påbegynt behandling
        setInitieltÅr(res.aar);
        setAarsavregningResponse(res);
        setErAvvik(res.avvikFunnet);
        if (res?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
          håndterLagretTrygdeavgiftsgrunnlag(
            res.nyttGrunnlag?.trygdeavgiftsgrunnlag || res.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag
          );
        }
      })
      .catch((err) => {
        // vis årvelger
      });
  }, []);

  useEffect(() => {
    if (valgtÅr) {
      Api.Aarsavregning.lagAarsavregning(behandlingID, { aar: valgtÅr })
        .then((res) => {
          setAarsavregningResponse(res);
          resetSkatteforholdsperioder([]);
          resetInntektskilder([]);
        })
        .catch((error: any) => {
          setFeil(error.body?.message || error);
        });
    }
  }, [valgtÅr]);

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
    if (redigerbart && aarsavregningResponse) {
      Api.Aarsavregning.oppdaterTotalBelop(behandlingID, {
        avregning: {
          nyttTotalbeloep: aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift,
        },
      });
    }
  }, [aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift]);

  const fetchAarsavregning = () => {
    return Api.Aarsavregning.hentAarsavregning(behandlingID)
      .then((response: AarsavregningResponse) => {
        // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
        dispatch({ type: OK, data: response });
        setAarsavregningResponse(response);
        setValue("totaltForskuddsvisFakturert", response.avregning?.tidligereFakturertBeloep);
        return response;
      })
      .catch((error: any) => {
        if (error.response?.status === 404) {
          setAarsavregningResponse(undefined);
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
      if (!aarsavregningResponse?.tidligereGrunnlagsopplysninger) return;
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
        .then(() => {
          fetchAarsavregning(); // TODO: refaktorer fetchAarsavregning
          setFeil(undefined);
        })
        .catch((error) => setFeil(mapFeilmelding(error)))
        .finally(() => setLagrePending(false));
    },
    [behandlingID, medlemskapsTypeErPliktig]
  );

  const debounceBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((formVerdier, isValid) => isValid && beregnTrygdeavgiftsperioder(formVerdier), 500),
    [beregnTrygdeavgiftsperioder]
  );

  useEffect(() => {
    if (redigerbart) {
      debounceBeregnTrygdeavgiftsperioder(formValues, formIsValid && !feilMeldingBlokkerer(aktivFeilmeldingType));
    }
  }, [formIsValid, aktivFeilmeldingType]);

  //  useEffect(() => {
  //    setValgtÅr(aarsavregningResponse?.aar || null);
  //
  //    if (aarsavregningResponse) {
  //      if (aarsavregningResponse.avvikFunnet === true) {
  //        håndterAvvik(aarsavregningResponse.avvikFunnet);
  //      }
  //    }
  //
  //    setErAvvik(aarsavregningResponse?.avvikFunnet);
  //  }, [aarsavregningResponse]);
  //
  //  const håndterAvvik = (avvik: boolean) => {
  //    setErAvvik(avvik);
  //
  //    if (avvik && aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
  //      håndterLagretTrygdeavgiftsgrunnlag(
  //        aarsavregningResponse.nyttGrunnlag?.trygdeavgiftsgrunnlag ||
  //          aarsavregningResponse.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag
  //      );
  //    } else if (defaultPeriode) {
  //      resetSkatteforholdsperioder([defaultPeriode]);
  //      resetInntektskilder([defaultPeriode]);
  //    }
  //  };

  useEffect(() => {
    if (erAvvik === false) {
      Api.Trygdeavgift.slettTrygdeavgiftsperioder(behandlingID).then(() => {
        resetSkatteforholdsperioder([]);
        resetInntektskilder([]);
        fetchAarsavregning();
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

  // TODO: Skal fjernes, undersøk om setting av totaltForskuddsvisFakturert må legges til annet sted
  useEffect(() => {
    if (!valgtÅr || aarsavregningResponse?.aar === valgtÅr) {
      return;
    }

    Api.Aarsavregning.lagAarsavregning(behandlingID, { aar: valgtÅr })
      .then((nyAvregningsData) => {
        setAarsavregningResponse(nyAvregningsData);
        resetSkatteforholdsperioder([]);
        resetInntektskilder([]);
      })
      .catch((error: any) => {
        setFeil(error.body?.message || error);
      });
    setErAvvik(undefined);
    setValue("totaltForskuddsvisFakturert", undefined);
  }, [valgtÅr, behandlingID, aarsavregningResponse?.aar]);

  const stegErGyldig = Boolean(erAvvik === false || (erAvvik && aarsavregningResponse?.nyttGrunnlag));

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
      {aarsavregningResponse?.tidligereGrunnlagsopplysninger === null && aarsavregningResponse.aar === valgtÅr && (
        <TidligereGrunnlagsopplysningerFinnesIkke formValues={formValues} control={control} redigerbart={redigerbart} />
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
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!!}
          tittel="Forskuddsvis beregnet trygdeavgift"
        />
      )}

      {aarsavregningResponse?.tidligereGrunnlagsopplysninger && (
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

      {erAvvik && (
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

      {erAvvik && (
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

      {erAvvik && aarsavregningResponse?.nyttGrunnlag && (
        <SumArsavregningTabell
          nyTrygdeavgift={aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift}
          tidligereTrygdeavgift={aarsavregningResponse?.tidligereGrunnlagsopplysninger?.avgift.totalAvgift}
        />
      )}

      {erAvvik && aarsavregningResponse?.nyttGrunnlag && (
        <BeregnetTrygdeavgiftDetaljer
          grunnlag={aarsavregningResponse.nyttGrunnlag}
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
