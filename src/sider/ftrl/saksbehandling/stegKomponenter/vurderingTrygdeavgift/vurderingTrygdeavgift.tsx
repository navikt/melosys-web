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

import { Inntektskilder } from "./komponenter/inntektskilder";
import TrygdeavgiftsperioderTabell from "./komponenter/trygdeavgiftsperioderTabell";
import { FieldArrayProps, FormValuesProps, Inntektskilde, Skatteforhold } from "./komponenter/types";
import vurderingTrygdeavgiftSchema from "./vurderingTrygdeavgiftSchema";
import "./vurderingTrygdeavgift.css";
import { AdvarselMelding, Feilmelding, finnAktivAdvarselmelding, finnAktivFeilmelding } from "./komponenter/meldinger";
import { Skatteforholdsperioder } from "./komponenter/skatteforholdsperioder";

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingTrygdeavgift = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: Props) => {
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const medlemskapsperiodeStatus = useSelector(medlemskapsperioderSelectors.MedlemskapsperioderStatusSelector);
  const innvilgetMedlemskapsperiode = useSelector(
    medlemskapsperioderSelectors.SamletInnvilgetMedlemskapsperiodeSelector
  );
  const [lagretTrygdeavgift, setTrygdeavgift] = useAsyncCallbackState(
    () => Api.Trygdeavgift.hentBeregnetTrygdeavgift(behandlingID),
    undefined,
    [behandlingID, medlemskapsperiodeStatus === STATUS.OK]
  );
  const [defaultPeriode, setDefaultPeriode] = useState<{ fomDato: string; tomDato: string } | undefined>(undefined);
  const [feil, setFeil] = useState<string | undefined>(undefined);
  const [lagrePending, setLagrePending] = useState(false);
  const [harHentetGrunnlag, setHarHentetGrunnlag] = useState(false);
  const {
    control,
    watch,
    formState: { isValid: formIsValid, isValidating },
  } = useForm({
    resolver: yupResolver(vurderingTrygdeavgiftSchema),
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
    innvilgetMedlemskapsperiode
  );
  const aktivAdvarselmeldingType = finnAktivAdvarselmelding(formValues?.inntektskilder);

  const stegErGyldig = formIsValid && !aktivFeilmeldingType;

  const skalBeregneForelopigTrygdeavgift =
    stegErGyldig &&
    formValues?.inntektskilder.some(
      (inntektskilde: Inntektskilde) => inntektskilde.bruttoInntekt && inntektskilde.bruttoInntekt !== 0
    );

  const trygdeavgiftErIkkeTom = !Utils._isEmpty(lagretTrygdeavgift?.trygdeavgiftsperioder);

  const harBeregnetForeløpigTrygdeavgift = !skalBeregneForelopigTrygdeavgift || trygdeavgiftErIkkeTom;

  useEffect(() => {
    const periode = innvilgetMedlemskapsperiode
      ? {
          fomDato: Utils.dato.formatterDatoTilNorsk(innvilgetMedlemskapsperiode.fom),
          tomDato: Utils.dato.formatterDatoTilNorsk(innvilgetMedlemskapsperiode.tom),
        }
      : undefined;

    setDefaultPeriode(periode);

    Api.Trygdeavgift.hentTrygdeavgiftsgrunnlaget(behandlingID).then((lagretTrygdeavgiftsgrunnlag) => {
      const { inntektskilder, skatteforholdsperioder } = lagretTrygdeavgiftsgrunnlag;
      const sorterteInntekstkilder = inntektskilder?.sort(Utils.dato.sorterEtterISOFomDato);
      const sorterteSkatteforhold = skatteforholdsperioder?.sort(Utils.dato.sorterEtterISOFomDato);
      resetSkatteforholdsperioder(
        !Utils._isEmpty(sorterteSkatteforhold)
          ? sorterteSkatteforhold.map((skatteforhold) => ({
              fomDato: Utils.dato.formatterDatoTilNorsk(skatteforhold.fomDato),
              tomDato: Utils.dato.formatterDatoTilNorsk(skatteforhold.tomDato),
              skatteplikttype: skatteforhold.skatteplikttype,
            }))
          : [periode || {}]
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
          : [periode || {}]
      );
      setHarHentetGrunnlag(true);
    });
  }, []);

  useEffect(() => {
    oppdaterStatus(stegErGyldig && harBeregnetForeløpigTrygdeavgift);
  }, [stegErGyldig, harBeregnetForeløpigTrygdeavgift]);

  const lagreTrygdeavgiftsgrunnlag = (formVerdier: FieldValue<FormValuesProps>) => {
    setLagrePending(true);

    Api.Trygdeavgift.oppdaterTrygdeavgiftsgrunnlag(behandlingID, {
      skatteforholdsperioder: formVerdier.skatteforholdsperioder.map((skatteforhold: Skatteforhold) => ({
        fomDato: Utils.dato.formatterDatoTilISO(skatteforhold.fomDato),
        tomDato: Utils.dato.formatterDatoTilISO(skatteforhold.tomDato),
        skatteplikttype: skatteforhold.skatteplikttype,
      })),
      inntektskilder: formVerdier.inntektskilder.map((inntektskilde: Inntektskilde) => ({
        type: inntektskilde.kildetype,
        arbeidsgiversavgiftBetales: Utils.streng.uppercaseStrengTilBool(inntektskilde.arbAvgBetales) || false,
        avgiftspliktigInntektMnd: inntektskilde.bruttoInntekt,
        fomDato: Utils.dato.formatterDatoTilISO(inntektskilde.fomDato),
        tomDato: Utils.dato.formatterDatoTilISO(inntektskilde.tomDato),
      })),
    })
      .then(() => {
        setFeil(undefined);
      })
      .catch((error) => setFeil(error.body?.message || error))
      .finally(() => setLagrePending(false));
  };

  const debouncedLagreTrygdeavgiftsgrunnlag = useCallback(
    Utils._debounce((formVerdier, isValid) => isValid && lagreTrygdeavgiftsgrunnlag(formVerdier), 500),
    []
  );

  useEffect(() => {
    if (redigerbart && harHentetGrunnlag) setTrygdeavgift(undefined);
    if (redigerbart && aktivtSteg && !isValidating) {
      debouncedLagreTrygdeavgiftsgrunnlag(formValues, stegErGyldig);
    }
  }, [stegErGyldig, isValidating, formValues?.inntektskilder?.length, formValues?.skatteforholdsperioder?.length]);

  const handleBeregnTrygdeavgift = () => {
    setTrygdeavgift(undefined);
    Api.Trygdeavgift.beregnTrygdeavgift(behandlingID)
      .then((response) => {
        setFeil(undefined);
        setTrygdeavgift(response);
      })
      .catch((error) => setFeil(error.body?.message || error));
  };

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingTrygdeavgift">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Trygdeavgift</Nav.Typo.Innholdstittel>

      <Nav.Row>
        <Nav.Column xs="9">
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

      <Inntektskilder
        formValues={formValues}
        redigerbart={redigerbart}
        update={inntektUpdate}
        remove={inntektRemove}
        append={inntektAppend}
        control={control}
        defaultPeriode={defaultPeriode}
        fields={inntektFields}
      />

      {skalBeregneForelopigTrygdeavgift && (
        <Nav.Knapp
          className="beregnKnapp"
          disabled={lagrePending || !redigerbart || !stegErGyldig || isValidating}
          onClick={handleBeregnTrygdeavgift}
          mini
        >
          Beregn foreløpig trygdeavgift
        </Nav.Knapp>
      )}

      <Feilmelding type={aktivFeilmeldingType} />
      <AdvarselMelding type={aktivAdvarselmeldingType} />

      {trygdeavgiftErIkkeTom && stegErGyldig && (
        <TrygdeavgiftsperioderTabell perioder={lagretTrygdeavgift?.trygdeavgiftsperioder!!} />
      )}

      {feil && <Nav.AlertStripeFeil className="infomelding">{feil}</Nav.AlertStripeFeil>}

      {!skalBeregneForelopigTrygdeavgift && stegErGyldig && (
        <Nav.AlertStripeInfo className="infomelding">Trygdeavgift skal ikke betales til NAV</Nav.AlertStripeInfo>
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
