import React from "react";
import { useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";

import * as Forms from "../../../../../felleskomponenter/forms";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";

import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { BOOLSK_STRING } from "../../../../../constants";

import { Inntektsrader } from "./inntektsrader";
import { FieldArrayProps, FormValuesProps, Inntekstsrad } from "./types";
import vurderingTrygdeavgiftSchema from "./vurderingTrygdeavgiftSchema";
import "./vurderingTrygdeavgift.css";

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingTrygdeavgift = ({ bekreft, tilbake, aktivtSteg }: Props) => {
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const {
    control,
    watch,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurderingTrygdeavgiftSchema),
    mode: "onChange",
    defaultValues: {
      skattepliktig: undefined,
      inntektsrader: [{}],
    } as FieldValue<FormValuesProps>,
  });
  const {
    fields,
    append,
    remove,
    update,
    replace: resetInntektsrader,
  } = useFieldArray<FieldArrayProps, "inntektsrader", "id">({ control, name: "inntektsrader" });
  const formValues = watch();

  if (!aktivtSteg) return null;

  const skalBeregneForeløpigTrygdeavgift = formValues.inntektsrader.some(
    (rad: Inntekstsrad) => !Utils._isEmpty(rad.bruttoInntekt)
  );

  return (
    <div className="vurderingTrygdeavgift">
      <Nav.Typo.Undertittel className="undertittel">Trygdeavgift</Nav.Typo.Undertittel>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Fieldset legend="Er bruker skattepliktig?">
            <Forms.Radio
              label="Ja"
              name="skattepliktig"
              control={control}
              value={BOOLSK_STRING.SANN}
              disabled={!redigerbart}
              onChange={() => resetInntektsrader([{}])}
            />
            <Forms.Radio
              label="Nei"
              name="skattepliktig"
              control={control}
              value={BOOLSK_STRING.USANN}
              disabled={!redigerbart}
              onChange={() => resetInntektsrader([{}])}
            />
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>

      {formValues?.skattepliktig && (
        <Inntektsrader
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

      {!skalBeregneForeløpigTrygdeavgift && formIsValid && (
        <Nav.AlertStripeInfo className="infomelding">Trygdeavgift skal ikke betales til NAV</Nav.AlertStripeInfo>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{ onClick: bekreft, disabled: !redigerbart || !formIsValid }} // TODO: må også sjekke at saksbehandler har beregnet dersom det er relevant
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
