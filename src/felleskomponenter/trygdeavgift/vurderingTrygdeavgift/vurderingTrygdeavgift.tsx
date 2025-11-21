import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useState } from "react";
import { FieldValue, Resolver, useFieldArray, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Mui from "../../ui";
import * as Nav from "../../../navFrontend";
import * as Api from "../../../services/api";
import * as Utils from "../../../utils";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { medlemskapsperioderSelectors } from "../../../ducks/medlemskapsperioder";

import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { useAsyncCallbackState } from "../../../hooks";
import { STATUS } from "../../../services";

import { BOOLSK_STRING } from "../../../constants";
import LabelMedHjelpetekst from "../../labelMedHjelpetekst";
import { Inntektskilder } from "../komponenter/inntektskilder";
import { Feilmelding, feilMeldingBlokkerer, finnAktivFeilmelding } from "../komponenter/meldinger";
import { Skatteforholdsperioder } from "../komponenter/skatteforholdsperioder";
import TrygdeavgiftsperioderTabell from "../komponenter/trygdeavgiftsperioderTabell";
import { FormValuesProps, Inntektskilde, Skatteforhold } from "../komponenter/types";
import MKV from "../../../melosyskodeverk";
import { BeregnetTrygdeavgift, TrygdeavgiftsgrunnlagDto } from "../../../services/modules/trygdeavgift";
import "./vurderingTrygdeavgift.less";
import vurderingTrygdeavgiftSchema from "./vurderingTrygdeavgiftSchema";

import { erBrukerSkattepliktigIHelePerioden } from "../../../sider/aarsavregning/stegKomponenter/vurderingAarsavregning/utils";
import { useFeatureToggle } from "../../../featuretoggle";
import { MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER } from "../../../featuretoggle/toggleNavn";
import { Alert } from "../../../navFrontend";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { harPerioderFraTidligereÅr } from "../../../services/modules/medlemavfolketrygden/medlemskapsperioder";

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

const { NY_VURDERING, MANGLENDE_INNBETALING_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingstyper;

export function VurderingTrygdeavgift({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: Props) {
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const medlemskapsperiodeStatus = useSelector(medlemskapsperioderSelectors.MedlemskapsperioderStatusSelector);
  const medlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const innvilgetMedlemskapsperiode = useSelector(
    medlemskapsperioderSelectors.SamletInnvilgetMedlemskapsperiodeSelector,
  );
  const lovvalgsperioder = useSelector(lovvalgsperioderSelectors.PeriodeSelector);
  const erEuEøs = sakstype === MKV.Koder.sakstyper.EU_EOS;

  const avgiftspliktigeperioder = erEuEøs ? lovvalgsperioder : innvilgetMedlemskapsperiode;

  const skalIkkeViseTidligerePerioderToggle =
    useFeatureToggle(MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER) ?? false;

  const bestemmelse = useSelector(medlemskapsperioderSelectors.BestemmelseSelector);
  const [lagretTrygdeavgift, setTrygdeavgift] = useAsyncCallbackState(
    () => Api.Trygdeavgift.hentBeregnetTrygdeavgift(behandlingID),
    undefined,
    [behandlingID, medlemskapsperiodeStatus === STATUS.OK],
  );
  const [feil, setFeil] = useState<string | undefined>(undefined);
  const [lagrePending, setLagrePending] = useState(false);
  const [harEndretInnvilgetMedlemskapsperiode, setHarEndretInnvilgetMedlemskapsperiode] = useState<boolean | undefined>(
    undefined,
  );
  const [dataErLastet, setDataErLastet] = useState(false);

  const alleTrygdeavgiftsperioderHarNullBeløp = lagretTrygdeavgift?.trygdeavgiftsperioder.every(
    (periode) => periode.avgiftPerMd === 0,
  );

  const medlemskapsTypeErPliktig =
    erEuEøs || medlemskapsperioder.every((periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG);

  const formattedDefaultPeriode = () => {
    const justertFom = skalIkkeViseTidligerePerioderToggle
      ? Utils.dato.justerDatoHvisTidligereÅr(avgiftspliktigeperioder?.fom)
      : avgiftspliktigeperioder?.fom;

    return {
      fomDato: Utils.dato.formatterDatoTilNorsk(justertFom),
      tomDato: Utils.dato.formatterDatoTilNorsk(avgiftspliktigeperioder?.tom),
    };
  };

  const erÅpenSluttDato = !avgiftspliktigeperioder?.tom;
  const erNyVurderingEllerManglendeInnbetaling =
    behandlingstype === NY_VURDERING || behandlingstype === MANGLENDE_INNBETALING_TRYGDEAVGIFT;

  const {
    control,
    watch,
    formState: { isValid: formIsValid, isValidating },
    trigger,
  } = useForm<FormValuesProps>({
    resolver: yupResolver(vurderingTrygdeavgiftSchema) as Resolver<FormValuesProps>,
    context: { medlemskapsperiode: avgiftspliktigeperioder, medlemskapsTypeErPliktig, erÅpenSluttDato },
    mode: "onChange",
    defaultValues: {
      skatteforholdsperioder: [{}],
      inntektskilder: [],
    } as FieldValue<FormValuesProps>,
  });
  const {
    fields: skattFields,
    append: skattAppend,
    remove: skattRemove,
    replace: resetSkatteforholdsperioder,
  } = useFieldArray<FormValuesProps, "skatteforholdsperioder">({
    control,
    name: "skatteforholdsperioder",
  });
  const {
    fields: inntektFields,
    append: inntektAppend,
    remove: inntektRemove,
    update: inntektUpdate,
    replace: resetInntektskilder,
  } = useFieldArray<FormValuesProps, "inntektskilder">({
    control,
    name: "inntektskilder",
  });
  const formValues = watch();

  const aktivFeilmeldingType = finnAktivFeilmelding(
    formValues?.inntektskilder,
    formValues?.skatteforholdsperioder,
    medlemskapsperioder,
    avgiftspliktigeperioder,
  );

  const trygdeavgiftErIkkeTom = !Utils._isEmpty(lagretTrygdeavgift?.trygdeavgiftsperioder);

  const skalIkkeBeregneForelopigTrygdeavgift =
    skalIkkeViseTidligerePerioderToggle &&
    medlemskapsperioder.length > 0 &&
    medlemskapsperioder.every((periode) => new Date(periode.tomDato).getFullYear() < new Date().getFullYear());

  const skalViseSkatteforholdOgInntektsperioder =
    !skalIkkeViseTidligerePerioderToggle ||
    (trygdeavgiftErIkkeTom && !redigerbart) ||
    !skalIkkeBeregneForelopigTrygdeavgift;

  const harMedlemskapsperiodeFraTidligereÅr = harPerioderFraTidligereÅr(medlemskapsperioder);

  const stegErGyldig =
    (formIsValid || skalIkkeBeregneForelopigTrygdeavgift) && !feilMeldingBlokkerer(aktivFeilmeldingType) && !feil;
  const skalBeregneForelopigTrygdeavgift =
    stegErGyldig &&
    !(medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder)) &&
    formValues?.inntektskilder.some(
      (inntektskilde: Inntektskilde) => inntektskilde.bruttoInntekt && inntektskilde.bruttoInntekt !== 0,
    );

  const harBeregnetForeløpigTrygdeavgift =
    !skalBeregneForelopigTrygdeavgift || trygdeavgiftErIkkeTom || skalIkkeBeregneForelopigTrygdeavgift;
  const skalViseInntektskilder =
    !(medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder)) &&
    !erÅpenSluttDato;

  useEffect(() => {
    const skalResetteFormverdier = !dataErLastet;

    if (skalResetteFormverdier) {
      setDataErLastet(false);
    }

    Api.Trygdeavgift.hentBeregnetTrygdeavgift(behandlingID).then((beregnetTrygdeavgift) => {
      if (
        erNyVurderingEllerManglendeInnbetaling &&
        beregnetTrygdeavgift.trygdeavgiftsgrunnlag.skatteforholdsperioder.length === 0
      ) {
        hentOpprinneligTrygdeavgiftsgrunnlag(skalResetteFormverdier);
      } else {
        håndterTrygdeavgiftsberegning(beregnetTrygdeavgift, skalResetteFormverdier);
      }
    });

    if (!redigerbart) {
      return;
    }

    if (harEndretInnvilgetMedlemskapsperiode === undefined) {
      setHarEndretInnvilgetMedlemskapsperiode(false);
    } else {
      setHarEndretInnvilgetMedlemskapsperiode(true);
    }

    if (erÅpenSluttDato) {
      setTrygdeavgift(undefined);
    }
  }, [avgiftspliktigeperioder]);

  const håndterLagretTrygdeavgiftsgrunnlag = (trygdeavgiftsgrunnlag: TrygdeavgiftsgrunnlagDto) => {
    const { inntektskilder, skatteforholdsperioder } = trygdeavgiftsgrunnlag;
    const sorterteInntekstkilder = inntektskilder?.sort(Utils.dato.sorterEtterISOFomDato);
    const sorterteSkatteforhold = skatteforholdsperioder?.sort(Utils.dato.sorterEtterISOFomDato);
    resetSkatteforholdsperioder(
      !Utils._isEmpty(sorterteSkatteforhold)
        ? sorterteSkatteforhold.map((skatteforhold) => ({
            fomDato: Utils.dato.formatterDatoTilNorsk(skatteforhold.fomDato),
            tomDato: Utils.dato.formatterDatoTilNorsk(skatteforhold.tomDato),
            skatteplikttype: skatteforhold.skatteplikttype,
          }))
        : [formattedDefaultPeriode()],
    );
    resetInntektskilder(
      !Utils._isEmpty(sorterteInntekstkilder)
        ? sorterteInntekstkilder.map((inntektskilde) => ({
            kildetype: inntektskilde.type,
            arbAvgBetales:
              inntektskilde.arbeidsgiversavgiftBetales !== null
                ? Utils.streng.boolTilUppercaseStreng(inntektskilde.arbeidsgiversavgiftBetales)
                : "FALSE",
            bruttoInntekt: inntektskilde.avgiftspliktigInntekt,
            fomDato: Utils.dato.formatterDatoTilNorsk(inntektskilde.fomDato),
            tomDato: Utils.dato.formatterDatoTilNorsk(inntektskilde.tomDato),
            erMaanedsbelop: Utils.streng.boolTilUppercaseStreng(inntektskilde.erMaanedsbelop),
          }))
        : [{ ...formattedDefaultPeriode(), erMaanedsbelop: BOOLSK_STRING.SANN }],
    );

    setDataErLastet(true);
  };

  const håndterTrygdeavgiftsberegning = (beregnetTrygdeavgift: BeregnetTrygdeavgift, skalResetteFormverdier = true) => {
    setTrygdeavgift(beregnetTrygdeavgift);
    if (skalResetteFormverdier) {
      const lagretTrygdeavgiftsgrunnlag = beregnetTrygdeavgift.trygdeavgiftsgrunnlag;
      håndterLagretTrygdeavgiftsgrunnlag(lagretTrygdeavgiftsgrunnlag);
    }
  };

  const hentOpprinneligTrygdeavgiftsgrunnlag = (skalResetteFormverdier = true) => {
    if (skalResetteFormverdier) {
      Api.Trygdeavgift.hentOpprinneligTrygdeavgiftsgrunnlag(behandlingID).then(håndterLagretTrygdeavgiftsgrunnlag);
    }
  };

  useEffect(() => {
    oppdaterStatus(stegErGyldig && harBeregnetForeløpigTrygdeavgift);
  }, [stegErGyldig, harBeregnetForeløpigTrygdeavgift]);

  const beregnTrygdeavgiftsperioder = (formVerdier: FieldValue<FormValuesProps>) => {
    setFeil(undefined);
    setLagrePending(true);

    if (skalIkkeBeregneForelopigTrygdeavgift && skalIkkeViseTidligerePerioderToggle) {
      setTrygdeavgift(undefined);
      setLagrePending(false);
    } else {
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
              erMaanedsbelop: true,
            }))
          : [],
      })
        .then((beregnetTrygdeavgift) => {
          setFeil(undefined);
          setTrygdeavgift(beregnetTrygdeavgift);
        })
        .catch((error) => setFeil(mapFeilmelding(error)))
        .finally(() => setLagrePending(false));
    }
  };

  const mapFeilmelding = (error: any) => {
    const feilmelding = "Finner ikke trygdeavgiftssats. Melosys har ikke satser for årene før 2014.";

    const ingenGjeldendeSats = error.body?.feilkoder?.some((feilkode: string) =>
      feilkode.startsWith("Ingen gjeldende sats finnes for perioden"),
    );

    if (ingenGjeldendeSats) return feilmelding;

    return error.body?.feilkoder || error.body?.message || error;
  };

  const debounceBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce(
      (formVerdier: FormValuesProps, isValid: boolean) => isValid && beregnTrygdeavgiftsperioder(formVerdier),
      500,
    ),
    [],
  );

  useEffect(() => {
    if (redigerbart && aktivtSteg && !isValidating && !erÅpenSluttDato) {
      debounceBeregnTrygdeavgiftsperioder(formValues, formIsValid && !feilMeldingBlokkerer(aktivFeilmeldingType));
    }
  }, [
    formIsValid,
    aktivFeilmeldingType,
    isValidating,
    formValues?.inntektskilder?.length,
    formValues?.skatteforholdsperioder?.length,
  ]);

  useEffect(() => {
    if (redigerbart && aktivtSteg && dataErLastet) {
      if (!formIsValid) {
        formValues?.skatteforholdsperioder?.forEach((_periode: any, index: number) => {
          trigger(`skatteforholdsperioder[${index}].fomDato`);
          trigger(`skatteforholdsperioder[${index}].tomDato`);
        });
        formValues?.inntektskilder?.forEach((_periode: any, index: number) => {
          trigger(`inntektskilder[${index}].fomDato`);
          trigger(`inntektskilder[${index}].tomDato`);
        });
        if (!erÅpenSluttDato && (feil || harEndretInnvilgetMedlemskapsperiode)) {
          debounceBeregnTrygdeavgiftsperioder(formValues, formIsValid && !feilMeldingBlokkerer(aktivFeilmeldingType));
          setHarEndretInnvilgetMedlemskapsperiode(false);
        }
      }
    }
  }, [aktivtSteg, harEndretInnvilgetMedlemskapsperiode, dataErLastet]);

  if (!aktivtSteg) return null;

  const visFeilFraLagring = feil && formIsValid && !feilMeldingBlokkerer(aktivFeilmeldingType);

  return (
    <div className="vurderingTrygdeavgift">
      <Nav.Heading level="1" className="stegvelgertittel">
        Trygdeavgift
      </Nav.Heading>

      {erNyVurderingEllerManglendeInnbetaling && !skalIkkeViseTidligerePerioderToggle && redigerbart && (
        <Nav.BodyLong size="small" className="alert--spacing-bottom">
          Ved ny vurdering vises tidligere perioder med skatteforhold og inntekt. Gjør nødvendige endringer eller legg
          til en ny periode.
        </Nav.BodyLong>
      )}

      {skalIkkeViseTidligerePerioderToggle && harMedlemskapsperiodeFraTidligereÅr && redigerbart && (
        <Alert variant="warning" size="small" className="alert--spacing-bottom">
          Trygdeavgift for tidligere år skal fastsettes på årsavregning. Du skal derfor ikke oppgi skatte- og
          inntektsperioder for tidligere år i denne behandlingen.
        </Alert>
      )}

      {!erÅpenSluttDato && skalViseSkatteforholdOgInntektsperioder && (
        <>
          <Nav.Heading size="xsmall">Oppgi informasjon om brukers skatteforhold</Nav.Heading>
          <Skatteforholdsperioder
            formValues={formValues}
            redigerbart={redigerbart}
            remove={skattRemove}
            append={skattAppend}
            control={control}
            defaultPeriode={formattedDefaultPeriode()}
            fields={skattFields}
          />
        </>
      )}

      {skalViseInntektskilder && skalViseSkatteforholdOgInntektsperioder && (
        <>
          <LabelMedHjelpetekst
            label="Oppgi informasjon om brukers inntekt"
            hjelpetekst="Hvis bruker har flere inntekter, f.eks. fra Norge og fra utlandet, så må de legges til enkeltvis."
            undertittel
          />
          <Inntektskilder
            formValues={formValues}
            redigerbart={redigerbart}
            update={inntektUpdate}
            remove={inntektRemove}
            append={inntektAppend}
            control={control}
            defaultPeriode={formattedDefaultPeriode()}
            fields={inntektFields}
            medlemskapsTypeErPliktig={medlemskapsTypeErPliktig}
            bestemmelse={bestemmelse}
          />
        </>
      )}

      <Feilmelding type={aktivFeilmeldingType} />

      {trygdeavgiftErIkkeTom && !alleTrygdeavgiftsperioderHarNullBeløp && stegErGyldig && (
        <>
          <Nav.Heading size="xsmall">Foreløpig beregnet trygdeavgift</Nav.Heading>
          <TrygdeavgiftsperioderTabell
            lagrePending={lagrePending}
            perioder={lagretTrygdeavgift?.trygdeavgiftsperioder}
          />
        </>
      )}

      {visFeilFraLagring && (
        <Nav.Alert variant="error" className="infomelding">
          {feil}
        </Nav.Alert>
      )}

      {!erÅpenSluttDato &&
        !skalBeregneForelopigTrygdeavgift &&
        stegErGyldig &&
        !skalIkkeBeregneForelopigTrygdeavgift && (
          <Nav.Alert variant="info" className="infomelding">
            Trygdeavgift skal ikke betales til NAV
          </Nav.Alert>
        )}

      {erÅpenSluttDato && (
        <Nav.Alert variant="info" className="infomelding">
          Trygdeavgift kan ikke beregnes for medlemskapsperiode uten sluttdato. Hvis personen skal betale trygdeavgift
          til NAV må du angi sluttdato på medlemskapsperiode.
        </Nav.Alert>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreft,
          disabled: !redigerbart || !stegErGyldig || !harBeregnetForeløpigTrygdeavgift,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
}
