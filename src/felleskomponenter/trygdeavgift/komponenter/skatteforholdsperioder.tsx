import { Control, FieldArrayWithId } from "react-hook-form";

import MKV from "../../../melosyskodeverk";
import * as Forms from "../../forms";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../ui";
import * as Ikoner from "../../../resources/images";

import { FieldArrayProps, FormValuesProps, Skatteforhold } from "./types";
import * as Utils from "../../../utils";
import "./skatteforholdsperioder.css";
import { Stack } from "@navikt/ds-react";

interface SkatteforholdsperioderProps {
  formValues: FormValuesProps;
  fields: FieldArrayWithId<FieldArrayProps, "skatteforholdsperioder">[];
  control: Control;
  remove: (index: number) => void;
  append: (skatteforhold: Skatteforhold) => void;
  redigerbart: boolean;
  defaultPeriode?: { fomDato: string; tomDato: string };
  tittel?: string;
}

export const Skatteforholdsperioder = ({
  formValues,
  control,
  remove,
  append,
  redigerbart,
  defaultPeriode,
  fields,
  tittel,
}: SkatteforholdsperioderProps) => {
  return (
    <div className="skatteforholdsperioder">
      <Nav.Typo.Undertittel>{tittel || "Oppgi informasjon om brukers skatteforhold"}</Nav.Typo.Undertittel>

      <div className="skjema__panel">
        {formValues.skatteforholdsperioder.map((skatteforhold, index) => {
          return (
            <Nav.Row className="skjema__panel__rad" key={fields[index].id}>
              <Nav.Column className="dato">
                <Forms.Datovelger
                  label={index === 0 ? "Fra og med" : ""}
                  name={`skatteforholdsperioder[${index}].fomDato`}
                  readOnly={!redigerbart}
                  control={control}
                />
              </Nav.Column>

              <Nav.Column className="dato">
                <Forms.Datovelger
                  label={index === 0 ? "Til og med" : ""}
                  name={`skatteforholdsperioder[${index}].tomDato`}
                  readOnly={!redigerbart}
                  control={control}
                  minDate={Utils.dato.norskStringTilDate(formValues.skatteforholdsperioder[index].fomDato)}
                />
              </Nav.Column>

              <Nav.Column className="skattepliktig">
                <Forms.RadioGroup
                  legend={index === 0 ? "Er bruker skattepliktig?" : ""}
                  hideLegend={index !== 0}
                  name={`skatteforholdsperioder[${index}].skatteplikttype`}
                  readOnly={!redigerbart}
                  control={control}
                  className="skatteforholdsperioder-radio-group"
                >
                  <Stack gap="6" direction={{ xs: "column", sm: "row" }} wrap={false}>
                    <Nav.Radio value={MKV.Koder.skatteplikttype.SKATTEPLIKTIG}>Ja</Nav.Radio>
                    <Nav.Radio value={MKV.Koder.skatteplikttype.IKKE_SKATTEPLIKTIG}>Nei</Nav.Radio>
                  </Stack>
                </Forms.RadioGroup>

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
