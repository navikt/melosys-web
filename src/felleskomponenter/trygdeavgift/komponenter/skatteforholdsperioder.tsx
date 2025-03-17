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
import { DateRangeController } from "../../forms";

interface SkatteforholdsperioderProps {
  formValues: FormValuesProps;
  fields: FieldArrayWithId<FieldArrayProps, "skatteforholdsperioder">[];
  control: Control;
  remove: (index: number) => void;
  append: (skatteforhold: Skatteforhold) => void;
  redigerbart: boolean;
  defaultPeriode?: { fomDato: string; tomDato: string };
  onChange: (values: any) => void;
}

export function Skatteforholdsperioder({
  formValues,
  fields,
  control,
  remove,
  append,
  redigerbart,
  defaultPeriode,
  onChange,
}: SkatteforholdsperioderProps) {
  return (
    <div className="perioder">
      {formValues.skatteforholdsperioder.map((skatteforhold, index) => {
        return (
          <Nav.Row className="periode__rad" key={fields[index].id}>
            <DateRangeController
              name={`skatteforholdsperioder[${index}]`}
              control={control}
              label="Skatteforholdsperiode"
              hideLabel={index !== 0}
              defaultSelected={{
                from: Utils.dato.norskStringTilDate(formValues.skatteforholdsperioder[index].fomDato),
                to: Utils.dato.norskStringTilDate(formValues.skatteforholdsperioder[index].tomDato),
              }}
              fromDate={Utils.dato.norskStringTilDate(defaultPeriode?.fomDato)}
              toDate={Utils.dato.norskStringTilDate(defaultPeriode?.tomDato)}
              showFieldError
              readOnly={!redigerbart}
            />

            <Nav.Column>
              <Forms.RadioGroup
                legend={index === 0 ? "Skattepliktig" : ""}
                hideLegend={index !== 0}
                name={`skatteforholdsperioder[${index}].skatteplikttype`}
                readOnly={!redigerbart}
                control={control}
                className="skatteforholdsperioder-radio-group"
                onChange={onChange}
              >
                <Stack gap="6" direction={{ xs: "column", sm: "row" }} wrap={false}>
                  <Nav.Radio value={MKV.Koder.skatteplikttype.SKATTEPLIKTIG}>Ja</Nav.Radio>
                  <Nav.Radio value={MKV.Koder.skatteplikttype.IKKE_SKATTEPLIKTIG}>Nei</Nav.Radio>
                </Stack>
              </Forms.RadioGroup>
            </Nav.Column>

            <Nav.Column className="slett__knapp">
              {redigerbart && formValues.skatteforholdsperioder.length > 1 && (
                <Mui.IkonKnapp ariaLabel="Slett skatteforhold" ikon={Ikoner.Bin} onClick={() => remove(index)} />
              )}
            </Nav.Column>
          </Nav.Row>
        );
      })}

      {redigerbart && (
        <Nav.Row className="legg-til__rad">
          <Mui.Lenkeknapp ikon={Ikoner.Add} onClick={() => append(defaultPeriode || {})}>
            Legg til skatteforhold
          </Mui.Lenkeknapp>
        </Nav.Row>
      )}
    </div>
  );
}
