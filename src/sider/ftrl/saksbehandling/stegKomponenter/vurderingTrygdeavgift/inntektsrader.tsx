import React from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import { Control, FieldArrayWithId } from "react-hook-form";

import MKV from "../../../../../melosyskodeverk";
import * as Forms from "../../../../../felleskomponenter/forms";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Ikoner from "../../../../../resources/images";

import LabelMedHjelpetekst from "../../../../../felleskomponenter/labelMedHjelpetekst";
import { BOOLSK_STRING } from "../../../../../constants";
import { FieldArrayProps, FormValuesProps, Inntekstsrad } from "./types";
import { bruttoInntektKreves } from "./vurderingTrygdeavgiftSchema";

const { ARBEIDSINNTEKT_FRA_NORGE, INNTEKT_FRA_UTLANDET, MISJONÆR } = MKV.Koder.inntektskildetype;

interface InntektsraderProps {
  formValues: FormValuesProps;
  fields: FieldArrayWithId<FieldArrayProps, "inntektsrader">[];
  control: Control;
  update: (index: number, inntektsrad: Inntekstsrad) => void;
  remove: (index: number) => void;
  append: (inntektsrad: Inntekstsrad) => void;
  redigerbart: boolean;
}

export const Inntektsrader = ({
  formValues,
  fields,
  control,
  update,
  remove,
  append,
  redigerbart,
}: InntektsraderProps) => {
  const erSkattepliktig = formValues?.skattepliktig === BOOLSK_STRING.SANN;
  const settesDefaultArbAvgBetales = (inntektskilde?: string) => inntektskilde !== INNTEKT_FRA_UTLANDET;

  const handleEndreInntektskilde = (index: number, inntektskilde: string) => {
    let defaultArbAvgBetales;
    if (settesDefaultArbAvgBetales(inntektskilde)) {
      defaultArbAvgBetales = inntektskilde === ARBEIDSINNTEKT_FRA_NORGE ? BOOLSK_STRING.SANN : BOOLSK_STRING.USANN;
    }
    update(index, { inntektskilde, arbAvgBetales: defaultArbAvgBetales });
  };

  const handleEndreArbAvgBetales = (index: number, arbAvgBetales: string) => {
    update(index, { inntektskilde: formValues.inntektsrader[index].inntektskilde, arbAvgBetales });
  };

  return (
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

      {fields.map((field, index) => {
        const visArbAvgBetales = !Utils._isEmpty(field.inntektskilde);
        const visBruttoInntekt = Boolean(field.arbAvgBetales);
        const skalFylleInnBruttoInntekt = bruttoInntektKreves(
          formValues.skattepliktig,
          field.inntektskilde,
          field.arbAvgBetales
        );

        return (
          <Nav.Row key={field.id}>
            <Nav.Column xs="5">
              <Forms.Select
                label=""
                name={`inntektsrader.${index}.inntektskilde`}
                control={control}
                disabled={!redigerbart}
                emptyFieldDisabled={visArbAvgBetales}
                onChange={(value) => handleEndreInntektskilde(index, value)}
              >
                {MKV.KTObjects.inntektskildetype
                  .filter((kt: KTObject) => !(erSkattepliktig && kt.kode === MISJONÆR))
                  .map((kt: KTObject) => (
                    <option key={kt.kode} value={kt.kode}>
                      {kt.term}
                    </option>
                  ))}
              </Forms.Select>
            </Nav.Column>

            <Nav.Column xs="3">
              {visArbAvgBetales && (
                <>
                  <Forms.Radio
                    label="Ja"
                    name={`inntektsrader.${index}.arbAvgBetales`}
                    control={control}
                    value={BOOLSK_STRING.SANN}
                    disabled={!redigerbart || settesDefaultArbAvgBetales(field.inntektskilde)}
                    className="radioknapp_vertikal"
                    onChange={(value) => handleEndreArbAvgBetales(index, value)}
                  />
                  <Forms.Radio
                    label="Nei"
                    name={`inntektsrader.${index}.arbAvgBetales`}
                    control={control}
                    value={BOOLSK_STRING.USANN}
                    disabled={!redigerbart || settesDefaultArbAvgBetales(field.inntektskilde)}
                    className="radioknapp_vertikal"
                    onChange={(value) => handleEndreArbAvgBetales(index, value)}
                  />
                </>
              )}
            </Nav.Column>

            <Nav.Column xs="3">
              {visBruttoInntekt && (
                <>
                  {skalFylleInnBruttoInntekt ? (
                    <Forms.Input
                      label=""
                      name={`inntektsrader.${index}.bruttoInntekt`}
                      control={control}
                      disabled={!redigerbart}
                    />
                  ) : (
                    <p className="ikkeRelevant">Ikke relevant</p>
                  )}
                </>
              )}
            </Nav.Column>

            <Nav.Column xs="1">
              {formValues.inntektsrader.length > 1 && (
                <Mui.Lenkeknapp ikon={Ikoner.Bin} onClick={() => remove(index)} className="slett" />
              )}
            </Nav.Column>
          </Nav.Row>
        );
      })}

      <Nav.Row className="skillestrek">
        <Mui.Lenkeknapp ikon={Ikoner.Add} onClick={() => append({})}>
          Legg til inntekt
        </Mui.Lenkeknapp>
      </Nav.Row>
    </Nav.Fieldset>
  );
};
