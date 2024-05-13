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
import "./inntektskilder.css";
import { useFeatureToggle } from "../../../../../../featuretoggle";
import { MELOSYS_FTRL_YRKESAKTIV_PLIKTIGE_BESTEMMELSER } from "../../../../../../featuretoggle/toggleNavn";

const {
  ARBEIDSINNTEKT_FRA_NORGE,
  INNTEKT_FRA_UTLANDET,
  MISJONÆR,
  NÆRINGSINNTEKT_FRA_NORGE,
  FN_SKATTEFRITAK,
  PENSJON_UFØRETRYGD,
  PENSJON_UFØRETRYGD_KILDESKATT,
  ARBEIDSINNTEKT,
  NÆRINGSINNTEKT,
  PENSJON,
  UFØRETRYGD,
} = MKV.Koder.inntektskildetype;

interface InntektskilderProps {
  formValues: FormValuesProps;
  fields: FieldArrayWithId<FieldArrayProps, "inntektskilder">[];
  control: Control;
  update: (index: number, inntektskilde: Inntektskilde) => void;
  remove: (index: number) => void;
  append: (inntektskilde: Inntektskilde) => void;
  redigerbart: boolean;
  defaultPeriode?: { fomDato: string; tomDato: string };
  medlemskapsTypeErPliktig: boolean;
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
  medlemskapsTypeErPliktig,
}: InntektskilderProps) => {
  const ftrlYrkesaktivPliktigeBestemmelserEnabled = useFeatureToggle(MELOSYS_FTRL_YRKESAKTIV_PLIKTIGE_BESTEMMELSER);

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
    <div className="inntektskilder">
      <LabelMedHjelpetekst
        label="Oppgi informasjon om brukers inntekt"
        hjelpetekst="Hvis bruker har flere inntekter, f.eks. fra Norge og fra utlandet, så må de legges til enkeltvis."
        bold
      />
      <div className="skjema__panel">
        {formValues.inntektskilder.map((inntektskilde, index) => {
          const brukerSkattepliktigIHelePerioden = erBrukerSkattepliktigIHelePerioden(
            formValues.skatteforholdsperioder
          );

          const visArbAvgBetales = !Utils._isEmpty(inntektskilde.kildetype);
          const skalFylleInnArbAvgBetales = arbAvgBetalesKreves(inntektskilde.kildetype, medlemskapsTypeErPliktig);
          const skalFylleInnBruttoInntekt = bruttoInntektKreves(
            brukerSkattepliktigIHelePerioden,
            inntektskilde.kildetype,
            inntektskilde.arbAvgBetales
          );
          if (!skalFylleInnBruttoInntekt && inntektskilde.bruttoInntekt) {
            update(index, { ...inntektskilde, bruttoInntekt: undefined });
          }

          return (
            <Nav.Row className="skjema__panel__rad" key={fields[index].id}>
              <Nav.Column className="dato">
                {index === 0 ? <Nav.Typo.Element>Fra og med</Nav.Typo.Element> : null}
                <Forms.Datovelger name={`inntektskilder[${index}].fomDato`} disabled={!redigerbart} control={control} />
              </Nav.Column>
              <Nav.Column className="dato">
                {index === 0 ? <Nav.Typo.Element>Til og med</Nav.Typo.Element> : null}
                <Forms.Datovelger
                  name={`inntektskilder[${index}].tomDato`}
                  disabled={!redigerbart}
                  control={control}
                  minDate={Utils.dato.norskStringTilDate(formValues.inntektskilder[index].fomDato)}
                />
              </Nav.Column>

              <Nav.Column className="inntektskilde">
                {index === 0 ? <Nav.Typo.Element>Inntektskilde</Nav.Typo.Element> : null}
                <Forms.Select
                  label=""
                  name={`inntektskilder[${index}].kildetype`}
                  control={control}
                  disabled={!redigerbart}
                  emptyFieldDisabled={visArbAvgBetales}
                  onChange={(value) => handleEndreKildetype(index, value)}
                >
                  {MKV.KTObjects.inntektskildetype
                    .filter((kt: KTObject) => {
                      if (ftrlYrkesaktivPliktigeBestemmelserEnabled && medlemskapsTypeErPliktig) {
                        return [ARBEIDSINNTEKT, NÆRINGSINNTEKT, PENSJON, UFØRETRYGD].includes(kt.kode);
                      }
                      return [
                        ARBEIDSINNTEKT_FRA_NORGE,
                        NÆRINGSINNTEKT_FRA_NORGE,
                        INNTEKT_FRA_UTLANDET,
                        FN_SKATTEFRITAK,
                        MISJONÆR,
                        PENSJON_UFØRETRYGD,
                        PENSJON_UFØRETRYGD_KILDESKATT,
                      ].includes(kt.kode);
                    })
                    .map((kt: KTObject) => (
                      <option key={kt.kode} value={kt.kode}>
                        {kt.term}
                      </option>
                    ))}
                </Forms.Select>
              </Nav.Column>

              <Nav.Column>
                {index === 0 ? (
                  <Nav.Typo.Element>
                    Betales arb.avg. <br /> til skatt?
                  </Nav.Typo.Element>
                ) : null}
                {skalFylleInnArbAvgBetales ? (
                  <div className="radioknapp_gruppe">
                    <Forms.Radio
                      label="Ja"
                      name={`inntektskilder[${index}].arbAvgBetales`}
                      control={control}
                      value={BOOLSK_STRING.SANN}
                      disabled={!redigerbart || settesDefaultArbAvgBetales(inntektskilde.kildetype)}
                      onChange={(value) => handleEndreArbAvgBetales(index, value)}
                    />
                    <Forms.Radio
                      label="Nei"
                      name={`inntektskilder[${index}].arbAvgBetales`}
                      control={control}
                      value={BOOLSK_STRING.USANN}
                      disabled={!redigerbart || settesDefaultArbAvgBetales(inntektskilde.kildetype)}
                      onChange={(value) => handleEndreArbAvgBetales(index, value)}
                    />
                  </div>
                ) : (
                  <div className="ikkeRelevant">
                    <p>Ikke relevant</p>
                  </div>
                )}
              </Nav.Column>

              <Nav.Column className="brutto_inntekt">
                {index === 0 ? (
                  <Nav.Typo.Element>
                    Brutto inntekt <br /> per md.
                  </Nav.Typo.Element>
                ) : null}
                {skalFylleInnBruttoInntekt ? (
                  <Forms.Input
                    label=""
                    name={`inntektskilder[${index}].bruttoInntekt`}
                    control={control}
                    disabled={!redigerbart}
                  />
                ) : (
                  <div className="ikkeRelevant">
                    <p>Ikke relevant</p>
                  </div>
                )}
              </Nav.Column>

              {redigerbart && formValues.inntektskilder.length > 1 && (
                <Nav.Column className={index === 0 ? "slett slett__first" : "slett"}>
                  <Mui.IkonKnapp ariaLabel="Slett inntektskilde" ikon={Ikoner.Bin} onClick={() => remove(index)} />
                </Nav.Column>
              )}
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
    </div>
  );
};
