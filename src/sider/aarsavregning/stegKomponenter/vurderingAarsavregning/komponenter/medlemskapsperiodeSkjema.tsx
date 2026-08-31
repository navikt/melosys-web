import { Control } from "react-hook-form";

import * as KV from "../../../../../kodeverk";
import MKV from "../../../../../melosyskodeverk";

import * as Forms from "../../../../../felleskomponenter/forms";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Nav from "../../../../../navFrontend";
import * as Ikoner from "../../../../../resources/images";
import * as Utils from "../../../../../utils";
import {
  MedlemskapsperiodeFieldProps,
  erUlagretPeriode,
} from "../aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlag";
import type {
  AarsavregningsPeriodeType,
  HelseutgiftdekkesperiodeForAvgift,
} from "../../../../../services/modules/types/periodeTyper";

import { useEffect } from "react";
import { FormValuesProps } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import "./medlemskapsperiodeSkjema.less";
import { usePliktigeBestemmelser } from "../hooks/usePliktigeBestemmelser";

// Funksjon for å kalkulere slettbar-status, nå kalt kanPeriodeSlettes
const kanPeriodeSlettes = (
  gjeldendePeriode: MedlemskapsperiodeFieldProps,
  allePerioderIListe: MedlemskapsperiodeFieldProps[],
): boolean => {
  const erPeriodeUlagret = !gjeldendePeriode.id || erUlagretPeriode(gjeldendePeriode.id);
  if (erPeriodeUlagret) {
    return true; // Ulagret er alltid slettbar
  }

  if (!gjeldendePeriode.redigerbar) {
    return false; // Fra grunnlag, ikke slettbar
  }

  const alleLagredePerioderSortert = [...allePerioderIListe]
    .filter((p) => p.id && !erUlagretPeriode(p.id))
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

  const erFørstePeriode = alleLagredePerioderSortert[0].id === gjeldendePeriode.id;
  const erSistePeriode = alleLagredePerioderSortert[alleLagredePerioderSortert.length - 1].id === gjeldendePeriode.id;

  if (erFørstePeriode || erSistePeriode) {
    return true;
  }
  return false; // "Midt-i" periode
};

export interface PeriodeElementerProps {
  redigerbart: boolean;
  control: Control;
  field: { id: string | number; [key: string]: unknown };
  remove: (index: number) => void;
  formValues: FormValuesProps;
  handleLeggTil: () => void;
  index: number;
  visLeggTil: boolean;
  maxDate?: Date;
  minDate?: Date;
  trygdedekninger?: string[];
  setValue: (name: string, value: unknown, options?: { shouldValidate?: boolean; shouldDirty?: boolean }) => void;
  erDeltGrunnlag?: boolean;
  erUtenGrunnlag?: boolean;
  periodeType?: AarsavregningsPeriodeType;
  skjulBostedLand?: boolean;
}

export function AvgiftspliktigperiodeSkjema({
  redigerbart,
  field,
  control,
  remove,
  formValues,
  handleLeggTil,
  index,
  visLeggTil,
  maxDate,
  minDate,
  trygdedekninger = [],
  setValue,
  erDeltGrunnlag = false,
  erUtenGrunnlag = false,
  periodeType,
  skjulBostedLand = false,
}: PeriodeElementerProps) {
  const erHelseutgift = periodeType === "HELSEUTGIFTDEKKESPERIODE";
  const pliktigeBestemmelser = usePliktigeBestemmelser();
  const erPliktigBestemmelse = formValues.bestemmelse && pliktigeBestemmelser.includes(formValues.bestemmelse);

  const medlemskapsperioder = formValues.avgiftspliktigperioder as MedlemskapsperiodeFieldProps[];
  const erPeriodeFraGrunnlag = !medlemskapsperioder[index]?.redigerbar;
  const tilOgMedDatoForrigePeriode =
    medlemskapsperioder[index - 1] !== undefined
      ? Utils.dato.norskStringTilDate(medlemskapsperioder[index - 1]?.tomDato)
      : undefined;
  if (tilOgMedDatoForrigePeriode !== undefined) {
    tilOgMedDatoForrigePeriode.setDate(tilOgMedDatoForrigePeriode.getDate() + 1);
  }

  // Sikre at minDate ikke overstiger maxDate (problem når forrige periode slutter utenfor årets ramme)
  const safeMinDateForFom = (() => {
    if (tilOgMedDatoForrigePeriode === undefined) {
      return minDate;
    }
    if (maxDate && tilOgMedDatoForrigePeriode > maxDate) {
      return maxDate;
    }
    return tilOgMedDatoForrigePeriode;
  })();

  const kunEnTrygdedekning = trygdedekninger?.length === 1;

  const gjeldendePeriodeForRad = medlemskapsperioder[index];
  const erDennePeriodenSlettbar = kanPeriodeSlettes(gjeldendePeriodeForRad, medlemskapsperioder);

  const kanViseSletteKolonne =
    redigerbart && medlemskapsperioder.length > 1 && !erPeriodeFraGrunnlag && erDennePeriodenSlettbar;

  useEffect(() => {
    if (!erHelseutgift && trygdedekninger?.length === 1) {
      setValue(`avgiftspliktigperioder[${index}].trygdedekning`, trygdedekninger[0], { shouldValidate: true });
    }
  }, [trygdedekninger, index, setValue, erHelseutgift]);

  const periodeLabelTekst = erHelseutgift ? `Periode Norge dekker helseutgifter` : "Medlemskapsperiode";

  return (
    <>
      <Nav.Row className="periode__rad medlemskapsperiode__rad" key={field.id}>
        <Nav.Column className={`dato${erHelseutgift && index === 0 ? " dato--helseutgift-label" : ""}`}>
          <Forms.Datovelger
            label={index === 0 ? periodeLabelTekst : ""}
            control={control}
            minDate={safeMinDateForFom}
            maxDate={maxDate}
            name={`avgiftspliktigperioder[${index}].fomDato`}
            aria-label={`Fra og med periode ${index + 1}`}
            readOnly={!redigerbart || erPeriodeFraGrunnlag}
          />
        </Nav.Column>
        <Nav.Column className="dato">
          <Forms.Datovelger
            label={index === 0 ? <span className="invisible" /> : ""}
            control={control}
            name={`avgiftspliktigperioder[${index}].tomDato`}
            aria-label={`Til og med periode ${index + 1}`}
            minDate={Utils.dato.norskStringTilDate(medlemskapsperioder[index].fomDato) || minDate}
            maxDate={maxDate}
            readOnly={!redigerbart || erPeriodeFraGrunnlag}
          />
        </Nav.Column>
        {!erHelseutgift && (
          <Nav.Column className="trygdedekning">
            <Forms.Select
              name={`avgiftspliktigperioder[${index}].trygdedekning`}
              label={index === 0 ? "Dekning" : ""}
              hideLabel={index !== 0}
              aria-label={`Trygdedekning periode ${index + 1}`}
              control={control}
              readOnly={!redigerbart || erPeriodeFraGrunnlag || kunEnTrygdedekning}
            >
              {trygdedekninger?.map((dekning) => (
                <option key={dekning} value={dekning}>
                  {KV.kodeTilTerm(dekning, MKV.KTObjects.trygdedekninger)}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
        )}
        {erHelseutgift && !skjulBostedLand && (
          <Nav.Column className="trygdedekning">
            <Forms.Select
              name={`avgiftspliktigperioder[${index}].bostedLandkode`}
              label={index === 0 ? "Bostedsland" : ""}
              hideLabel={index !== 0}
              aria-label={`Bostedsland periode ${index + 1}`}
              control={control}
              readOnly={
                !redigerbart ||
                erPeriodeFraGrunnlag ||
                (index > 0 && !!(medlemskapsperioder[0] as HelseutgiftdekkesperiodeForAvgift)?.bostedLandkode)
              }
              emptyFieldDisabled={!!(medlemskapsperioder[index] as HelseutgiftdekkesperiodeForAvgift)?.bostedLandkode}
            >
              {MKV.KTObjects.landkoder.map((item: any) => (
                <option key={item.kode} value={item.kode}>
                  {Utils.land.landTekstFormat(item)}
                </option>
              ))}
            </Forms.Select>
          </Nav.Column>
        )}
        {kanViseSletteKolonne && (
          <Nav.Column className={index === 0 ? "slett__knapp slett__first" : "slett__knapp"}>
            <Mui.IkonKnapp ikon={Ikoner.Bin} onClick={() => remove(index)} ariaLabel="Slett periode" />
          </Nav.Column>
        )}
      </Nav.Row>
      {medlemskapsperioder.length === index + 1 &&
        !erUtenGrunnlag &&
        (!erPliktigBestemmelse || erDeltGrunnlag) &&
        redigerbart &&
        visLeggTil && (
          <div className="legg-til__rad">
            <Mui.Lenkeknapp onClick={handleLeggTil} ikon={Ikoner.Add}>
              Legg til periode
            </Mui.Lenkeknapp>
          </div>
        )}
    </>
  );
}
