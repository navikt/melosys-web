import React from "react";
import { useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValue, FieldValues, useFieldArray, useForm } from "react-hook-form";
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

const { ARBEIDSINNTEKT_FRA_NORGE, NÆRINGSINNTEKT_FRA_NORGE, INNTEKT_FRA_UTLANDET, MISJONÆR, FN_SKATTEFRITAK } =
  MKV.Koder.inntektskildetype;

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

interface Inntekstsrad {
  inntektskilde?: string;
  arbAvgBetales?: string;
  bruttoInntekt?: string;
}

interface FieldArrayProps {
  inntektsrader: Inntekstsrad[];
}

type FormValuesProps = FieldValues & {
  skattepliktig?: string;
} & FieldArrayProps;

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

  const erSkattepliktig = formValues?.skattepliktig === BOOLSK_STRING.SANN;

  const visArbAvgBetales = (inntektsrad: Inntekstsrad) => !Utils._isEmpty(inntektsrad.inntektskilde);
  const visBruttoInntekt = (inntektsrad: Inntekstsrad) => Boolean(inntektsrad.arbAvgBetales);

  const settesDefaultArbAvgBetales = (inntektskilde?: string) => inntektskilde !== INNTEKT_FRA_UTLANDET;
  const skalFylleInnBruttoInntekt = (inntektsrad: Inntekstsrad) =>
    !erSkattepliktig ||
    [NÆRINGSINNTEKT_FRA_NORGE, FN_SKATTEFRITAK].includes(inntektsrad.inntektskilde) ||
    (inntektsrad.inntektskilde === INNTEKT_FRA_UTLANDET && inntektsrad.arbAvgBetales === BOOLSK_STRING.USANN);

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
                  name={`inntektsrader.${index}.inntektskilde` as const}
                  control={control}
                  disabled={!redigerbart}
                  emptyFieldDisabled={!Utils._isEmpty(formValues.inntektsrader[index].inntektskilde)}
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
                {visArbAvgBetales(field) && (
                  <>
                    <Forms.Radio
                      label="Ja"
                      name={`inntektsrader.${index}.arbAvgBetales` as const}
                      control={control}
                      value={BOOLSK_STRING.SANN}
                      disabled={!redigerbart || settesDefaultArbAvgBetales(field.inntektskilde)}
                      className="radioknapp_vertikal"
                      onChange={(value) => handleEndreArbAvgBetales(index, value)}
                    />
                    <Forms.Radio
                      label="Nei"
                      name={`inntektsrader.${index}.arbAvgBetales` as const}
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
                {visBruttoInntekt(field) && (
                  <>
                    {skalFylleInnBruttoInntekt(field) ? (
                      <Forms.Input
                        label=""
                        name={`inntektsrader.${index}.bruttoInntekt` as const}
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
          ))}
          <Nav.Row className="skillestrek">
            <Mui.Lenkeknapp ikon={Ikoner.Add} onClick={() => append({})}>
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
