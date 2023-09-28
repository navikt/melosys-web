import { Control, FieldArrayWithId } from "react-hook-form";

import MKV from "../../../../../../melosyskodeverk";
import * as Forms from "../../../../../../felleskomponenter/forms";
import * as Nav from "../../../../../../navFrontend";
import * as Mui from "../../../../../../felleskomponenter/ui";
import * as Ikoner from "../../../../../../resources/images";

import LabelMedHjelpetekst from "../../../../../../felleskomponenter/labelMedHjelpetekst";
import { FieldArrayProps, FormValuesProps, Skatteforhold } from "./types";

interface SkatteforholdsperioderProps {
  formValues: FormValuesProps;
  fields: FieldArrayWithId<FieldArrayProps, "skatteforholdList">[];
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
    <>
      <LabelMedHjelpetekst
        label="Oppgi informasjon om brukers skatteforhold"
        className="skatteforholdsperioder__label"
        hjelpetekstClassName="hjelpetekst"
      />
      <div className="skatteforholdsperioder">
        <Nav.Row className="skatteforholdsperioder__overskriftrad">
          <Nav.Column xs="3">
            <Nav.Typo.Element>Fra og med</Nav.Typo.Element>
          </Nav.Column>
          <Nav.Column xs="3">
            <Nav.Typo.Element>Til og med</Nav.Typo.Element>
          </Nav.Column>
          <Nav.Column xs="6">
            <Nav.Typo.Element>Er bruker skattepliktig?</Nav.Typo.Element>
          </Nav.Column>
        </Nav.Row>

        {formValues.skatteforholdList.map((skatteforhold, index) => {
          return (
            <Nav.Row key={fields[index].id}>
              <Nav.Column xs="3">
                <Forms.Datovelger
                  name={`skatteforholdList.${index}.fomDato`}
                  disabled={!redigerbart}
                  control={control}
                />
              </Nav.Column>

              <Nav.Column xs="3">
                <Forms.Datovelger
                  name={`skatteforholdList.${index}.tomDato`}
                  disabled={!redigerbart}
                  control={control}
                />
              </Nav.Column>

              <Nav.Column xs="5">
                <Forms.Radio
                  label="Ja"
                  name={`skatteforholdList.${index}.skatteplikttype`}
                  control={control}
                  value={MKV.Koder.skatteplikttype.SKATTEPLIKTIG}
                  disabled={!redigerbart}
                  className="radioknapp_vertikal"
                />
                <Forms.Radio
                  label="Nei"
                  name={`skatteforholdList.${index}.skatteplikttype`}
                  control={control}
                  value={MKV.Koder.skatteplikttype.IKKE_SKATTEPLIKTIG}
                  disabled={!redigerbart}
                  className="radioknapp_vertikal"
                />
              </Nav.Column>

              <Nav.Column xs="1">
                {redigerbart && formValues.skatteforholdList.length > 1 && (
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
    </>
  );
};
