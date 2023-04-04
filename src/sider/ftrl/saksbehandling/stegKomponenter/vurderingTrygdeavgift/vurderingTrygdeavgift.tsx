import React from "react";
import { useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues, useFieldArray, useForm } from "react-hook-form";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../../melosyskodeverk";
import * as Forms from "../../../../../felleskomponenter/forms";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Nav from "../../../../../navFrontend";
import * as Ikoner from "../../../../../resources/images";
import * as Utils from "../../../../../utils";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";

import LabelMedHjelpetekst from "../../../../../felleskomponenter/labelMedHjelpetekst";
import { BOOLSK_STRING } from "../../../../../constants";
import vurderingTrygdeavgiftSchema from "./vurderingTrygdeavgiftSchema";
import "./vurderingTrygdeavgift.css";

const { MISJONÆR } = MKV.Koder.inntektskildetype;

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingTrygdeavgift = ({ bekreft, tilbake, aktivtSteg }: Props) => {
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const defaultRad = {
    inntektskilde: "",
    arbeidsavgiftBetales: undefined,
    bruttoInntekt: undefined,
  };
  const {
    control,
    watch,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurderingTrygdeavgiftSchema),
    mode: "onChange",
    defaultValues: {
      skattepliktig: undefined,
      inntektsrader: [defaultRad],
    } as FieldValues,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "inntektsrader" });
  const formValues = watch();

  if (!aktivtSteg) return null;

  console.log(formValues);
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
            />
            <Forms.Radio
              label="Nei"
              name="skattepliktig"
              control={control}
              value={BOOLSK_STRING.USANN}
              disabled={!redigerbart}
            />
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>

      {formValues?.skattepliktig && (
        <Nav.Fieldset
          legend={
            <LabelMedHjelpetekst
              label="Oppgi informasjon om brukers inntekt"
              className="inntektsrader__legend"
              hjelpetekst="Hvis bruker har flere inntekter, f.eks. fra Norge og fra utlandet, så må de legges til enkeltvis."
              hjelpetekstClassName="hjelpetekst"
            />
          }
          className="inntektsrader"
        >
          <Nav.Row className="inntektsrader__overskriftrad">
            <Nav.Column xs="5">
              <Nav.Typo.Element>Type inntekt</Nav.Typo.Element>
            </Nav.Column>
            <Nav.Column xs="3">
              <Nav.Typo.Element>Betales arb.avg. til skatt?</Nav.Typo.Element>
            </Nav.Column>
            <Nav.Column xs="3">
              <Nav.Typo.Element>Brutto inntekt per mnd.</Nav.Typo.Element>
            </Nav.Column>
          </Nav.Row>
          {fields.map((field, index) => (
            <Nav.Row key={field.id}>
              <Nav.Column xs="5">
                <Forms.Select
                  label=""
                  name={`inntektsrader.${index}.inntektskilde`}
                  control={control}
                  disabled={!redigerbart}
                  emptyFieldDisabled={!Utils._isEmpty(formValues.inntektsrader[index].inntektskilde)}
                >
                  {MKV.KTObjects.inntektskildetype
                    .filter(
                      (kt: KTObject) => !(formValues.skattepliktig === BOOLSK_STRING.SANN && kt.kode === MISJONÆR)
                    )
                    .map((kt: KTObject) => (
                      <option key={kt.kode} value={kt.kode}>
                        {kt.term}
                      </option>
                    ))}
                </Forms.Select>
              </Nav.Column>
              <Nav.Column xs="3">
                <Forms.Radio
                  label="Ja"
                  name={`inntektsrader.${index}.arbeidsavgiftBetales`}
                  control={control}
                  value={BOOLSK_STRING.SANN}
                  disabled={!redigerbart}
                  className="radioknapp_vertikal"
                />
                <Forms.Radio
                  label="Nei"
                  name={`inntektsrader.${index}.arbeidsavgiftBetales`}
                  control={control}
                  value={BOOLSK_STRING.USANN}
                  disabled={!redigerbart}
                  className="radioknapp_vertikal"
                />
              </Nav.Column>
              <Nav.Column xs="3">
                <Forms.Input
                  label=""
                  name={`inntektsrader.${index}.bruttoInntekt`}
                  control={control}
                  disabled={!redigerbart}
                />
              </Nav.Column>
              <Nav.Column xs="1">
                {formValues.inntektsrader.length > 1 && (
                  <Mui.Lenkeknapp ikon={Ikoner.Bin} onClick={() => remove(index)} className="slett" />
                )}
              </Nav.Column>
            </Nav.Row>
          ))}
          <Nav.Row className="skillestrek">
            <Mui.Lenkeknapp ikon={Ikoner.Add} onClick={() => append(defaultRad)}>
              Legg til inntekt
            </Mui.Lenkeknapp>
          </Nav.Row>
        </Nav.Fieldset>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{ onClick: bekreft, disabled: !redigerbart || !formIsValid }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
