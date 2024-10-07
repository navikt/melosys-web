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
import { Skatteforholdsperioder } from "../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Utils from "../../../../utils";
import vurderingAarsavregningSchema from "./vurderingAarsavregningSchema";
import { Feilmelding, feilMeldingBlokkerer, finnAktivFeilmelding } from "./meldinger";
import { erBrukerSkattepliktigIHelePerioden } from "../../../ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgiftSchema";
import MKV from "../../../../melosyskodeverk";
import { SumArsavregningTabell } from "./komponenter/sumArsavregningTabell";
import { BeregnetTrygdeavgiftDetaljer } from "./komponenter/beregnetTrygdeavgiftDetaljer";
import { OK } from "../../../../ducks/aarsavregning/types";
import TidligereGrunnlagsoversikt from "./komponenter/tidligereGrunnlagsoversikt";
import { sorterEtterISOFomDato } from "../../../../utils/dato";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { NyBehandlingForTidligereAarsavregningMelding } from "../../../../felleskomponenter/alertmeldinger/alertmeldinger";

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

const { FERDIGBEHANDLET } = MKV.Koder.behandlinger.behandlingsresultattyper;

// TODO: Error handling ved hentÅrsavregning
// TODO: Boolean for årsavregningstype mangler. Automatisk opprettet årsavregning skal ha år tilknyttet og dermed skal årvelger skjules
export const VurderingAarsavregning = ({ bekreft, oppdaterStatus }: Props) => {
  const [valgtÅr, setValgtÅr] = useState<number | null>(null);
  const [initieltÅr, setInitieltÅr] = useState<number | null>(null);
  const [erAvvik, setErAvvik] = useState<boolean | undefined>(undefined);
  const [feil, setFeil] = useState<undefined | string>(undefined);
  const [aarsavregningResponse, setAarsavregningResponse] = useState<AarsavregningResponse | undefined>(undefined);
  const [nyVurderingÅrsavregning, setNyVurderingÅrsavregning] = useState<boolean>(false);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const aarsavregningID = useSelector(behandlingerSelectors.ÅrsavregningIDSelector);
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector);
  const sisteMuligeÅr = new Date().getFullYear() - 1;
  const antallÅrTilbakeITid = 6;
  const muligeAar = Array.from({ length: antallÅrTilbakeITid }, (_, i) => sisteMuligeÅr - i);
  const dispatch = useDispatch();

  // TODO: Medlemskapsperioder må tilpasses behandlinger uten grunnlag.
  let innvilgetMedlemskapsperiode: { fom: string | undefined; tom: string | undefined } = {
    fom: undefined,
    tom: undefined,
  };
  const medlemskapsperioder =
    aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder;
  if (medlemskapsperioder && !Utils._isEmpty(medlemskapsperioder)) {
    const sorterteInnvilgedePerioder = [...medlemskapsperioder]
      .filter((periode) => periode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.INNVILGET)
      .sort(sorterEtterISOFomDato);
    innvilgetMedlemskapsperiode = {
      fom: sorterteInnvilgedePerioder[0].fomDato,
      tom: sorterteInnvilgedePerioder[sorterteInnvilgedePerioder.length - 1].tomDato,
    };
  }

  const setSkjemaverdierFraTrygdeavgiftsgrunnlag = (trygdeavgiftsgrunnlag: Trygdeavgiftsgrunnlag) => {
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
        : []
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
        : []
    );
  };

  // Initiell innlasting
  useEffect(() => {
    Api.Aarsavregning.hentAarsavregning(behandlingID, aarsavregningID)
      .then((res) => {
        setAarsavregningResponse(res);
        // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
        dispatch({ type: OK, data: res });
        setInitieltÅr(res.aar);
        setValue("totaltForskuddsvisFakturert", res.avregning?.tidligereFakturertBeloep);
        if (res.avvikFunnet !== null) {
          setErAvvik(res.avvikFunnet);
        }
        if (res.avvikFunnet && res?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
          setSkjemaverdierFraTrygdeavgiftsgrunnlag(
            res.nyttGrunnlag?.trygdeavgiftsgrunnlag || res.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag
          );
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setAarsavregningResponse(undefined);
        }
      });
  }, []);

  // Innlasting ved valg av år, oppretter eller henter årsavregning
  useEffect(() => {
    /* TODO: Refaktorert api skal ha nytt endepunkt som lar oss sjekke om et gitt år og behandlingID har en aktiv årsavregning.
        Legg til kall mot dette endepunktet og kjør enten hent eller lag basert på responsen.
     */
    if (redigerbart && valgtÅr && valgtÅr !== aarsavregningResponse?.aar) {
      Api.Aarsavregning.hentFiltrertAarsavregningList(saksnummer, valgtÅr, FERDIGBEHANDLET).then((res) => {
        if (res.length > 0) {
          setNyVurderingÅrsavregning(true);
        } else {
          setNyVurderingÅrsavregning(false);
        }
      });

      Api.Aarsavregning.lagAarsavregning(behandlingID, { aar: valgtÅr })
        .then((res) => {
          setAarsavregningResponse(res);
          // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
          dispatch({ type: OK, data: res });
          if (res?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
            setSkjemaverdierFraTrygdeavgiftsgrunnlag(res?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag);
          }
          setValue("totaltForskuddsvisFakturert", "");
          setErAvvik(undefined);
        })
        .catch((error: any) => {
          setFeil(error.body?.message || error);
        });
    }
  }, [valgtÅr]);

  useEffect(() => {
    if (redigerbart && aarsavregningResponse?.nyttGrunnlag) {
      if (aarsavregningResponse.nyttGrunnlag?.avgift.totalAvgift !== aarsavregningResponse.avregning?.nyttTotalbeloep) {
        Api.Aarsavregning.oppdaterTotalBelop(behandlingID, aarsavregningID, {
          avregning: {
            nyttTotalbeloep: aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift,
          },
        });
      }
    }
  }, [aarsavregningResponse?.nyttGrunnlag?.avgift.totalAvgift]);

  const medlemskapsTypeErPliktig = medlemskapsperioder?.every(
    (periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG
  );

  const {
    control,
    watch,
    setValue,
    formState: { isValid: formIsValid, isValidating },
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

  useEffect(() => {
    if (
      redigerbart &&
      formValues.totaltForskuddsvisFakturert &&
      formValues.totaltForskuddsvisFakturert !== aarsavregningResponse?.avregning?.tidligereFakturertBeloep
    ) {
      Api.Aarsavregning.oppdaterTotalBelop(behandlingID, aarsavregningID, {
        avregning: {
          tidligereFakturertBeloep: formValues.totaltForskuddsvisFakturert,
        },
      });
    }
  }, [formValues.totaltForskuddsvisFakturert]);

  const beregnTrygdeavgiftsperioder = useCallback(
    (formVerdier: FieldValue<FormValuesProps>) => {
      setFeil(undefined);
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
          Api.Aarsavregning.hentAarsavregning(behandlingID, aarsavregningID).then((response: AarsavregningResponse) => {
            setAarsavregningResponse(response);
          });
          setFeil(undefined);
        })
        .catch((error) => setFeil(mapFeilmelding(error)));
    },
    [behandlingID, medlemskapsTypeErPliktig, setFeil, setAarsavregningResponse]
  );

  const debounceBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((formVerdier) => beregnTrygdeavgiftsperioder(formVerdier), 500),
    [beregnTrygdeavgiftsperioder]
  );

  const aktivFeilmeldingType = finnAktivFeilmelding(
    formValues?.inntektskilder,
    formValues?.skatteforholdsperioder,
    medlemskapsperioder,
    innvilgetMedlemskapsperiode
  );

  // erAvvik trigger en beregning på gammelt grunnlag etter å ha oppdatert skjemaverdier i håndterAvvik. Dette må gjøres for å oppdatere lagrede verdier i api
  useEffect(() => {
    if (redigerbart && erAvvik && !isValidating && formIsValid && !feilMeldingBlokkerer(aktivFeilmeldingType)) {
      debounceBeregnTrygdeavgiftsperioder(formValues);
    }
  }, [formIsValid, isValidating, aktivFeilmeldingType, erAvvik]);

  const stegErGyldig = Boolean(
    (erAvvik === false && formIsValid) || (formIsValid && erAvvik && aarsavregningResponse?.nyttGrunnlag)
  );
  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const håndterAvvik = (value: boolean) => {
    if (!value) {
      Api.Trygdeavgift.slettTrygdeavgiftsperioder(behandlingID).then(() => {
        resetSkatteforholdsperioder([]);
        resetInntektskilder([]);
        Api.Aarsavregning.hentAarsavregning(behandlingID, aarsavregningID).then((response: AarsavregningResponse) => {
          setAarsavregningResponse(response);
        });
      });
    } else if (aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
      setSkjemaverdierFraTrygdeavgiftsgrunnlag(
        aarsavregningResponse.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag
      );
    }
    setErAvvik(value);
  };

  const håndterEndringAvÅr = (event: ChangeEvent<HTMLSelectElement>) => {
    const år = event.target.value ? parseInt(event.target.value, 10) : undefined;
    setFeil(undefined);
    setValgtÅr(år || null);
  };

  return (
    <div className="vurderingAarsavregning">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Årsavregning</Nav.Typo.Innholdstittel>
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
      {feil && <Nav.Alert variant="error">{feil}</Nav.Alert>}
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
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig!!}
          tittel="Forskuddsvis beregnet trygdeavgift"
        />
      )}

      {aarsavregningResponse?.tidligereGrunnlagsopplysninger && (
        <Nav.RadioGroup
          onChange={håndterAvvik}
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
