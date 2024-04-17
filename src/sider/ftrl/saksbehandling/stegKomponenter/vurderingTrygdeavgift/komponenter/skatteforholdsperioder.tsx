import { Control, FieldArrayWithId } from "react-hook-form";

import MKV from "../../../../../../melosyskodeverk";
import * as Forms from "../../../../../../felleskomponenter/forms";
import * as Nav from "../../../../../../navFrontend";
import * as Mui from "../../../../../../felleskomponenter/ui";
import * as Ikoner from "../../../../../../resources/images";

import LabelMedHjelpetekst from "../../../../../../felleskomponenter/labelMedHjelpetekst";
import { FieldArrayProps, FormValuesProps, Skatteforhold } from "./types";
import * as Utils from "../../../../../../utils";
import "./skatteforholdsperioder.css";

interface SkatteforholdsperioderProps {
  formValues: FormValuesProps;
  fields: FieldArrayWithId<FieldArrayProps, "skatteforholdsperioder">[];
  control: Control;
  remove: (index: number) => void;
  append: (skatteforhold: Skatteforhold) => void;
  redigerbart: boolean;
  defaultPeriode?: { fomDato: string; tomDato: string };
}

export const Skatteforholdsperioder = ({
  formValues,
  control,
  remove,
  append,
  redigerbart,
  defaultPeriode,
  fields,
}: SkatteforholdsperioderProps) => {
  return (
    <div className="skatteforholdsperioder">
      <LabelMedHjelpetekst label="Oppgi informasjon om brukers skatteforhold" bold />
      <div className="skjema__panel">
        {formValues.skatteforholdsperioder.map((skatteforhold, index) => {
          return (
            <Nav.Row className="skjema__panel__rad" key={fields[index].id}>
              <Nav.Column className="dato">
                {index === 0 ? <Nav.Typo.Element>Fra og med</Nav.Typo.Element> : null}
                <Forms.Datovelger
                  name={`skatteforholdsperioder[${index}].fomDato`}
                  disabled={!redigerbart}
                  control={control}
                />
              </Nav.Column>

              <Nav.Column className="dato">
                {index === 0 ? <Nav.Typo.Element>Til og med</Nav.Typo.Element> : null}
                <Forms.Datovelger
                  name={`skatteforholdsperioder[${index}].tomDato`}
                  disabled={!redigerbart}
                  control={control}
                  minDate={Utils.dato.norskStringTilDate(formValues.skatteforholdsperioder[index].fomDato)}
                />
              </Nav.Column>

              <Nav.Column>
                {index === 0 ? <Nav.Typo.Element>Er bruker skattepliktig?</Nav.Typo.Element> : null}
                <div className="radioknapp_gruppe">
                  <Forms.Radio
                    label="Ja"
                    name={`skatteforholdsperioder[${index}].skatteplikttype`}
                    control={control}
                    value={MKV.Koder.skatteplikttype.SKATTEPLIKTIG}
                    disabled={!redigerbart}
                  />
                  <Forms.Radio
                    label="Nei"
                    name={`skatteforholdsperioder[${index}].skatteplikttype`}
                    control={control}
                    value={MKV.Koder.skatteplikttype.IKKE_SKATTEPLIKTIG}
                    disabled={!redigerbart}
                  />
                </div>
              </Nav.Column>

              <Nav.Column className={index === 0 ? "slett slett__first" : "slett"}>
                {redigerbart && formValues.skatteforholdsperioder.length > 1 && (
                  <Mui.IkonKnapp ariaLabel="Slett skatteforhold" ikon={Ikoner.Bin} onClick={() => remove(index)} />
                )}
              </Nav.Column>
            </Nav.Row>
          );
        })}

        {redigerbart && (
          <Nav.Row className="skillestrek">
            <Mui.Lenkeknapp ikon={Ikoner.Add} onClick={() => append(defaultPeriode || {})}>
              Legg til skatteforhold
            </Mui.Lenkeknapp>
          </Nav.Row>
        )}
      </div>
    </div>
  );
};
