import { KTObject } from "@navikt/melosys-kodeverk";
import { Control, FieldArrayWithId } from "react-hook-form";

import MKV from "../../../melosyskodeverk";
import * as Forms from "../../forms";
import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import * as Mui from "../../ui";
import * as Ikoner from "../../../resources/images";
import { BOOLSK_STRING } from "../../../constants";
import { FieldArrayProps, FormValuesProps, Inntektskilde } from "./types";
import {
  arbAvgBetalesKreves,
  bruttoInntektKreves,
  erBrukerSkattepliktigIHelePerioden,
} from "../../../sider/ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgiftSchema";
import "./inntektskilder.css";
import { Stack } from "@navikt/ds-react";
import { Alert } from "../../../navFrontend";

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
  skalViseErMaanedsBelopRadioGroup?: boolean;
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

  const erHoyInntekt = (inntekt: any) => {
    return inntekt.bruttoInntekt > 250000 && inntekt.erMaanedsbelop === BOOLSK_STRING.SANN;
  };

  return (
    <div className="perioder">
      {formValues.inntektskilder.map((inntektskilde, index) => {
        const brukerSkattepliktigIHelePerioden = erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder);

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
          <Nav.Row className="periode__rad" key={fields[index].id}>
            <Nav.Column>
              <Forms.Datovelger
                label={index === 0 ? "Inntektsperiode" : ""}
                name={`inntektskilder[${index}].fomDato`}
                readOnly={!redigerbart}
                control={control}
              />
            </Nav.Column>

            <Nav.Column>
              <Forms.Datovelger
                label={index === 0 && <span className="invisible" />}
                name={`inntektskilder[${index}].tomDato`}
                readOnly={!redigerbart}
                control={control}
                minDate={Utils.dato.norskStringTilDate(formValues.inntektskilder[index].fomDato)}
              />
            </Nav.Column>

            <Nav.Column className="inntektskilde">
              <Forms.Select
                label={index === 0 ? "Inntektskilde" : ""}
                hideLabel={index !== 0}
                name={`inntektskilder[${index}].kildetype`}
                control={control}
                readOnly={!redigerbart}
                onChange={(value) => handleEndreKildetype(index, value)}
              >
                {MKV.KTObjects.inntektskildetype
                  .filter((kt: KTObject) => {
                    const gyldigeInntektskilder = medlemskapsTypeErPliktig
                      ? [ARBEIDSINNTEKT, NÆRINGSINNTEKT, PENSJON, UFØRETRYGD]
                      : [
                          ARBEIDSINNTEKT_FRA_NORGE,
                          NÆRINGSINNTEKT_FRA_NORGE,
                          INNTEKT_FRA_UTLANDET,
                          FN_SKATTEFRITAK,
                          MISJONÆR,
                          PENSJON_UFØRETRYGD,
                          PENSJON_UFØRETRYGD_KILDESKATT,
                        ];
                    return gyldigeInntektskilder.includes(kt.kode);
                  })
                  .map((kt: KTObject) => (
                    <option key={kt.kode} value={kt.kode}>
                      {kt.term}
                    </option>
                  ))}
              </Forms.Select>
            </Nav.Column>

            <Nav.Column>
              {skalFylleInnArbAvgBetales ? (
                <Forms.RadioGroup
                  legend={index === 0 ? "Betales aga.?" : ""}
                  hideLegend={index !== 0}
                  name={`inntektskilder[${index}].arbAvgBetales`}
                  readOnly={!redigerbart || settesDefaultArbAvgBetales(inntektskilde.kildetype)}
                  control={control}
                  onChange={(value) => handleEndreArbAvgBetales(index, value)}
                >
                  <Stack gap="6" direction={{ xs: "column", sm: "row" }} wrap={false}>
                    <Nav.Radio value={BOOLSK_STRING.SANN}>Ja</Nav.Radio>
                    <Nav.Radio value={BOOLSK_STRING.USANN}>Nei</Nav.Radio>
                  </Stack>
                </Forms.RadioGroup>
              ) : (
                <div className="ikkeRelevant">
                  {index === 0 && (
                    <Nav.BodyLong weight="semibold" size="small">
                      Betales aga.?
                    </Nav.BodyLong>
                  )}
                  <p className={`undertekst ${index === 0 ? "med-overskrift" : "uten-overskrift"}`}>Ikke relevant</p>
                </div>
              )}
            </Nav.Column>

            <Nav.Column>
              {skalFylleInnBruttoInntekt ? (
                <Forms.Select
                  emptyFieldDisabled
                  label={index === 0 ? "Periode" : ""}
                  hideLabel={index !== 0}
                  name={`inntektskilder[${index}].erMaanedsbelop`}
                  readOnly={!redigerbart}
                  control={control}
                >
                  <option defaultValue={BOOLSK_STRING.SANN} value={BOOLSK_STRING.SANN}>
                    Md.
                  </option>
                  <option value={BOOLSK_STRING.USANN}>Total</option>
                </Forms.Select>
              ) : (
                <div className="ikkeRelevant">
                  {index === 0 && (
                    <Nav.BodyLong weight="semibold" size="small">
                      Periode
                    </Nav.BodyLong>
                  )}
                  <p className={`undertekst ${index === 0 ? "med-overskrift" : "uten-overskrift"}`}>Ikke relevant</p>
                </div>
              )}
            </Nav.Column>

            <Nav.Column className="brutto_inntekt">
              {skalFylleInnBruttoInntekt ? (
                <Forms.Input
                  label={index === 0 ? "Brutto inntekt" : ""}
                  hideLabel={index !== 0}
                  name={`inntektskilder[${index}].bruttoInntekt`}
                  control={control}
                  readOnly={!redigerbart}
                  type="number"
                />
              ) : (
                <div className="ikkeRelevant">
                  {index === 0 && (
                    <Nav.BodyLong weight="semibold" size="small">
                      Bruttoinntekt
                    </Nav.BodyLong>
                  )}
                  <p className={`undertekst ${index === 0 ? "med-overskrift" : "uten-overskrift"}`}>Ikke relevant</p>
                </div>
              )}
            </Nav.Column>

            <Nav.Column
              className={`column ${
                erHoyInntekt(formValues.inntektskilder[index])
                  ? "hoy_inntekt_advarsel"
                  : "hoy_inntekt_advarsel invisible"
              }`}
            >
              <Alert variant="warning" size="small">
                Høy inntekt!
              </Alert>
            </Nav.Column>

            <Nav.Column className="slett__knapp">
              {redigerbart && formValues.inntektskilder.length > 1 && (
                <Mui.IkonKnapp ariaLabel="Slett inntektskilde" ikon={Ikoner.Bin} onClick={() => remove(index)} />
              )}
            </Nav.Column>
          </Nav.Row>
        );
      })}

      {redigerbart && (
        <div className="legg-til__rad">
          <Mui.Lenkeknapp
            ikon={Ikoner.Add}
            onClick={() =>
              append(
                { ...defaultPeriode, erMaanedsbelop: BOOLSK_STRING.SANN } || { erMaanedsbelop: BOOLSK_STRING.SANN }
              )
            }
          >
            Legg til inntekt
          </Mui.Lenkeknapp>
        </div>
      )}
    </div>
  );
};
