import { Control, FieldArrayWithId, FieldErrors } from "react-hook-form";

import MKV from "../../../../../melosyskodeverk";
import * as KV from "../../../../../kodeverk";

import * as Forms from "../../../../../felleskomponenter/forms";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Ikoner from "../../../../../resources/images";
import * as Utils from "../../../../../utils";
import { ULAGRET_MEDLEMSKAPSPERIODE_ID } from "../aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlag";

import { FieldArrayProps, FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import "./medlemskapsperiodeSkjema.css";
import { useEffect } from "react";

// Funksjon for å kalkulere slettbar-status, nå kalt kanPeriodeSlettes
const kanPeriodeSlettes = (gjeldendePeriode: Medlemskapsperiode, allePerioderIListe: Medlemskapsperiode[]): boolean => {
  const erPeriodeUlagret = !gjeldendePeriode.id || gjeldendePeriode.id === ULAGRET_MEDLEMSKAPSPERIODE_ID;
  if (erPeriodeUlagret) {
    return true; // Ulagret er alltid slettbar
  }

  if (!gjeldendePeriode.redigerbar) {
    return false; // Fra grunnlag, ikke slettbar
  }

  const alleLagredePerioderSortert = [...allePerioderIListe]
    .filter((p) => p.id && p.id !== ULAGRET_MEDLEMSKAPSPERIODE_ID)
    .sort((a, b) => {
      const aDate = Utils.dato.norskStringTilDate(a.fomDato);
      const bDate = Utils.dato.norskStringTilDate(b.fomDato);
      const aTime = aDate instanceof Date && !Number.isNaN(aDate.getTime()) ? aDate.getTime() : 0;
      const bTime = bDate instanceof Date && !Number.isNaN(bDate.getTime()) ? bDate.getTime() : 0;
      return aTime - bTime;
    });

  if (alleLagredePerioderSortert.length === 0) {
    return false; // Uventet tilstand, default til ikke-slettbar
  }

  const erHeltForstBlantLagrede = alleLagredePerioderSortert[0].id === gjeldendePeriode.id;
  const erHeltSistBlantLagrede =
    alleLagredePerioderSortert[alleLagredePerioderSortert.length - 1].id === gjeldendePeriode.id;

  if (erHeltForstBlantLagrede || erHeltSistBlantLagrede) {
    return true;
  }
  return false; // "Midt-i" periode
};

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
  setValue: (name: string, value: any, options?: any) => void;
  errors: FieldErrors<FormValuesProps>;
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
  errors,
}: PeriodeElementerProps) {
  const medlemskapsperioder = formValues.medlemskapsperioder!;
  const erPeriodeFraGrunnlag = !medlemskapsperioder[index]?.redigerbar;
  const kanViseSletteKolonne = redigerbart && medlemskapsperioder.length > 1;
  const tilOgMedDatoForrigePeriode =
    medlemskapsperioder[index - 1] !== undefined
      ? Utils.dato.norskStringTilDate(medlemskapsperioder[index - 1]?.tomDato)
      : undefined;
  if (tilOgMedDatoForrigePeriode !== undefined) {
    tilOgMedDatoForrigePeriode.setDate(tilOgMedDatoForrigePeriode.getDate() + 1);
  }

  const kunEnTrygdedekning = trygdedekninger?.length === 1;

  const gjeldendePeriodeForRad = medlemskapsperioder[index];
  const erDennePeriodenSlettbar = kanPeriodeSlettes(gjeldendePeriodeForRad, medlemskapsperioder);

  useEffect(() => {
    if (trygdedekninger?.length === 1) {
      setValue(`medlemskapsperioder[${index}].trygdedekning`, trygdedekninger[0], { shouldValidate: true });
    }
  }, [trygdedekninger, index, setValue]);

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
              maxDate={maksVerdi}
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
              minDate={Utils.dato.norskStringTilDate(medlemskapsperioder[index].fomDato)}
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
          {kanViseSletteKolonne && (
            <Nav.Column className={index === 0 ? "slett__knapp slett__first" : "slett__knapp"}>
              <Mui.IkonKnapp
                ikon={Ikoner.Bin}
                onClick={() => remove(index)}
                ariaLabel="Slett periode"
                disabled={!redigerbart || erPeriodeFraGrunnlag || !erDennePeriodenSlettbar}
              />
            </Nav.Column>
          )}
        </Nav.Row>
      </div>
      {medlemskapsperioder.length === index + 1 && (
        <div className="legg-til__rad">
          <Mui.Lenkeknapp onClick={handleLeggTil} ikon={Ikoner.Add} disabled={!redigerbart || !visLeggTil}>
            Legg til periode
          </Mui.Lenkeknapp>
        </div>
      )}
    </div>
  );
}
