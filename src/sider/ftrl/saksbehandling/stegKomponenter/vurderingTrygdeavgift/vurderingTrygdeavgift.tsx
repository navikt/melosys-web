import React, { useCallback, useEffect, useState } from "react";
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
import { useAsyncCallbackState } from "../../../../../hooks";

import { Inntektskilder } from "./komponenter/inntektskilder";
import TrygdeavgiftsperioderTabell from "./komponenter/trygdeavgiftsperioderTabell";
import { FieldArrayProps, FormValuesProps, Inntekstskilde } from "./komponenter/types";
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
  const [lagretTrygdeavgift, setTrygdeavgift] = useAsyncCallbackState(
    () => Api.Trygdeavgift.hentBeregnetTrygdeavgift(behandlingID),
    undefined,
    [behandlingID]
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
        lagretTrygdeavgiftsgrunnlag?.inntektskilder
          ? [...lagretTrygdeavgiftsgrunnlag.inntektskilder].map((kilde) => ({
              kildetype: kilde.type,
              arbAvgBetales: Utils.streng.boolTilUppercaseStreng(kilde.arbeidsgiversavgiftBetales),
              bruttoInntekt: kilde.avgiftspliktigInntektMnd,
            }))
          : [{}]
      );
    });
  }, []);

  const skalBeregneForeløpigTrygdeavgift = formValues.inntektskilder.some(
    (inntekstskilde: Inntekstskilde) => inntekstskilde.bruttoInntekt && inntekstskilde.bruttoInntekt !== 0
  );

  const trygdeavgiftErIkkeTom = !Utils._isEmpty(lagretTrygdeavgift?.trygdeavgiftsperioder);

  const harBeregnetForeløpigTrygdeavgift = !skalBeregneForeløpigTrygdeavgift || trygdeavgiftErIkkeTom;

  useEffect(() => {
    oppdaterStatus(formIsValid && harBeregnetForeløpigTrygdeavgift);
  }, [formIsValid, harBeregnetForeløpigTrygdeavgift]);

  const lagreTrygdeavgiftsgrunnlag = (formVerdier: FieldValue<FormValuesProps>, formErGyldig: boolean) => {
    Api.Trygdeavgift.oppdaterTrygdeavgiftsgrunnlag(behandlingID, {
      skatteplikttype: formVerdier.skattepliktig,
      inntektskilder: formErGyldig
        ? [...formVerdier.inntektskilder]?.map((kilde) => ({
            type: kilde.kildetype,
            arbeidsgiversavgiftBetales: Utils.streng.uppercaseStrengTilBool(kilde.arbAvgBetales) || false,
            avgiftspliktigInntektMnd: kilde.bruttoInntekt,
          }))
        : [],
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
    Utils._debounce(
      (formVerdier, formErGyldig) =>
        !Utils._isEmpty(formVerdier.skattepliktig) && lagreTrygdeavgiftsgrunnlag(formVerdier, formErGyldig),
      250
    ),
    []
  );

  useEffect(() => {
    if (redigerbart && aktivtSteg && !isValidating) {
      debouncedLagreTrygdeavgiftsgrunnlag(formValues, formIsValid);
    }
  }, [formIsValid, isValidating, formValues?.inntektskilder?.length]);

  if (!aktivtSteg) return null;

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
        <Nav.Column xs="12">
          <Nav.Fieldset legend="Er bruker skattepliktig?">
            <Forms.Radio
              label="Ja"
              name="skattepliktig"
              control={control}
              value={SKATTEPLIKTIG}
              disabled={!redigerbart}
              onChange={() => resetInntektskilder([{}])}
            />
            <Forms.Radio
              label="Nei"
              name="skattepliktig"
              control={control}
              value={IKKE_SKATTEPLIKTIG}
              disabled={!redigerbart}
              onChange={() => resetInntektskilder([{}])}
            />
          </Nav.Fieldset>
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
