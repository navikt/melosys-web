import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";

import MKV from "../../../../../melosyskodeverk";
import * as Api from "../../../../../services/api";
import * as Forms from "../../../../../felleskomponenter/forms";
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
import { FieldArrayProps, FormValuesProps, Inntektskilde } from "./komponenter/types";
import vurderingTrygdeavgiftSchema from "./vurderingTrygdeavgiftSchema";
import "./vurderingTrygdeavgift.css";

const { SKATTEPLIKTIG, IKKE_SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;

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
  const [lagretTrygdeavgift, setTrygdeavgift] = useAsyncCallbackState(
    () => Api.Trygdeavgift.hentBeregnetTrygdeavgift(behandlingID),
    undefined,
    [behandlingID, medlemskapsperiodeStatus === STATUS.OK]
  );
  const [feil, setFeil] = useState<string | undefined>(undefined);
  const {
    control,
    watch,
    setValue,
    formState: { isValid: formIsValid, isValidating },
  } = useForm({
    resolver: yupResolver(vurderingTrygdeavgiftSchema),
    mode: "onChange",
    defaultValues: {
      skattepliktig: "",
      inntektskilder: [{}],
    } as FieldValue<FormValuesProps>,
  });
  const {
    fields,
    append,
    remove,
    update,
    replace: resetInntektskilder,
  } = useFieldArray<FieldArrayProps, "inntektskilder", "id">({ control, name: "inntektskilder" });
  const formValues = watch();

  useEffect(() => {
    Api.Trygdeavgift.hentTrygdeavgiftsgrunnlaget(behandlingID).then((lagretTrygdeavgiftsgrunnlag) => {
      setValue("skattepliktig", lagretTrygdeavgiftsgrunnlag.skatteplikttype);
      resetInntektskilder(
        !Utils._isEmpty(lagretTrygdeavgiftsgrunnlag?.inntektskilder)
          ? [...lagretTrygdeavgiftsgrunnlag.inntektskilder].map((kilde) => ({
              kildetype: kilde.type,
              arbAvgBetales: Utils.streng.boolTilUppercaseStreng(kilde.arbeidsgiversavgiftBetales),
              bruttoInntekt: kilde.avgiftspliktigInntektMnd,
              fomDato: Utils.dato.formatterDatoTilNorsk(kilde.fomDato),
              tomDato: Utils.dato.formatterDatoTilNorsk(kilde.tomDato),
            }))
          : [{}]
      );
    });
  }, []);

  const skalBeregneForeløpigTrygdeavgift = formValues.inntektskilder.some(
    (inntektskilde: Inntektskilde) => inntektskilde.bruttoInntekt && inntektskilde.bruttoInntekt !== 0
  );

  const trygdeavgiftErIkkeTom = !Utils._isEmpty(lagretTrygdeavgift?.trygdeavgiftsperioder);

  const harBeregnetForeløpigTrygdeavgift = !skalBeregneForeløpigTrygdeavgift || trygdeavgiftErIkkeTom;

  useEffect(() => {
    oppdaterStatus(formIsValid && harBeregnetForeløpigTrygdeavgift);
  }, [formIsValid, harBeregnetForeløpigTrygdeavgift]);

  const lagreTrygdeavgiftsgrunnlag = (formVerdier: FieldValue<FormValuesProps>) => {
    Api.Trygdeavgift.oppdaterTrygdeavgiftsgrunnlag(behandlingID, {
      skatteplikttype: formVerdier.skattepliktig,
      inntektskilder: [...formVerdier.inntektskilder]?.map((kilde) => ({
        type: kilde.kildetype,
        arbeidsgiversavgiftBetales: Utils.streng.uppercaseStrengTilBool(kilde.arbAvgBetales) || false,
        avgiftspliktigInntektMnd: kilde.bruttoInntekt,
        fomDato: Utils.dato.formatterDatoTilISO(kilde.fomDato),
        tomDato: Utils.dato.formatterDatoTilISO(kilde.tomDato),
      })),
    })
      .then(() => {
        setFeil(undefined);
        Api.Trygdeavgift.hentBeregnetTrygdeavgift(behandlingID)
          .then((response) => {
            setFeil(undefined);
            setTrygdeavgift(response);
          })
          .catch((error) => setFeil(error.body?.message || error));
      })
      .catch((error) => setFeil(error.body?.message || error));
  };

  const debouncedLagreTrygdeavgiftsgrunnlag = useCallback(
    Utils._debounce((formVerdier, isValid) => isValid && lagreTrygdeavgiftsgrunnlag(formVerdier), 500),
    []
  );

  useEffect(() => {
    if (redigerbart && aktivtSteg && !isValidating) {
      debouncedLagreTrygdeavgiftsgrunnlag(formValues, formIsValid);
    }
  }, [formIsValid, isValidating, formValues?.inntektskilder?.length]);

  if (!aktivtSteg) return null;

  const handleEndreSkattepliktig = (skattepliktig: string) => {
    Api.Trygdeavgift.oppdaterTrygdeavgiftsgrunnlag(behandlingID, {
      skatteplikttype: skattepliktig,
      inntektskilder: [],
    })
      .then(() => setFeil(undefined))
      .catch((error) => setFeil(error.body?.message || error));

    resetInntektskilder([{}]);
    setTrygdeavgift(undefined);
  };

  const handleBeregnTrygdeavgift = () => {
    setTrygdeavgift(undefined);
    Api.Trygdeavgift.beregnTrygdeavgift(behandlingID)
      .then((response) => {
        setFeil(undefined);
        setTrygdeavgift(response);
      })
      .catch((error) => setFeil(error.body?.message || error));
  };

  return (
    <div className="vurderingTrygdeavgift">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Trygdeavgift</Nav.Typo.Innholdstittel>

      <Nav.Row>
        <Nav.Typo.Undertittel className="radio-gruppe__label">Er bruker skattepliktig?</Nav.Typo.Undertittel>
        <Nav.Column xs="12" className="radio-gruppe__container">
          <Forms.Radio
            label="Ja"
            name="skattepliktig"
            control={control}
            value={SKATTEPLIKTIG}
            disabled={!redigerbart}
            onChange={handleEndreSkattepliktig}
          />
          <Forms.Radio
            label="Nei"
            name="skattepliktig"
            control={control}
            value={IKKE_SKATTEPLIKTIG}
            disabled={!redigerbart}
            onChange={handleEndreSkattepliktig}
          />
        </Nav.Column>
      </Nav.Row>

      {formValues?.skattepliktig && (
        <Inntektskilder
          formValues={formValues}
          fields={fields}
          redigerbart={redigerbart}
          update={update}
          remove={remove}
          append={append}
          control={control}
        />
      )}

      {skalBeregneForeløpigTrygdeavgift && (
        <Nav.Knapp
          className="beregnKnapp"
          disabled={!redigerbart || !formIsValid || isValidating}
          onClick={handleBeregnTrygdeavgift}
          mini
        >
          Beregn foreløpig trygdeavgift
        </Nav.Knapp>
      )}

      {trygdeavgiftErIkkeTom && formIsValid && (
        <TrygdeavgiftsperioderTabell perioder={lagretTrygdeavgift?.trygdeavgiftsperioder!!} />
      )}

      {feil && <Nav.AlertStripeFeil className="infomelding">{feil}</Nav.AlertStripeFeil>}

      {!skalBeregneForeløpigTrygdeavgift && formIsValid && (
        <Nav.AlertStripeInfo className="infomelding">Trygdeavgift skal ikke betales til NAV</Nav.AlertStripeInfo>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreft,
          disabled: !redigerbart || !formIsValid || !harBeregnetForeløpigTrygdeavgift,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
