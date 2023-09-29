import { KTObject } from "@navikt/melosys-kodeverk";
import { Control, FieldArrayWithId } from "react-hook-form";

import MKV from "../../../../../../melosyskodeverk";
import * as Forms from "../../../../../../felleskomponenter/forms";
import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";
import * as Mui from "../../../../../../felleskomponenter/ui";
import * as Ikoner from "../../../../../../resources/images";

import LabelMedHjelpetekst from "../../../../../../felleskomponenter/labelMedHjelpetekst";
import { BOOLSK_STRING } from "../../../../../../constants";
import { FieldArrayProps, FormValuesProps, Inntektskilde } from "./types";
import {
  arbAvgBetalesKreves,
  bruttoInntektKreves,
  erBrukerSkattepliktigIHelePerioden,
} from "../vurderingTrygdeavgiftSchema";

const { ARBEIDSINNTEKT_FRA_NORGE, INNTEKT_FRA_UTLANDET, MISJONÆR } = MKV.Koder.inntektskildetype;

interface InntektskilderProps {
  formValues: FormValuesProps;
  fields: FieldArrayWithId<FieldArrayProps, "inntektskilder">[];
  control: Control;
  update: (index: number, inntektskilde: Inntektskilde) => void;
  remove: (index: number) => void;
  append: (inntektskilde: Inntektskilde) => void;
  redigerbart: boolean;
  defaultPeriode?: { fomDato: string; tomDato: string };
}

export const Inntektskilder = ({
  formValues,
  control,
  update,
  remove,
  append,
  redigerbart,
  defaultPeriode,
  fields,
}: InntektskilderProps) => {
  const settesDefaultArbAvgBetales = (kildetype?: string) => ![INNTEKT_FRA_UTLANDET, MISJONÆR].includes(kildetype);

  const handleEndreKildetype = (index: number, kildetype: string) => {
    let defaultArbAvgBetales;
    if (settesDefaultArbAvgBetales(kildetype)) {
      defaultArbAvgBetales = kildetype === ARBEIDSINNTEKT_FRA_NORGE ? BOOLSK_STRING.SANN : BOOLSK_STRING.USANN;
    }
    update(index, { ...formValues.inntektskilder[index], kildetype, arbAvgBetales: defaultArbAvgBetales });
  };

  const handleEndreArbAvgBetales = (index: number, arbAvgBetales: string) => {
    update(index, { ...formValues.inntektskilder[index], arbAvgBetales, bruttoInntekt: undefined });
  };

  return (
    <>
      <LabelMedHjelpetekst
        label="Oppgi informasjon om brukers inntekt"
        className="inntektskilder__label"
        hjelpetekst="Hvis bruker har flere inntekter, f.eks. fra Norge og fra utlandet, så må de legges til enkeltvis."
        hjelpetekstClassName="hjelpetekst"
      />
      <div className="inntektskilder">
        <Nav.Row className="inntektskilder__overskriftrad">
          <Nav.Column xs="3" className="flex__kolonne">
            <Nav.Typo.Element>Fra og med</Nav.Typo.Element>
            <Nav.Typo.Element>Til og med</Nav.Typo.Element>
          </Nav.Column>
          <Nav.Column xs="4">
            <Nav.Typo.Element>Inntektskilde</Nav.Typo.Element>
          </Nav.Column>
          <Nav.Column xs="2">
            <Nav.Typo.Element>Betales arb.avg. til skatt?</Nav.Typo.Element>
          </Nav.Column>
          <Nav.Column xs="2">
            <Nav.Typo.Element>Brutto inntekt per md.</Nav.Typo.Element>
          </Nav.Column>
        </Nav.Row>

        {formValues.inntektskilder.map((inntektskilder, index) => {
          const brukerSkattepliktigIHelePerioden = erBrukerSkattepliktigIHelePerioden(
            formValues.skatteforholdsperioder
          );

          const visArbAvgBetales = !Utils._isEmpty(inntektskilder.kildetype);
          const skalFylleInnArbAvgBetales = arbAvgBetalesKreves(inntektskilder.kildetype);
          const visBruttoInntekt = Boolean(inntektskilder.arbAvgBetales) || !skalFylleInnArbAvgBetales;
          const skalFylleInnBruttoInntekt = bruttoInntektKreves(
            brukerSkattepliktigIHelePerioden,
            inntektskilder.kildetype,
            inntektskilder.arbAvgBetales
          );
          if (!skalFylleInnBruttoInntekt && inntektskilder.bruttoInntekt) {
            update(index, { ...formValues.inntektskilder[index], bruttoInntekt: undefined });
          }

          return (
            <Nav.Row key={fields[index].id}>
              <Nav.Column xs="3" className="flex__kolonne">
                <Forms.Datovelger name={`inntektskilder.${index}.fomDato`} disabled={!redigerbart} control={control} />
                <Forms.Datovelger
                  name={`inntektskilder.${index}.tomDato`}
                  disabled={!redigerbart}
                  control={control}
                  minDate={Utils.dato.norskStringTilDate(formValues.inntektskilder[index].fomDato)}
                />
              </Nav.Column>

              <Nav.Column xs="4">
                <Forms.Select
                  label=""
                  name={`inntektskilder.${index}.kildetype`}
                  control={control}
                  disabled={!redigerbart}
                  emptyFieldDisabled={visArbAvgBetales}
                  onChange={(value) => handleEndreKildetype(index, value)}
                >
                  {MKV.KTObjects.inntektskildetype.map((kt: KTObject) => (
                    <option key={kt.kode} value={kt.kode}>
                      {kt.term}
                    </option>
                  ))}
                </Forms.Select>
              </Nav.Column>

              <Nav.Column xs="2">
                {visArbAvgBetales && (
                  <>
                    {skalFylleInnArbAvgBetales ? (
                      <>
                        <Forms.Radio
                          label="Ja"
                          name={`inntektskilder.${index}.arbAvgBetales`}
                          control={control}
                          value={BOOLSK_STRING.SANN}
                          disabled={!redigerbart || settesDefaultArbAvgBetales(inntektskilder.kildetype)}
                          className="radioknapp_vertikal"
                          onChange={(value) => handleEndreArbAvgBetales(index, value)}
                        />
                        <Forms.Radio
                          label="Nei"
                          name={`inntektskilder.${index}.arbAvgBetales`}
                          control={control}
                          value={BOOLSK_STRING.USANN}
                          disabled={!redigerbart || settesDefaultArbAvgBetales(inntektskilder.kildetype)}
                          className="radioknapp_vertikal"
                          onChange={(value) => handleEndreArbAvgBetales(index, value)}
                        />
                      </>
                    ) : (
                      <p className="ikkeRelevant">Ikke relevant</p>
                    )}
                  </>
                )}
              </Nav.Column>

              <Nav.Column xs="2">
                {visBruttoInntekt && (
                  <>
                    {skalFylleInnBruttoInntekt ? (
                      <Forms.Input
                        label=""
                        name={`inntektskilder.${index}.bruttoInntekt`}
                        control={control}
                        disabled={!redigerbart}
                      />
                    ) : (
                      <p className="ikkeRelevant">Ikke relevant</p>
                    )}
                  </>
                )}
              </Nav.Column>

              <Nav.Column xs="1">
                {redigerbart && formValues.inntektskilder.length > 1 && (
                  <Mui.IkonKnapp ariaLabel="Slett inntektskilde" ikon={Ikoner.Bin} onClick={() => remove(index)} />
                )}
              </Nav.Column>
            </Nav.Row>
          );
        })}

        {redigerbart && (
          <Nav.Row className="skillestrek">
            <Mui.Lenkeknapp ikon={Ikoner.Add} onClick={() => append(defaultPeriode || {})}>
              Legg til inntekt
            </Mui.Lenkeknapp>
          </Nav.Row>
        )}
      </div>
    </>
  );
};
