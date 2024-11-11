import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";
import * as Api from "../../../../../services/api";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";

import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { medlemskapsperioderSelectors } from "../../../../../ducks/medlemskapsperioder";
import { useAsyncCallbackState } from "../../../../../hooks";
import { STATUS } from "../../../../../services";

import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import TrygdeavgiftsperioderTabell from "../../../../../felleskomponenter/trygdeavgift/komponenter/trygdeavgiftsperioderTabell";
import {
  FieldArrayProps,
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import vurderingTrygdeavgiftSchema, { erBrukerSkattepliktigIHelePerioden } from "./vurderingTrygdeavgiftSchema";
import "./vurderingTrygdeavgift.css";
import {
  Feilmelding,
  feilMeldingBlokkerer,
  finnAktivFeilmelding,
} from "../../../../../felleskomponenter/trygdeavgift/komponenter/meldinger";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import MKV from "../../../../../melosyskodeverk";
import { BeregnetTrygdeavgift, TrygdeavgiftsgrunnlagDto } from "../../../../../services/modules/trygdeavgift";
import { BOOLSK_STRING } from "../../../../../constants";
import LabelMedHjelpetekst from "../../../../../felleskomponenter/labelMedHjelpetekst";

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingTrygdeavgift = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: Props) => {
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const medlemskapsperiodeStatus = useSelector(medlemskapsperioderSelectors.MedlemskapsperioderStatusSelector);
  const medlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const innvilgetMedlemskapsperiode = useSelector(
    medlemskapsperioderSelectors.SamletInnvilgetMedlemskapsperiodeSelector
  );
  const [lagretTrygdeavgift, setTrygdeavgift] = useAsyncCallbackState(
    () => Api.Trygdeavgift.hentBeregnetTrygdeavgift(behandlingID),
    undefined,
    [behandlingID, medlemskapsperiodeStatus === STATUS.OK]
  );
  const [feil, setFeil] = useState<string | undefined>(undefined);
  const [lagrePending, setLagrePending] = useState(false);
  const [harEndretInnvilgetMedlemskapsperiode, setHarEndretInnvilgetMedlemskapsperiode] = useState<boolean | undefined>(
    undefined
  );

  const alleTrygdeavgiftsperioderHarNullBeløp = lagretTrygdeavgift?.trygdeavgiftsperioder.every(
    (periode) => periode.avgiftPerMd === 0
  );

  const medlemskapsTypeErPliktig = medlemskapsperioder.every(
    (periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG
  );
  const defaultPeriode = {
    fomDato: Utils.dato.formatterDatoTilNorsk(innvilgetMedlemskapsperiode?.fom),
    tomDato: Utils.dato.formatterDatoTilNorsk(innvilgetMedlemskapsperiode?.tom),
  };
  const erÅpenSluttDato = !innvilgetMedlemskapsperiode?.tom;

  const {
    control,
    watch,
    formState: { isValid: formIsValid, isValidating },
    trigger,
  } = useForm({
    resolver: yupResolver(vurderingTrygdeavgiftSchema),
    context: { medlemskapsperiode: innvilgetMedlemskapsperiode, medlemskapsTypeErPliktig, erÅpenSluttDato },
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
  const skalBeregneForelopigTrygdeavgift =
    stegErGyldig &&
    !(medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder)) &&
    formValues?.inntektskilder.some(
      (inntektskilde: Inntektskilde) => inntektskilde.bruttoInntekt && inntektskilde.bruttoInntekt !== 0
    );

  const trygdeavgiftErIkkeTom = !Utils._isEmpty(lagretTrygdeavgift?.trygdeavgiftsperioder);

  const harBeregnetForeløpigTrygdeavgift = !skalBeregneForelopigTrygdeavgift || trygdeavgiftErIkkeTom;
  useEffect(() => {
    if (harEndretInnvilgetMedlemskapsperiode === undefined) {
      setHarEndretInnvilgetMedlemskapsperiode(false);
    } else {
      setHarEndretInnvilgetMedlemskapsperiode(true);
    }
  }, [innvilgetMedlemskapsperiode]);

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
        : [defaultPeriode]
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
        : [{ ...defaultPeriode, erMaanedsbelop: BOOLSK_STRING.SANN }]
    );
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
    if (erÅpenSluttDato) {
      setTrygdeavgift(undefined);
      return;
    }
    Api.Trygdeavgift.hentBeregnetTrygdeavgift(behandlingID).then((beregnetTrygdeavgift) => {
      if (
        behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING &&
        beregnetTrygdeavgift.trygdeavgiftsgrunnlag.skatteforholdsperioder.length === 0
      ) {
        hentOpprinneligTrygdeavgiftsgrunnlag();
      } else {
        håndterTrygdeavgiftsberegning(beregnetTrygdeavgift);
      }
    });
  }, []);

  useEffect(() => {
    oppdaterStatus(stegErGyldig && harBeregnetForeløpigTrygdeavgift);
  }, [stegErGyldig, harBeregnetForeløpigTrygdeavgift]);

  const beregnTrygdeavgiftsperioder = (formVerdier: FieldValue<FormValuesProps>) => {
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
  };

  const mapFeilmelding = (error: any) => {
    const feilmelding = "Finner ikke trygdeavgiftssats. Melosys har ikke satser for årene før 2014.";

    const ingenGjeldendeSats = error.body?.feilkoder?.some((feilkode: string) =>
      feilkode.startsWith("Ingen gjeldende sats finnes for perioden")
    );

    if (ingenGjeldendeSats) return feilmelding;

    return error.body?.feilkoder || error.body?.message || error;
  };

  const debounceBeregnTrygdeavgiftsperioder = useCallback(
    Utils._debounce((formVerdier, isValid) => isValid && beregnTrygdeavgiftsperioder(formVerdier), 500),
    []
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
      }
      if (!erÅpenSluttDato && (feil || harEndretInnvilgetMedlemskapsperiode)) {
        debounceBeregnTrygdeavgiftsperioder(formValues, formIsValid && !feilMeldingBlokkerer(aktivFeilmeldingType));
        setHarEndretInnvilgetMedlemskapsperiode(false);
      }
    }
  }, [aktivtSteg, harEndretInnvilgetMedlemskapsperiode]);

  if (!aktivtSteg) return null;

  const visFeilFraLagring = feil && formIsValid && !feilMeldingBlokkerer(aktivFeilmeldingType);
  return (
    <div className="vurderingTrygdeavgift">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Trygdeavgift</Nav.Typo.Innholdstittel>

      {behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING && (
        <Nav.Typo.Normaltekst className="nyVurderingTekst">
          Ved ny vurdering vises tidligere perioder med skatteforhold og inntekt. Gjør nødvendige endringer eller legg
          til en ny periode.
        </Nav.Typo.Normaltekst>
      )}

      {!erÅpenSluttDato && (
        <>
          <Nav.Typo.Undertittel>Oppgi informasjon om brukers skatteforhold</Nav.Typo.Undertittel>
          <Skatteforholdsperioder
            formValues={formValues}
            redigerbart={redigerbart}
            remove={skattRemove}
            append={skattAppend}
            control={control}
            defaultPeriode={defaultPeriode}
            fields={skattFields}
          />
        </>
      )}

      {!(medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder)) &&
        !erÅpenSluttDato && (
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
              defaultPeriode={defaultPeriode}
              fields={inntektFields}
              medlemskapsTypeErPliktig={medlemskapsTypeErPliktig}
            />
          </>
        )}

      <Feilmelding type={aktivFeilmeldingType} />

      {trygdeavgiftErIkkeTom && !alleTrygdeavgiftsperioderHarNullBeløp && stegErGyldig && (
        <>
          <Nav.Typo.Undertittel>Foreløpig beregnet trygdeavgift</Nav.Typo.Undertittel>
          <TrygdeavgiftsperioderTabell
            lagrePending={lagrePending}
            perioder={lagretTrygdeavgift?.trygdeavgiftsperioder!!}
          />
        </>
      )}

      {visFeilFraLagring && (
        <Nav.Alert variant="error" className="infomelding">
          {feil}
        </Nav.Alert>
      )}

      {!erÅpenSluttDato && !skalBeregneForelopigTrygdeavgift && stegErGyldig && (
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
};
