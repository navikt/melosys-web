import { Control, FieldArrayWithId, UseFieldArrayUpdate } from "react-hook-form";
import * as Api from "../../../../../services/api";

import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";

import * as Forms from "../../../../../felleskomponenter/forms";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Ikoner from "../../../../../resources/images";
import * as Utils from "../../../../../utils";

import { useEffect, useState } from "react";
import { FieldArrayProps, FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import "./medlemskapsperioder.css";

export interface PeriodeElementerProps {
  redigerbart: boolean;
  control: Control;
  field: FieldArrayWithId<FieldArrayProps, "medlemskapsperioder">;
  remove: (index: number) => void;
  formValues: FormValuesProps;
  bestemmelser: [];
  tittel?: string;
  handleChange: (medlemskapsperiode: Medlemskapsperiode[], index: number) => void;
  handleLeggTil: () => void;
  handleUpdate: UseFieldArrayUpdate<FieldArrayProps, "medlemskapsperioder">;
  index: number;
  visLeggTil: boolean;
  maksVerdi?: Date;
  minVerdi?: Date;
}

export function Medlemskapsperioder({
  redigerbart,
  field,
  control,
  remove,
  formValues,
  bestemmelser,
  tittel,
  handleChange,
  handleLeggTil,
  handleUpdate,
  index,
  visLeggTil,
  maksVerdi,
  minVerdi,
}: PeriodeElementerProps) {
  const [trygdedekninger, setTrygdedekninger] = useState<[]>([]);
  const kodeverkKoderIBestemmelserNedtrekk: string[] = [
    ...Object.values(MKV.KTObjects.folketrygdloven_kap2_bestemmelser),
    ...Object.values(MKV.KTObjects.vertslandsavtale_bestemmelser),
  ] as string[];

  useEffect(() => {
    if (field.bestemmelse) {
      Api.LovligeKombinasjoner.hentTrygdedekninger(field.bestemmelse).then(setTrygdedekninger);
    }
  }, [field.bestemmelse]);

  const kanSlettePeriode = redigerbart && formValues.medlemskapsperioder.length !== 1;
  const forrigeTomDato =
    formValues.medlemskapsperioder[index - 1] !== undefined
      ? Utils.dato.norskStringTilDate(formValues.medlemskapsperioder[index - 1].tomDato)
      : undefined;
  if (forrigeTomDato !== undefined) {
    forrigeTomDato.setDate(forrigeTomDato.getDate() + 1);
  }

  return (
    <div className="medlemskapsperioder">
      <Nav.Heading size="small">{tittel}</Nav.Heading>

      <div key={field.id}>
        <Nav.Row className="medlemskapsperioder__rad">
          <Nav.Column className="dato">
            <Forms.Datovelger
              label={index === 0 ? "Medlemskapsperiode" : ""}
              control={control}
              minDate={forrigeTomDato !== undefined ? forrigeTomDato : minVerdi}
              maxDate={forrigeTomDato !== undefined ? forrigeTomDato : maksVerdi}
              name={`medlemskapsperioder[${index}].fomDato`}
              aria-label={`Fra og med periode ${index + 1}`}
              readOnly={!redigerbart}
              onChange={(value) => {
                handleChange([{ ...formValues.medlemskapsperioder[index], fomDato: value }], index);
              }}
            />
          </Nav.Column>
          <Nav.Column className="dato">
            <Forms.Datovelger
              label=" "
              control={control}
              name={`medlemskapsperioder[${index}].tomDato`}
              aria-label={`Til og med periode ${index + 1}`}
              minDate={Utils.dato.norskStringTilDate(formValues.medlemskapsperioder[index].fomDato)}
              maxDate={maksVerdi}
              readOnly={!redigerbart}
              onChange={(value) => {
                handleChange([{ ...formValues.medlemskapsperioder[index], tomDato: value }], index);
              }}
            />
          </Nav.Column>
          <Nav.Column className="bestemmelse">
            <Forms.Select
              name={`medlemskapsperioder[${index}].bestemmelse`}
              label={index === 0 ? "Bestemmelse" : ""}
              hideLabel={index !== 0}
              aria-label={`Bestemmelse periode ${index + 1}`}
              control={control}
              readOnly={!redigerbart}
              onChange={(bestemmelse) => {
                handleChange([{ ...formValues.medlemskapsperioder[index], bestemmelse }], index);
                handleUpdate(index, { ...formValues.medlemskapsperioder[index], trygdedekning: "" });
              }}
            >
              {bestemmelser.map((bestemmelse: any) => (
                <option key={bestemmelse} value={bestemmelse}>
                  {KV.kodeTilTerm(bestemmelse, kodeverkKoderIBestemmelserNedtrekk)}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
          <Nav.Column className="trygdedekning">
            <Forms.Select
              name={`medlemskapsperioder[${index}].trygdedekning`}
              label={index === 0 ? "Dekning" : ""}
              hideLabel={index !== 0}
              aria-label={`Trygdedekning periode ${index + 1}`}
              control={control}
              readOnly={!redigerbart}
              onChange={(value) =>
                handleChange([{ ...formValues.medlemskapsperioder[index], trygdedekning: value }], index)
              }
            >
              {trygdedekninger.map((dekning: any) => (
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
