import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useState } from "react";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Mui from "../../../felleskomponenter/ui";
import * as Nav from "../../../navFrontend";
import * as Api from "../../../services/api";
import * as Utils from "../../../utils";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { helseutgiftDekkesPeriodeSelector } from "../../../ducks/helseutgiftdekkesperiode";

import { redigerbartSelectors } from "../../../ducks/redigerbart";

import { BOOLSK_STRING } from "../../../constants";
import LabelMedHjelpetekst from "../../../felleskomponenter/labelMedHjelpetekst";
import { Inntektskilder } from "../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import {
  Feilmelding,
  feilMeldingBlokkerer,
  finnAktivFeilmeldingEøsPensjonist,
} from "../../../felleskomponenter/trygdeavgift/komponenter/meldinger";
import { Skatteforholdsperioder } from "../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import TrygdeavgiftsperioderTabell from "../../../felleskomponenter/trygdeavgift/komponenter/trygdeavgiftsperioderTabell";
import {
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../felleskomponenter/trygdeavgift/komponenter/types";
import MKV from "../../../melosyskodeverk";
import { BeregnetTrygdeavgift, TrygdeavgiftsgrunnlagDto } from "../../../services/modules/trygdeavgift";
import { erOrdinaerBeregning } from "../../../felleskomponenter/trygdeavgift/komponenter/beregningsforklaring";
import "./vurderingTrygdeavgift.less";
import vurderingTrygdeavgiftSchema from "./vurderingTrygdeavgiftSchema";

import { erBrukerSkattepliktigIHelePerioden } from "../../aarsavregning/stegKomponenter/vurderingAarsavregning/utils";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { useFeatureToggle } from "../../../featuretoggle";
import { MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER } from "../../../featuretoggle/toggleNavn";

const { EU_EOS } = MKV.Koder.sakstyper;
const { PENSJONIST } = MKV.Koder.behandlinger.behandlingstema;

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
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const [harBeregnetNyTrygdeavgift, setHarBeregnetNyTrygdeavgift] = useState<boolean>(false);
  const skalIkkeViseTidligerePerioderToggle =
    useFeatureToggle(MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER) ?? false;

  const [harEndretHelseutgiftDekkesPeriode, setHarEndretHelseutgiftDekkesPeriode] = useState<boolean | undefined>(
    undefined,
  );

  const helseutgiftDekkesPeriodeData = useSelector(
    helseutgiftDekkesPeriodeSelector.HelseutgiftDekkesPeriodeSelector,
  ).data;
  const foersteHelseutgiftDekkesPeriode = Array.isArray(helseutgiftDekkesPeriodeData)
    ? helseutgiftDekkesPeriodeData[0]
    : undefined;
  const helseutgiftDekkesPeriode = {
    fom: foersteHelseutgiftDekkesPeriode?.fomDato ?? "",
    tom: foersteHelseutgiftDekkesPeriode?.tomDato ?? "",
  };

  const erEøsPensjonist = sakstype === EU_EOS && behandlingstema === PENSJONIST;
  const erNyVurderingEllerManglendeInnbetaling =
    behandlingstype === NY_VURDERING || behandlingstype === MANGLENDE_INNBETALING_TRYGDEAVGIFT;

  const [lagretTrygdeavgift, setTrygdeavgift] = useState<BeregnetTrygdeavgift>();

  const [feil, setFeil] = useState<string | undefined>(undefined);
  const [lagrePending, setLagrePending] = useState(false);
  const alleTrygdeavgiftsperioderHarNullBeløp = lagretTrygdeavgift?.trygdeavgiftsperioder.every(
    (periode) => periode.avgiftPerMd === 0 && erOrdinaerBeregning(periode.beregningsregel),
  );

  const formattedDefaultPeriode = () => {
    const justertFom = skalIkkeViseTidligerePerioderToggle
      ? Utils.dato.justerDatoHvisTidligereÅr(helseutgiftDekkesPeriode?.fom)
      : helseutgiftDekkesPeriode?.fom;

    return {
      fomDato: Utils.dato.formatterDatoTilNorsk(justertFom),
      tomDato: Utils.dato.formatterDatoTilNorsk(helseutgiftDekkesPeriode?.tom),
    };
  };

  const {
    control,
    watch,
    formState: { isValid: formIsValid, isValidating },
    trigger,
    clearErrors,
  } = useForm({
    resolver: yupResolver(vurderingTrygdeavgiftSchema),
    context: { helseutgiftDekkesPeriode: helseutgiftDekkesPeriode },
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
  } = useFieldArray({ control: control as any, name: "skatteforholdsperioder" }) as any;
  const {
    fields: inntektFields,
    append: inntektAppend,
    remove: inntektRemove,
    update: inntektUpdate,
    replace: resetInntektskilder,
  } = useFieldArray({ control: control as any, name: "inntektskilder" }) as any;
  const formValues = watch();

  const aktivFeilmeldingType = finnAktivFeilmeldingEøsPensjonist(
    formValues?.inntektskilder,
    formValues?.skatteforholdsperioder,
    helseutgiftDekkesPeriode,
  );

  const skalIkkeBeregneForelopigTrygdeavgift =
    skalIkkeViseTidligerePerioderToggle &&
    new Date(helseutgiftDekkesPeriode.tom).getFullYear() < new Date().getFullYear();

  const trygdeavgiftErIkkeTom = !Utils._isEmpty(lagretTrygdeavgift?.trygdeavgiftsperioder);

  const skalViseSkatteforholdOgInntektsperioder =
    !skalIkkeViseTidligerePerioderToggle ||
    (trygdeavgiftErIkkeTom && !redigerbart) ||
    !skalIkkeBeregneForelopigTrygdeavgift;

  const harHelseutgiftDekkesPeriodeFraTidligereÅr =
    new Date(helseutgiftDekkesPeriode.fom).getFullYear() < new Date().getFullYear();

  const stegErGyldig =
    (formIsValid || skalIkkeBeregneForelopigTrygdeavgift) && !feilMeldingBlokkerer(aktivFeilmeldingType) && !feil;
  const skalBeregneForelopigTrygdeavgift =
    stegErGyldig &&
    !erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder) &&
    formValues?.inntektskilder.some(
      (inntektskilde: Inntektskilde) => inntektskilde.bruttoInntekt && inntektskilde.bruttoInntekt !== 0,
    );

  const harBeregnetForeløpigTrygdeavgift =
    !skalBeregneForelopigTrygdeavgift || trygdeavgiftErIkkeTom || !feil || skalIkkeBeregneForelopigTrygdeavgift;
  const skalViseInntektskilder =
    !erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder) && !skalIkkeBeregneForelopigTrygdeavgift;

  useEffect(() => {
    const { inntektskilder, skatteforholdsperioder } = formValues;

    if (
      !harBeregnetNyTrygdeavgift &&
      erNyVurderingEllerManglendeInnbetaling &&
      inntektskilder.length > 0 &&
      skatteforholdsperioder.length > 0 &&
      redigerbart
    ) {
      debounceBeregnTrygdeavgiftsperioder(formValues, formIsValid && !feilMeldingBlokkerer(aktivFeilmeldingType));
      setHarBeregnetNyTrygdeavgift(true);
    }
  }, [harBeregnetNyTrygdeavgift, formValues]);

  useEffect(() => {
    if (harEndretHelseutgiftDekkesPeriode === undefined) {
      setHarEndretHelseutgiftDekkesPeriode(false);
    } else {
      setHarEndretHelseutgiftDekkesPeriode(true);
    }

    if (harBeregnetForeløpigTrygdeavgift && erNyVurderingEllerManglendeInnbetaling && lagretTrygdeavgift) {
      trigger();
      setHarBeregnetNyTrygdeavgift(false);
      return;
    }

    Api.Trygdeavgift.hentBeregnetTrygdeavgiftEosPensjonist(behandlingID).then((beregnetTrygdeavgift) => {
      if (
        erNyVurderingEllerManglendeInnbetaling &&
        beregnetTrygdeavgift.trygdeavgiftsgrunnlag.skatteforholdsperioder.length === 0
      ) {
        hentOpprinneligTrygdeavgiftsgrunnlag();
      } else {
        håndterTrygdeavgiftsberegning(beregnetTrygdeavgift);
      }
    });

    if (!redigerbart) {
      return;
    }
  }, [helseutgiftDekkesPeriodeData]);

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
    clearErrors();
  };

  const håndterTrygdeavgiftsberegning = (beregnetTrygdeavgift: BeregnetTrygdeavgift) => {
    setTrygdeavgift(beregnetTrygdeavgift);
    const lagretTrygdeavgiftsgrunnlag = beregnetTrygdeavgift.trygdeavgiftsgrunnlag;
    håndterLagretTrygdeavgiftsgrunnlag(lagretTrygdeavgiftsgrunnlag);
  };

  const hentOpprinneligTrygdeavgiftsgrunnlag = () => {
    Api.Trygdeavgift.hentOpprinneligTrygdeavgiftsgrunnlag(behandlingID).then(håndterLagretTrygdeavgiftsgrunnlag);
  };

  useEffect(() => {
    oppdaterStatus(stegErGyldig && harBeregnetForeløpigTrygdeavgift);
  }, [stegErGyldig, harBeregnetForeløpigTrygdeavgift]);

  const eøsPensjonistBeregnTrygdeavgiftsperioder = (formVerdier: FieldValue<FormValuesProps>) => {
    setFeil(undefined);
    setLagrePending(true);
    if (skalIkkeBeregneForelopigTrygdeavgift && skalIkkeViseTidligerePerioderToggle) {
      setTrygdeavgift(undefined);
      setLagrePending(false);
    } else {
      Api.Trygdeavgift.eøsPensjonistBeregnTrygdeavgiftsperioder(behandlingID, {
        skatteforholdsperioder: formVerdier.skatteforholdsperioder.map((skatteforhold: Skatteforhold) => ({
          fomDato: Utils.dato.formatterDatoTilISO(skatteforhold.fomDato),
          tomDato: Utils.dato.formatterDatoTilISO(skatteforhold.tomDato, null),
          skatteplikttype: skatteforhold.skatteplikttype,
        })),
        inntektskilder: erBrukerSkattepliktigIHelePerioden(formVerdier.skatteforholdsperioder)
          ? []
          : formVerdier.inntektskilder.map((inntektskilde: Inntektskilde) => ({
              type: inntektskilde.kildetype,
              arbeidsgiversavgiftBetales: Utils.streng.uppercaseStrengTilBool(inntektskilde.arbAvgBetales) || false,
              avgiftspliktigInntekt: inntektskilde.bruttoInntekt,
              fomDato: Utils.dato.formatterDatoTilISO(inntektskilde.fomDato),
              tomDato: Utils.dato.formatterDatoTilISO(inntektskilde.tomDato, null),
              erMaanedsbelop: true,
            })),
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
      (formVerdier: FormValuesProps, isValid: boolean) =>
        isValid && eøsPensjonistBeregnTrygdeavgiftsperioder(formVerdier),
      500,
    ),
    [],
  );

  useEffect(() => {
    if (redigerbart && aktivtSteg && !isValidating) {
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
    if (redigerbart && aktivtSteg) {
      if (!formIsValid) {
        formValues?.skatteforholdsperioder?.forEach((_periode: any, index: number) => {
          trigger(`skatteforholdsperioder[${index}].fomDato`);
          trigger(`skatteforholdsperioder[${index}].tomDato`);
        });
        formValues?.inntektskilder?.forEach((_periode: any, index: number) => {
          trigger(`inntektskilder[${index}].fomDato`);
          trigger(`inntektskilder[${index}].tomDato`);
        });
        if (feil || harEndretHelseutgiftDekkesPeriode) {
          debounceBeregnTrygdeavgiftsperioder(formValues, formIsValid && !feilMeldingBlokkerer(aktivFeilmeldingType));
          setHarEndretHelseutgiftDekkesPeriode(false);
        }
      }
    }
  }, [aktivtSteg, harEndretHelseutgiftDekkesPeriode]);

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

      {skalIkkeViseTidligerePerioderToggle && harHelseutgiftDekkesPeriodeFraTidligereÅr && (
        <Nav.Alert variant="warning" size="small" className="alert--spacing-bottom">
          Trygdeavgift for tidligere år skal fastsettes på årsavregning. Du skal derfor ikke oppgi skatte- og
          inntektsperioder for tidligere år i denne behandlingen.
        </Nav.Alert>
      )}

      {skalViseSkatteforholdOgInntektsperioder && (
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
            medlemskapsTypeErPliktig={erEøsPensjonist}
            bestemmelse={undefined}
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
            erEøsPensjonist={erEøsPensjonist}
          />
        </>
      )}

      {visFeilFraLagring && (
        <Nav.Alert variant="error" className="infomelding">
          {feil}
        </Nav.Alert>
      )}

      {!skalIkkeBeregneForelopigTrygdeavgift && !skalBeregneForelopigTrygdeavgift && stegErGyldig && (
        <Nav.Alert variant="info" className="infomelding">
          Trygdeavgift skal ikke betales til NAV
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
