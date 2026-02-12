import { KTObject } from "@navikt/melosys-kodeverk";
import { Control, FieldArrayWithId } from "react-hook-form";

import MKV from "../../../melosyskodeverk";
import * as Forms from "../../forms";
import * as Nav from "../../../navFrontend";
import { Alert } from "../../../navFrontend";
import * as Utils from "../../../utils";
import * as Mui from "../../ui";
import * as Ikoner from "../../../resources/images";
import { BOOLSK_STRING } from "../../../constants";
import { FieldArrayProps, FormValuesProps, Inntektskilde } from "./types";
import {
  arbAvgBetalesKreves,
  bruttoInntektKreves,
} from "../../../sider/vurderingTrygdeavgift/vurderingTrygdeavgiftSchema";
import "./inntektskilder.less";
import { Stack } from "@navikt/ds-react";

import { erBrukerSkattepliktigIHelePerioden } from "../../../sider/aarsavregning/stegKomponenter/vurderingAarsavregning/utils";
import { useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../ducks/behandlinger";

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
  INNTEKT_NATO_JWC,
} = MKV.Koder.inntektskildetype;

interface InntektskilderProps {
  formValues: FormValuesProps;
  fields: FieldArrayWithId<FieldArrayProps, "inntektskilder">[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  update: (index: number, inntektskilde: Inntektskilde) => void;
  remove: (index: number) => void;
  append: (inntektskilde: Inntektskilde) => void;
  redigerbart: boolean;
  defaultPeriode?: { fomDato: string; tomDato: string };
  medlemskapsTypeErPliktig: boolean;
  skalViseErMaanedsBelopRadioGroup?: boolean;
  bestemmelse?: string;
  minDate?: Date;
  maxDate?: Date;
  forhindreAutoUtfylling?: boolean;
  laasAar?: boolean;
  erHelseutgiftDekkesPeriode?: boolean;
}

const hentInntektskilde = (
  bestemmelse: string | undefined,
  medlemskapsTypeErPliktig: boolean,
  behandlingstema: string,
): KTObject[] => {
  return MKV.KTObjects.inntektskildetype.filter((kt: KTObject) => {
    if (!medlemskapsTypeErPliktig) {
      if (behandlingstema === MKV.Koder.behandlinger.behandlingstema.PENSJONIST) {
        return [PENSJON_UFØRETRYGD, PENSJON_UFØRETRYGD_KILDESKATT].includes(kt.kode);
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
    }

    if (behandlingstema === MKV.Koder.behandlinger.behandlingstema.PENSJONIST) {
      return [PENSJON, UFØRETRYGD].includes(kt.kode);
    }

    if (bestemmelse === "TILLEGGSAVTALE_NATO") {
      return kt.kode === INNTEKT_NATO_JWC;
    }
    return [ARBEIDSINNTEKT, NÆRINGSINNTEKT, PENSJON, UFØRETRYGD].includes(kt.kode);
  });
};

export function Inntektskilder({
  formValues,
  control,
  update,
  remove,
  append,
  redigerbart,
  defaultPeriode,
  fields,
  medlemskapsTypeErPliktig,
  skalViseErMaanedsBelopRadioGroup,
  bestemmelse,
  minDate,
  maxDate,
  forhindreAutoUtfylling,
  laasAar,
  erHelseutgiftDekkesPeriode,
}: InntektskilderProps) {
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);

  const settesDefaultArbAvgBetales = (kildetype?: string) => ![INNTEKT_FRA_UTLANDET, MISJONÆR].includes(kildetype);

  const handleEndreKildetype = (index: number, kildetype: string) => {
    let defaultArbAvgBetales;
    if (settesDefaultArbAvgBetales(kildetype)) {
      defaultArbAvgBetales = kildetype === ARBEIDSINNTEKT_FRA_NORGE ? BOOLSK_STRING.SANN : BOOLSK_STRING.USANN;
    }
    update(index, { ...formValues.inntektskilder[index], kildetype, arbAvgBetales: defaultArbAvgBetales });
  };

  const handleEndreArbAvgBetales = (index: number, arbAvgBetales: string) => {
    // @ts-expect-error - "" er nødvendig for å nullstille feltet
    update(index, { ...formValues.inntektskilder[index], arbAvgBetales, bruttoInntekt: "" });
  };

  const erHoyInntekt = (inntekt: any) => {
    return (
      (inntekt.bruttoInntekt > 250000 && inntekt.erMaanedsbelop === BOOLSK_STRING.SANN) ||
      inntekt.bruttoInntekt > 2999999
    );
  };

  return (
    <div className="perioder">
      {formValues.inntektskilder.map((inntektskilde, index) => {
        const brukerSkattepliktigIHelePerioden = erBrukerSkattepliktigIHelePerioden(formValues.skatteforholdsperioder);

        const skalFylleInnArbAvgBetales =
          inntektskilde.kildetype && arbAvgBetalesKreves(inntektskilde.kildetype, medlemskapsTypeErPliktig);

        const skalFylleInnBruttoInntekt =
          inntektskilde.kildetype &&
          bruttoInntektKreves(brukerSkattepliktigIHelePerioden, inntektskilde.kildetype, inntektskilde.arbAvgBetales);
        if (!skalFylleInnBruttoInntekt && inntektskilde.bruttoInntekt) {
          // @ts-expect-error - "" er nødvendig for å nullstille feltet
          update(index, { ...inntektskilde, bruttoInntekt: "" });
        }

        return (
          <Nav.Row className="periode__rad" key={fields[index].id}>
            <Nav.Column className="dato">
              <Forms.Datovelger
                label={index === 0 ? "Inntektsperiode" : ""}
                name={`inntektskilder[${index}].fomDato`}
                readOnly={!redigerbart}
                control={control}
                minDate={minDate}
                maxDate={maxDate}
                forhindreAutoUtfylling={forhindreAutoUtfylling}
                laasAar={laasAar}
              />
            </Nav.Column>

            <Nav.Column className="dato">
              <Forms.Datovelger
                label={index === 0 && <span className="invisible" />}
                name={`inntektskilder[${index}].tomDato`}
                readOnly={!redigerbart}
                control={control}
                minDate={Utils.dato.norskStringTilDate(formValues.inntektskilder[index].fomDato) || minDate}
                maxDate={maxDate}
                forhindreAutoUtfylling={forhindreAutoUtfylling}
                laasAar={laasAar}
              />
            </Nav.Column>
            <Nav.Column className="inntektskildetype">
              <Forms.Select
                label={index === 0 ? "Inntektskilde" : ""}
                hideLabel={index !== 0}
                name={`inntektskilder[${index}].kildetype`}
                control={control}
                readOnly={!redigerbart}
                onChange={(value) => handleEndreKildetype(index, value)}
              >
                {hentInntektskilde(bestemmelse, medlemskapsTypeErPliktig, behandlingstema).map((kt: KTObject) => (
                  <option key={kt.kode} value={kt.kode}>
                    {kt.term}
                  </option>
                ))}
              </Forms.Select>
            </Nav.Column>

            {!erHelseutgiftDekkesPeriode && (
              <Nav.Column className="arbavgbetales">
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
                      <Nav.Radio
                        value={BOOLSK_STRING.SANN}
                        disabled={!redigerbart || settesDefaultArbAvgBetales(inntektskilde.kildetype)}
                      >
                        Ja
                      </Nav.Radio>
                      <Nav.Radio
                        value={BOOLSK_STRING.USANN}
                        disabled={!redigerbart || settesDefaultArbAvgBetales(inntektskilde.kildetype)}
                      >
                        Nei
                      </Nav.Radio>
                    </Stack>
                  </Forms.RadioGroup>
                ) : inntektskilde.kildetype &&
                  !arbAvgBetalesKreves(inntektskilde.kildetype, medlemskapsTypeErPliktig) ? (
                  <div className="ikkeRelevant">
                    {index === 0 && (
                      <Nav.BodyLong weight="semibold" size="small">
                        Betales aga.?
                      </Nav.BodyLong>
                    )}
                    <p className={`undertekst ${index === 0 ? "med-overskrift" : "uten-overskrift"}`}>Ikke relevant</p>
                  </div>
                ) : (
                  <div>
                    {index === 0 && (
                      <Nav.BodyLong weight="semibold" size="small">
                        Betales aga.?
                      </Nav.BodyLong>
                    )}
                  </div>
                )}
              </Nav.Column>
            )}
            {skalViseErMaanedsBelopRadioGroup && (
              <Nav.Column className="periode">
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
                ) : inntektskilde.kildetype &&
                  !bruttoInntektKreves(
                    brukerSkattepliktigIHelePerioden,
                    inntektskilde.kildetype,
                    inntektskilde.arbAvgBetales,
                  ) ? (
                  <div className="ikkeRelevant">
                    {index === 0 && (
                      <Nav.BodyLong weight="semibold" size="small">
                        Periode
                      </Nav.BodyLong>
                    )}
                    <p className={`undertekst ${index === 0 ? "med-overskrift" : "uten-overskrift"}`}>Ikke relevant</p>
                  </div>
                ) : (
                  <div>
                    {index === 0 && (
                      <Nav.BodyLong weight="semibold" size="small">
                        Periode
                      </Nav.BodyLong>
                    )}
                  </div>
                )}
              </Nav.Column>
            )}

            <Nav.Column className="brutto_inntekt">
              {skalFylleInnBruttoInntekt ? (
                <div>
                  <Forms.Input
                    label={index === 0 ? "Bruttoinntekt" : ""}
                    hideLabel={index !== 0}
                    name={`inntektskilder[${index}].bruttoInntekt`}
                    control={control}
                    readOnly={!redigerbart}
                    type="text"
                    numeric
                    autoComplete="off"
                  />
                  <div
                    className={`column ${
                      erHoyInntekt(formValues.inntektskilder[index])
                        ? "hoy_inntekt_advarsel"
                        : "hoy_inntekt_advarsel--hidden"
                    }`}
                  >
                    <Alert variant="warning" size="small">
                      Høy inntekt!
                    </Alert>
                  </div>
                </div>
              ) : inntektskilde.kildetype &&
                !bruttoInntektKreves(
                  brukerSkattepliktigIHelePerioden,
                  inntektskilde.kildetype,
                  inntektskilde.arbAvgBetales,
                ) ? (
                <div className="ikkeRelevant">
                  {index === 0 && (
                    <Nav.BodyLong weight="semibold" size="small">
                      Bruttoinntekt
                    </Nav.BodyLong>
                  )}
                  <p className={`undertekst ${index === 0 ? "med-overskrift" : "uten-overskrift"}`}>Ikke relevant</p>
                </div>
              ) : (
                <div>
                  {index === 0 && (
                    <Nav.BodyLong weight="semibold" size="small">
                      Bruttoinntekt
                    </Nav.BodyLong>
                  )}
                </div>
              )}
            </Nav.Column>

            <Nav.Column className="slett__knapp">
              {redigerbart && formValues.inntektskilder.length > 1 && (
                <Mui.IkonKnapp ariaLabel="Slett inntektskilde" ikon={Ikoner.Bin} onClick={() => remove(index)} />
              )}
            </Nav.Column>
          </Nav.Row>
        );
      })}
      <div className="legg-til__rad">
        <Mui.Lenkeknapp
          ikon={Ikoner.Add}
          onClick={() => append({ ...(defaultPeriode || {}), erMaanedsbelop: BOOLSK_STRING.SANN })}
          disabled={!redigerbart}
        >
          Legg til inntekt
        </Mui.Lenkeknapp>
      </div>
    </div>
  );
}
