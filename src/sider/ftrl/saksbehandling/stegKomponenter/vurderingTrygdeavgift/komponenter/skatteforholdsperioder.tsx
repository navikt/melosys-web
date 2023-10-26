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
    <div className="inntektskilder_komponent">
      <LabelMedHjelpetekst
        label="Oppgi informasjon om brukers skatteforhold"
        className="skatteforhold_label"
        hjelpetekstClassName="hjelpetekst"
      />
      <div className="skatteforholdsperioder">
        <Nav.Row className="overskriftrad">
          <Nav.Column className="dato">
            <Nav.Typo.Element>Fra og med</Nav.Typo.Element>
          </Nav.Column>
          <Nav.Column className="dato">
            <Nav.Typo.Element>Til og med</Nav.Typo.Element>
          </Nav.Column>
          <Nav.Column>
            <Nav.Typo.Element>Er bruker skattepliktig?</Nav.Typo.Element>
          </Nav.Column>
        </Nav.Row>

        {formValues.skatteforholdsperioder.map((skatteforhold, index) => {
          return (
            <Nav.Row className="skatteforholdsperiode" key={fields[index].id}>
              <Nav.Column className="dato">
                <Forms.Datovelger
                  name={`skatteforholdsperioder[${index}].fomDato`}
                  disabled={!redigerbart}
                  control={control}
                />
              </Nav.Column>

              <Nav.Column className="dato">
                <Forms.Datovelger
                  name={`skatteforholdsperioder[${index}].tomDato`}
                  disabled={!redigerbart}
                  control={control}
                  minDate={Utils.dato.norskStringTilDate(formValues.skatteforholdsperioder[index].fomDato)}
                />
              </Nav.Column>

              <Nav.Column className="radioknapp_gruppe">
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
              </Nav.Column>

              <Nav.Column className="slett">
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
