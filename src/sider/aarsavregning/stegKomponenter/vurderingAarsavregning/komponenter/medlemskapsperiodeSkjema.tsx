import { Control, FieldArrayWithId } from "react-hook-form";

import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";

import * as Forms from "../../../../../felleskomponenter/forms";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Ikoner from "../../../../../resources/images";
import * as Utils from "../../../../../utils";

import { FieldArrayProps, FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import "./medlemskapsperiodeSkjema.css";
import { useEffect } from "react";

export interface PeriodeElementerProps {
  redigerbart: boolean;
  control: Control;
  field: FieldArrayWithId<FieldArrayProps, "medlemskapsperioder">;
  remove: (index: number) => void;
  formValues: FormValuesProps;
  tittel?: string;
  handleLeggTil: () => void;
  index: number;
  visLeggTil: boolean;
  maksVerdi?: Date;
  minVerdi?: Date;
  trygdedekninger?: string[];
  setValue?: (name: string, value: any) => void;
}

export function MedlemskapsperiodeSkjema({
  redigerbart,
  field,
  control,
  remove,
  formValues,
  tittel,
  handleLeggTil,
  index,
  visLeggTil,
  maksVerdi,
  minVerdi,
  trygdedekninger = [],
  setValue,
}: PeriodeElementerProps) {
  const erPeriodeFraGrunnlag = !formValues.medlemskapsperioder[index]?.redigerbar;
  const kanSlettePeriode = redigerbart && formValues.medlemskapsperioder.length !== 1;
  const tilOgMedDatoForrigePeriode =
    formValues.medlemskapsperioder[index - 1] !== undefined
      ? Utils.dato.norskStringTilDate(formValues.medlemskapsperioder[index - 1]?.tomDato)
      : undefined;
  if (tilOgMedDatoForrigePeriode !== undefined) {
    tilOgMedDatoForrigePeriode.setDate(tilOgMedDatoForrigePeriode.getDate() + 1);
  }

  const kunEnTrygdedekning = trygdedekninger?.length === 1;

  // Set the trygdedekning value whenever trygdedekninger is a list with exactly one item
  useEffect(() => {
    if (setValue && trygdedekninger?.length === 1) {
      const formPath = `medlemskapsperioder[${index}].trygdedekning`;
      const currentValue = formValues.medlemskapsperioder[index]?.trygdedekning;
      const newValue = trygdedekninger[0];

      // Only set if the value is different or empty
      if (!currentValue || currentValue !== newValue) {
        setValue(formPath, newValue);
      }
    }
  // Include formValues in the dependency array to detect changes in the current value
  }, [trygdedekninger, index, setValue, formValues.medlemskapsperioder]);

  return (
    <div className="medlemskapsperiodeSkjema">
      <Nav.Heading size="small">{tittel}</Nav.Heading>

      <div key={field.id}>
        <Nav.Row className="skjema__rad">
          <Nav.Column className="dato">
            <Forms.Datovelger
              label={index === 0 ? "Medlemskapsperiode" : ""}
              control={control}
              minDate={tilOgMedDatoForrigePeriode !== undefined ? tilOgMedDatoForrigePeriode : minVerdi}
              maxDate={tilOgMedDatoForrigePeriode !== undefined ? tilOgMedDatoForrigePeriode : maksVerdi}
              name={`medlemskapsperioder[${index}].fomDato`}
              aria-label={`Fra og med periode ${index + 1}`}
              readOnly={!redigerbart || erPeriodeFraGrunnlag}
            />
          </Nav.Column>
          <Nav.Column className="dato dato__tom">
            <Forms.Datovelger
              label=""
              control={control}
              name={`medlemskapsperioder[${index}].tomDato`}
              aria-label={`Til og med periode ${index + 1}`}
              minDate={Utils.dato.norskStringTilDate(formValues.medlemskapsperioder[index]?.fomDato)}
              maxDate={maksVerdi}
              readOnly={!redigerbart || erPeriodeFraGrunnlag}
            />
          </Nav.Column>
          <Nav.Column className="trygdedekning">
            <Forms.Select
              name={`medlemskapsperioder[${index}].trygdedekning`}
              label={index === 0 ? "Dekning" : ""}
              hideLabel={index !== 0}
              aria-label={`Trygdedekning periode ${index + 1}`}
              control={control}
              readOnly={!redigerbart || erPeriodeFraGrunnlag || kunEnTrygdedekning}
            >
              {trygdedekninger?.map((dekning: any) => (
                <option key={dekning} value={dekning}>
                  {KV.kodeTilTerm(dekning, MKV.KTObjects.trygdedekninger)}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
          {kanSlettePeriode && (
            <Nav.Column className={index === 0 ? "slett__knapp slett__first" : "slett__knapp"}>
              <Mui.IkonKnapp
                ikon={Ikoner.Bin}
                onClick={() => remove(index)}
                ariaLabel="Slett periode"
                disabled={erPeriodeFraGrunnlag}
              />
            </Nav.Column>
          )}
        </Nav.Row>
      </div>
      {redigerbart && formValues.medlemskapsperioder.length === index + 1 && (
        <div className="legg-til__rad">
          <Mui.Lenkeknapp onClick={handleLeggTil} ikon={Ikoner.Add} disabled={!visLeggTil}>
            Legg til periode
          </Mui.Lenkeknapp>
        </div>
      )}
    </div>
  );
}
