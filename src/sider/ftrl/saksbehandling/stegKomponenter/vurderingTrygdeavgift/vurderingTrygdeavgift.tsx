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

import { Inntektskilder } from "./inntektskilder";
import { FieldArrayProps, FormValuesProps, Inntekstskilde } from "./types";
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
  const [lagretTrygdeavgift] = useAsyncCallbackState(
    () => Api.Trygdeavgift.hentTrygdeavgiftsgrunnlaget(behandlingID),
    undefined,
    [behandlingID]
  );
  const [feil, setFeil] = useState<string | undefined>(undefined);
  const {
    control,
    watch,
    formState: { isValid: formIsValid, isValidating },
  } = useForm({
    resolver: yupResolver(vurderingTrygdeavgiftSchema),
    mode: "onChange",
    values: {
      skattepliktig: lagretTrygdeavgift?.skatteplikttype,
      inntektskilder: lagretTrygdeavgift?.inntektskilder
        ? [...lagretTrygdeavgift.inntektskilder].map((kilde) => ({
            kildetype: kilde.type,
            arbAvgBetales: Utils.streng.boolTilUppercaseStreng(kilde.arbeidsgiversavgiftBetales),
            bruttoInntekt: kilde.avgiftspliktigInntektMnd,
          }))
        : [{}],
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
    oppdaterStatus(formIsValid);
  }, [formIsValid]);

  const lagreTrygdeavgiftsgrunnlag = (formVerdier: FieldValue<FormValuesProps>) => {
    Api.Trygdeavgift.oppdaterTrygdeavgiftsgrunnlag(behandlingID, {
      skatteplikttype: formVerdier.skattepliktig,
      inntektskilder: [...formVerdier.inntektskilder]?.map((kilde) => ({
        type: kilde.kildetype,
        arbeidsgiversavgiftBetales: Utils.streng.uppercaseStrengTilBool(kilde.arbAvgBetales) || false,
        avgiftspliktigInntektMnd: kilde.bruttoInntekt,
      })),
    })
      .then(() => setFeil(undefined))
      .catch((error) => setFeil(error.body?.message || error));
  };

  const debouncedLagreMedlemskapsperioder = useCallback(
    Utils._debounce((formVerdier, isValid) => isValid && lagreTrygdeavgiftsgrunnlag(formVerdier), 500),
    []
  );

  useEffect(() => {
    if (redigerbart && aktivtSteg && !isValidating) {
      debouncedLagreMedlemskapsperioder(formValues, formIsValid);
    }
  }, [formIsValid, isValidating]);

  if (!aktivtSteg) return null;

  const skalBeregneForeløpigTrygdeavgift = formValues.inntektskilder.some(
    (inntekstskilde: Inntekstskilde) => !Utils._isEmpty(inntekstskilde.bruttoInntekt)
  );

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
        <Nav.Hovedknapp
          className="beregnKnapp"
          disabled={!redigerbart || !formIsValid}
          onClick={() => console.log("Beregn foreløpig trygdeavgift")}
          mini
        >
          Beregn foreløpig trygdeavgift
        </Nav.Hovedknapp>
      )}

      {feil && <Nav.AlertStripeFeil className="infomelding">{feil}</Nav.AlertStripeFeil>}

      {!skalBeregneForeløpigTrygdeavgift && formIsValid && (
        <Nav.AlertStripeInfo className="infomelding">Trygdeavgift skal ikke betales til NAV</Nav.AlertStripeInfo>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreft,
          disabled: !redigerbart || !formIsValid,
        }} // TODO: må også sjekke at saksbehandler har beregnet dersom det er relevant
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
