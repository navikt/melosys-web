import { Control, FieldArrayWithId } from "react-hook-form";

import MKV from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";

import * as Forms from "../../forms";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../ui";
import * as Ikoner from "../../../resources/images";

import { FieldArrayProps, FormValuesProps, Medlemskapsperiode } from "./types";

export interface PeriodeElementerProps {
  redigerbart: boolean;
  trygdedekninger: string[];
  innvilgelsesResultater: string[];
  control: Control;
  fields: FieldArrayWithId<FieldArrayProps, "medlemskapsperioder">[];
  handleSlett: (index: number) => void;
  handleChange: (medlemskapsperiode: Medlemskapsperiode[], index: number) => void;
  formValues: FormValuesProps;
  handleLeggTil: () => void;
  visLeggTil: boolean;
}

export const Medlemskapsperioder = ({
  redigerbart,
  fields,
  control,
  handleSlett,
  handleChange,
  handleLeggTil,
  visLeggTil,
}: PeriodeElementerProps) => {
  const kanSlettePeriode = redigerbart && fields.length !== 1;

  return (
    <div className="medlemskapsperioder">
      <div className="skjema__panel">
        {fields?.map((field, index) => (
          <div key={field.id}>
            <Nav.Row className="skjema__panel__rad">
              <Nav.Column className="dato">
                <Forms.Datovelger
                  label={index === 0 ? "Fra og med" : ""}
                  control={control}
                  name={`medlemskapsperioder[${index}].fomDato`}
                  aria-label={`Fra og med periode ${index + 1}`}
                  readOnly={!redigerbart}
                  onChange={(value) => handleChange([{ ...field, fomDato: value }], index)}
                />
              </Nav.Column>
              <Nav.Column className="dato">
                <Forms.Datovelger
                  label={index === 0 ? "Til og med" : ""}
                  control={control}
                  name={`medlemskapsperioder[${index}].tomDato`}
                  aria-label={`Til og med periode ${index + 1}`}
                  readOnly={!redigerbart}
                  onChange={(value) => handleChange([{ ...field, tomDato: value }], index)}
                />
              </Nav.Column>
              <Nav.Column className="trygdedekning">
                <Forms.Select
                  name={`medlemskapsperioder[${index}].trygdedekning`}
                  label={index === 0 ? "Trygdedekning" : ""}
                  hideLabel={index !== 0}
                  aria-label={`Trygdedekning periode ${index + 1}`}
                  control={control}
                  readOnly={!redigerbart}
                  onChange={(value) => handleChange([{ ...field, dekning: value }], index)}
                >
                  {trygdedekninger.map((dekning) => (
                    <option key={dekning} value={dekning}>
                      {KV.kodeTilTerm(dekning, MKV.KTObjects.trygdedekninger)}
                    </option>
                  ))}
                </Forms.Select>
              </Nav.Column>
              {kanSlettePeriode && (
                <Nav.Column className={index === 0 ? "slett slett__first" : "slett"}>
                  <Mui.IkonKnapp ikon={Ikoner.Bin} onClick={() => handleSlett(index)} ariaLabel="Slett periode" />
                </Nav.Column>
              )}
            </Nav.Row>
          </div>
        ))}
        {visLeggTil && (
          <Nav.Row className="skillestrek">
            <Mui.Lenkeknapp onClick={handleLeggTil} ikon={Ikoner.Add}>
              Legg til periode
            </Mui.Lenkeknapp>
          </Nav.Row>
        )}
      </div>
    </div>
  );
};
