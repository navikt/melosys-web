import { Control, FieldArrayWithId } from "react-hook-form";

import MKV from "../../../melosyskodeverk";
import * as Forms from "../../forms";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../ui";
import * as Ikoner from "../../../resources/images";

import { FieldArrayProps, FormValuesProps, Skatteforhold } from "./types";
import * as Utils from "../../../utils";
import "./skatteforholdsperioder.less";
import { HGrid, Stack } from "@navikt/ds-react";

interface SkatteforholdsperioderProps {
  formValues: FormValuesProps;
  fields: FieldArrayWithId<FieldArrayProps, "skatteforholdsperioder">[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  remove: (index: number) => void;
  append: (skatteforhold: Skatteforhold) => void;
  redigerbart: boolean;
  defaultPeriode?: { fomDato: string; tomDato: string };
  minDate?: Date;
  maxDate?: Date;
  forhindreAutoUtfylling?: boolean;
  laasAar?: boolean;
}

export function Skatteforholdsperioder({
  formValues,
  control,
  remove,
  append,
  redigerbart,
  defaultPeriode,
  fields,
  minDate,
  maxDate,
  forhindreAutoUtfylling,
  laasAar,
}: SkatteforholdsperioderProps) {
  return (
    <div className="perioder">
      {formValues.skatteforholdsperioder.map((skatteforhold, index) => {
        return (
          <HGrid className="periode__rad" key={fields[index].id}>
            <Forms.Datovelger
              className="dato"
              label={index === 0 ? "Skatteforhold" : ""}
              name={`skatteforholdsperioder[${index}].fomDato`}
              readOnly={!redigerbart}
              control={control}
              minDate={minDate}
              maxDate={maxDate}
              forhindreAutoUtfylling={forhindreAutoUtfylling}
              laasAar={laasAar}
            />

            <Forms.Datovelger
              className="dato"
              label={index === 0 && <span className="invisible" />}
              name={`skatteforholdsperioder[${index}].tomDato`}
              readOnly={!redigerbart}
              control={control}
              minDate={Utils.dato.norskStringTilDate(formValues.skatteforholdsperioder[index].fomDato) || minDate}
              maxDate={maxDate}
              forhindreAutoUtfylling={forhindreAutoUtfylling}
              laasAar={laasAar}
            />

            <Forms.RadioGroup
              legend={index === 0 ? "Skattepliktig" : ""}
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

            <span className="slett__knapp">
              {redigerbart && formValues.skatteforholdsperioder.length > 1 && (
                <Mui.IkonKnapp ariaLabel="Slett skatteforhold" ikon={Ikoner.Bin} onClick={() => remove(index)} />
              )}
            </span>
          </HGrid>
        );
      })}

      <Mui.Lenkeknapp
        className="legg-til__rad"
        disabled={!redigerbart}
        ikon={Ikoner.Add}
        onClick={() => append(defaultPeriode || {})}
      >
        Legg til skatteforhold
      </Mui.Lenkeknapp>
    </div>
  );
}
