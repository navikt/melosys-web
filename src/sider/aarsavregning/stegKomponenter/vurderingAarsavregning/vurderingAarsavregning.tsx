import TrygdeavgiftsperioderTabell from "./komponenter/trygdeavgiftsperioderTabell";
import * as Api from "../../../../services/api";
import MedlemskapsPerioderTabell from "./komponenter/medlemskapsPerioderTabell";
import "./vurderingAarsavregning.css";
import { useCallback, useEffect, useState } from "react";
import { AarsavregningResponse, Trygdeavgiftsgrunnlag } from "../../../../services/modules/aarsavregning/aarsavregning";
import { useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import * as Nav from "../../../../navFrontend";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import SkatteforholdsPerioderTabell from "./komponenter/skatteforholdsPerioderTabell";
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
import { TrygdeavgiftsgrunnlagDto } from "../../../../services/modules/trygdeavgift";
import * as Utils from "../../../../utils";
import vurderingAarsavregningSchema from "./vurderingAarsavregningSchema";
import { feilMeldingBlokkerer, finnAktivFeilmelding, Feilmelding } from "./meldinger";
import { erBrukerSkattepliktigIHelePerioden } from "../../../ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgiftSchema";
import { useAsyncCallbackState } from "../../../../hooks";
import MKV from "../../../../melosyskodeverk";

export const VurderingAarsavregning = () => {
  const [valgtÅr, setValgtÅr] = useState<number | undefined>(undefined);
  const [erAvvik, setErAvvik] = useState<boolean | undefined>(undefined);
  const [feil, setFeil] = useState<undefined | string>(undefined);
  const [lagretTrygdeavgift, setLagretTrygdeavgift] = useState<AarsavregningResponse | undefined>(undefined);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const sisteMuligeÅr = new Date().getFullYear() - 1;
  const antallÅrTilbakeITid = 6;
  const muligeAar = Array.from({ length: antallÅrTilbakeITid }, (_, i) => sisteMuligeÅr - i);
  const [defaultPeriode, setDefaultPeriode] = useState<{ fomDato: string; tomDato: string } | undefined>(undefined);
  const medlemskapsperioder =
    lagretTrygdeavgift?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder;
  const innvilgetMedlemskapsperiode = {
    fom: defaultPeriode?.fomDato,
    tom: defaultPeriode?.tomDato,
  };
  const [lagrePending, setLagrePending] = useState(false);
  const [lagretTrygdeavgiftsperioder, setTrygdeavgiftsperioder] = useAsyncCallbackState(
    () => Api.Trygdeavgift.hentBeregnetTrygdeavgift(behandlingID),
    undefined,
    []
  );
  const trygdeavgiftErIkkeTom = !Utils._isEmpty(lagretTrygdeavgiftsperioder?.trygdeavgiftsperioder);
  const alleTrygdeavgiftsperioderHarNullBeløp = lagretTrygdeavgiftsperioder?.trygdeavgiftsperioder.every(
    (periode) => periode.avgiftPerMd === 0
  );
  const medlemskapsTypeErPliktig = medlemskapsperioder?.every(
    (periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG
  );

  const {
    control,
    watch,
    formState: { isValid: formIsValid, isValidating, errors },
    trigger,
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

  const stegErGyldig = formIsValid && !feilMeldingBlokkerer(aktivFeilmeldingType) && !feil;

  useEffect(() => {
    fetchAvregningsData();
  }, []);

  const fetchAvregningsData = () => {
    console.log("fetchAvregningsData");
    return Api.Aarsavregning.hentAvregningsData(behandlingID)
      .then((response: AarsavregningResponse) => {
        setLagretTrygdeavgift(response);
        setValgtÅr(response.aar);
        setErAvvik(response.avvikFunnet);
        return response;
      })
      .catch((error: any) => {
        if (error.response?.status === 404) {
          setLagretTrygdeavgift(undefined);
          setValgtÅr(undefined);
        }
      });
  };

  const debounceBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((formVerdier, isValid) => isValid && beregnTrygdeavgiftsperioder(formVerdier), 500),
    []
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
  ]);

  const beregnTrygdeavgiftsperioder = (formVerdier: FieldValue<FormValuesProps>) => {
    console.log("formverider", formVerdier);
    setFeil(undefined);
    setLagrePending(true);
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
  };

  const mapFeilmelding = (error: any) => {
    const feilmelding = "Finner ikke trygdeavgiftssats. Melosys har ikke satser for årene før 2014.";

    const ingenGjeldendeSats = error.body?.feilkoder?.some((feilkode: string) =>
      feilkode.startsWith("Ingen gjeldende sats finnes for perioden")
    );

    if (ingenGjeldendeSats) return feilmelding;

    return error.body?.feilkoder || error.body?.message || error;
  };

  // const harTidligereGrunnlagsopplysninger = () => {
  //   return (
  //     lagretTrygdeavgift?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.inntektskperioder !== null &&
  //     lagretTrygdeavgift?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.skatteforholdsperioder !== null
  //   );
  // };

  // const settTrygdeavgiftFraTidligereGrunnlag = (formVerdier: FieldValue<FormValuesProps>) => {
  //   setFeil(undefined);
  //   // setLagrePending(true);
  //   // const erBrukerPliktigMedlemOgSkattepliktig =
  //   //   medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(formVerdier.skatteforholdsperioder);
  //
  //   if (harTidligereGrunnlagsopplysninger()) {
  //     Api.Trygdeavgift.beregnTrygdeavgiftsperioder(behandlingID, {
  //       skatteforholdsperioder:
  //         lagretTrygdeavgift!.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag!.skatteforholdsperioder,
  //       inntektskilder: lagretTrygdeavgift!.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag!.inntektskperioder,
  //     })
  //       .then((beregnetTrygdeavgift) => {
  //         setFeil(undefined);
  //         // setTrygdeavgift(beregnetTrygdeavgift);
  //       })
  //       .catch((error) => setFeil(error));
  //     // .finally(() => setLagrePending(false));
  //   }
  // };

  const håndterLagretTrygdeavgiftsgrunnlag = (trygdeavgiftsgrunnlag: Trygdeavgiftsgrunnlag) => {
    console.log("håndterLagretTrygdeavgiftsgrunnlag");
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

  const håndterAvvik = (avvik: boolean | undefined) => {
    console.log("håndter avvik", avvik);
    setErAvvik(avvik);
    if (avvik) {
      console.log("er inn i avvik");
      const minFomDato =
        lagretTrygdeavgift!.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag!.skatteforholdsperioder.sort((a, b) =>
          a.fomDato.localeCompare(b.fomDato)
        )[0].fomDato;
      const maxTomDato =
        lagretTrygdeavgift!.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag!.skatteforholdsperioder.sort((a, b) =>
          b.tomDato.localeCompare(a.tomDato)
        )[0].tomDato;
      setDefaultPeriode({ fomDato: minFomDato, tomDato: maxTomDato });
      console.log("nyttgrunnlag", lagretTrygdeavgift!.nyttGrunnlag);
      håndterLagretTrygdeavgiftsgrunnlag(
        lagretTrygdeavgift!.nyttGrunnlag
          ? lagretTrygdeavgift!.nyttGrunnlag!
          : lagretTrygdeavgift!.tidligereGrunnlagsopplysninger!.trygdeavgiftsgrunnlag!
      );
    } else {
      resetSkatteforholdsperioder([defaultPeriode!]);
      resetInntektskilder([defaultPeriode!]);
    }
  };

  const håndterEndringAvÅr = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const år = parseInt(event.target.value, 10);
    setFeil(undefined);
    setValgtÅr(år);
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

    håndterAvvik(undefined);

    Api.Aarsavregning.lagAvregningsData(behandlingID, { aar: valgtÅr })
      .then((nyAvregningsData) => setLagretTrygdeavgift(nyAvregningsData))
      .catch((error: any) => {
        setFeil(error.body?.message || error);
      });
  }, [valgtÅr]);

  console.log("formValid", formIsValid);

  return (
    <div className="vurderingAarsavregning">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Årsavregning</Nav.Typo.Innholdstittel>
      <Nav.Fieldset className="select" legend={<LabelMedHjelpetekst bold label="År" placement="left-start" />}>
        <Nav.Row>
          <Nav.Column xs="4">
            <Nav.Select label="" id="aarVelger" value={valgtÅr ?? ""} onChange={håndterEndringAvÅr}>
              <option key="" value="" disabled>
                Velg...
              </option>
              {muligeAar.map((aar) => (
                <option key={aar} value={aar}>
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
          onChange={håndterAvvik}
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
          </Nav.Column>
        </Nav.Row>
      )}

      {erAvvik && medlemskapsTypeErPliktig && (
        <Inntektskilder
          formValues={formValues}
          redigerbart={redigerbart}
          update={inntektUpdate}
          remove={inntektRemove}
          append={inntektAppend}
          control={control}
          defaultPeriode={defaultPeriode}
          fields={inntektFields}
          medlemskapsTypeErPliktig={medlemskapsTypeErPliktig}
        />
      )}

      <Feilmelding type={aktivFeilmeldingType} />

      <Nav.Button variant="primary" disabled={!redigerbart || !stegErGyldig}>
        Bekreft og fortsett
      </Nav.Button>
    </div>
  );
};
