import { Control, FieldArrayWithId } from "react-hook-form";
import * as Api from "../../../services/api";

import MKV from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";

import * as Forms from "../../forms";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../ui";
import * as Ikoner from "../../../resources/images";
import * as Utils from "../../../utils";

import { FieldArrayProps, FormValuesProps, Medlemskapsperiode } from "./types";
import { useEffect, useState } from "react";

export interface PeriodeElementerProps {
  redigerbart: boolean;
  control: Control;
  fields: FieldArrayWithId<FieldArrayProps, "medlemskapsperioder">[];
  remove: (index: number) => void;
  append: (medlemskapsperiode: Medlemskapsperiode) => void;
  formValues: FormValuesProps;
  bestemmelser: [];
  tittel?: string;
}

export const Medlemskapsperioder = ({
  redigerbart,
  fields,
  control,
  remove,
  append,
  bestemmelser,
  tittel,
  formValues,
}: PeriodeElementerProps) => {
  const [dekninger, setDekninger] = useState<[]>([]);
  const [valgtBestemmelse, setValgtBestemmelse] = useState<string>();
  useEffect(() => {
    if (valgtBestemmelse) {
      Api.LovligeKombinasjoner.hentTrygdedekninger(valgtBestemmelse).then(setDekninger);
    }
  }, [valgtBestemmelse]);

  const kanSlettePeriode = redigerbart && fields.length !== 1;

  return (
    <div className="medlemskapsperioder">
      <Nav.Typo.Undertittel>{tittel}</Nav.Typo.Undertittel>

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
                />
              </Nav.Column>
              <Nav.Column className="dato">
                <Forms.Datovelger
                  label={index === 0 ? "Til og med" : ""}
                  control={control}
                  name={`medlemskapsperioder[${index}].tomDato`}
                  aria-label={`Til og med periode ${index + 1}`}
                  minDate={Utils.dato.norskStringTilDate(formValues.medlemskapsperioder[index].fomDato)}
                  readOnly={!redigerbart}
                />
              </Nav.Column>
              <Nav.Column>
                <Forms.Select
                  name={`medlemskapsperioder[${index}].bestemmelse`}
                  label={index === 0 ? "Bestemmelse" : ""}
                  hideLabel={index !== 0}
                  aria-label={`Bestemmelse periode ${index + 1}`}
                  control={control}
                  readOnly={!redigerbart}
                  onChange={setValgtBestemmelse}
                >
                  {bestemmelser.map((bestemmelse: any) => (
                    <option key={bestemmelse} value={bestemmelse}>
                      {KV.kodeTilTerm(bestemmelse, MKV.KTObjects.folketrygdloven_kap2_bestemmelser)}
                    </option>
                  ))}
                </Forms.Select>
              </Nav.Column>
              <Nav.Column>
                <Forms.Select
                  name={`medlemskapsperioder[${index}].dekning`}
                  label={index === 0 ? "Dekning" : ""}
                  hideLabel={index !== 0}
                  aria-label={`Trygdedekning periode ${index + 1}`}
                  control={control}
                  readOnly={!redigerbart}
                >
                  {dekninger.map((dekning: any) => (
                    <option key={dekning} value={dekning}>
                      {KV.kodeTilTerm(dekning, MKV.KTObjects.trygdedekninger)}
                    </option>
                  ))}
                </Forms.Select>
              </Nav.Column>
              {kanSlettePeriode && (
                <Nav.Column className={index === 0 ? "slett slett__first" : "slett"}>
                  <Mui.IkonKnapp ikon={Ikoner.Bin} onClick={() => remove(index)} ariaLabel="Slett periode" />
                </Nav.Column>
              )}
            </Nav.Row>
          </div>
        ))}
        {redigerbart && (
          <Nav.Row className="skillestrek">
            <Mui.Lenkeknapp onClick={() => append({})} ikon={Ikoner.Add}>
              Legg til periode
            </Mui.Lenkeknapp>
          </Nav.Row>
        )}
      </div>
    </div>
  );
};
