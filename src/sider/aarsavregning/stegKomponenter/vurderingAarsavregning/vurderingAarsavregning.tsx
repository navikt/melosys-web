import TrygdeavgiftsperioderTabell from "./komponenter/trygdeavgiftsperioderTabell";
import * as Api from "../../../../services/api";
import MedlemskapsPerioderTabell from "./komponenter/medlemskapsPerioderTabell";
import "./vurderingAarsavregning.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AarsavregningResponse, Trygdeavgiftsgrunnlag } from "../../../../services/modules/aarsavregning/aarsavregning";
import { useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import * as Nav from "../../../../navFrontend";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import SkatteforholdsPerioderTabell from "./komponenter/skatteforholdsPerioderTabell";
import { TidligereGrunnlagsopplysningerFinnesIkke } from "./komponenter/tidligereGrunnlagsopplysningerFinnesIkke";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";
import { FieldArrayProps, FormValuesProps, Inntektskilde, Skatteforhold } from "../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { Skatteforholdsperioder } from "../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import { Inntektskilder } from "../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Utils from "../../../../utils";
import vurderingAarsavregningSchema from "./vurderingAarsavregningSchema";
import { Feilmelding, feilMeldingBlokkerer, finnAktivFeilmelding } from "./meldinger";
import { erBrukerSkattepliktigIHelePerioden } from "../../../ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgiftSchema";
import MKV from "../../../../melosyskodeverk";
import { BeregnetTrygdeavgift } from "../../../../services/modules/trygdeavgift";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
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

  const aktivFeilmeldingType = finnAktivFeilmelding(
    formValues?.inntektskilder,
    formValues?.skatteforholdsperioder,
    medlemskapsperioder,
    innvilgetMedlemskapsperiode
  );

  useEffect(() => {
    fetchAvregningsData();
  }, []);

  const fetchAvregningsData = () => {
    return Api.Aarsavregning.hentAvregningsData(behandlingID)
      .then((response: AarsavregningResponse) => {
        setLagretTrygdeavgift(response);
        return response;
      })
      .catch((error: any) => {
        if (error.response?.status === 404) {
          setLagretTrygdeavgift(undefined);
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
  }, [lagretTrygdeavgift]);

  const håndterAvvik = (avvik: boolean) => {
    setErAvvik(avvik);

    if (avvik && lagretTrygdeavgift?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag) {
      håndterLagretTrygdeavgiftsgrunnlag(
        lagretTrygdeavgift.nyttGrunnlag || lagretTrygdeavgift.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag
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
      .then((nyAvregningsData) => setLagretTrygdeavgift(nyAvregningsData))
      .catch((error: any) => {
        setFeil(error.body?.message || error);
      });
    setErAvvik(undefined);
  }, [valgtÅr, behandlingID, lagretTrygdeavgift?.aar]);

  // TODO: 0 grunnlag og 0 avvik må også kreve at totalt tidligere fakturert trygdeavgift er registrert
  const stegErGyldig = redigerbart && erAvvik === false;

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  return (
    <div className="vurderingAarsavregning">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Årsavregning</Nav.Typo.Innholdstittel>
      <Nav.Fieldset className="select" legend={<LabelMedHjelpetekst bold label="År" placement="left-start" />}>
        <Nav.Row>
          <Nav.Column xs="4">
            <Nav.Select label="" id="aarVelger" value={valgtÅr?.toString() ?? ""} onChange={håndterEndringAvÅr}>
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
        <TidligereGrunnlagsopplysningerFinnesIkke />
      )}
      {lagretTrygdeavgift?.tidligereGrunnlagsopplysninger && (
        <>
          <MedlemskapsPerioderTabell
            perioder={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.medlemskapsperioder}
          />
          <SkatteforholdsPerioderTabell
            perioder={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.skatteforholdsperioder}
          />
          <TrygdeavgiftsperioderTabell
            perioder={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.avgift.trygdeavgiftsperioder}
            avgift={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.avgift}
          />
        </>
      )}
      {lagretTrygdeavgift?.tidligereGrunnlagsopplysninger && (
        <Nav.RadioGroup
          onChange={(value) => håndterAvvik(value)}
          value={erAvvik}
          legend="Er det avvik i opplysningene fra skatt eller bruker?"
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
          </Nav.Column>medlemskapsTypeErPliktig
        </Nav.Row>
      )}

      {erAvvik  && (
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

      <Feilmelding type={aktivFeilmeldingType} />

      <Nav.Button variant="primary" disabled={!stegErGyldig} onClick={bekreft}>
        Bekreft og fortsett
      </Nav.Button>
    </div>
  );
};
