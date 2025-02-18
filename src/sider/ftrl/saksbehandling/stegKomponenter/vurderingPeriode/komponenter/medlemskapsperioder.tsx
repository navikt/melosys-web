import { Control, FieldArrayWithId } from "react-hook-form";
import * as Forms from "../../../../../../felleskomponenter/forms";
import * as Ikoner from "../../../../../../resources/images";
import * as Nav from "../../../../../../navFrontend";
import * as Mui from "../../../../../../felleskomponenter/ui";

import { FieldArrayProps, MedlemskapsperiodeProp } from "./types";
import "./medlemskapsperioder.css";
import * as KV from "../../../../../../kodeverk";
import MKV from "../../../../../../melosyskodeverk";
import { useSelector } from "react-redux";
import { medlemskapsperioderSelectors } from "../../../../../../ducks/medlemskapsperioder";
import { useEffect } from "react";
import useFeatureToggle from "../../../../../../featuretoggle/useFeatureToggle";
import { MELOSYS_PENSJONIST } from "../../../../../../featuretoggle/toggleNavn";

const { PLIKTIG } = MKV.Koder.medlemskapstyper;

export interface PeriodeElementerProps {
  redigerbart: boolean;
  trygdedekninger: string[];
  innvilgelsesResultater: string[];
  control: Control;
  fields: FieldArrayWithId<FieldArrayProps, "medlemskapsperioder">[];
  handleSlett: (index: number) => void;
  handleChange: (medlemskapsperiode: MedlemskapsperiodeProp[], isValid: boolean, index: number) => void;
  formIsValid: boolean;
  handleLeggTil: () => void;
  visLeggTil: boolean;
  ukjentSluttdato?: boolean;
}

export function Medlemskapsperioder({
  redigerbart,
  trygdedekninger,
  innvilgelsesResultater,
  fields,
  control,
  handleSlett,
  formIsValid,
  handleChange,
  handleLeggTil,
  visLeggTil,
  ukjentSluttdato,
}: PeriodeElementerProps) {
  const kanSlettePeriode = redigerbart && fields.length !== 1;
  const medlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const medlemskapsTypeErPliktig = medlemskapsperioder.some((periode) => periode.medlemskapstype === PLIKTIG);
  const FTRL_KAP2_2_7_FØRSTE_LEDD =
    useSelector(medlemskapsperioderSelectors.BestemmelseSelector) === "FTRL_KAP2_2_7_FØRSTE_LEDD";
  const FULL_DEKNING_FTRL = (trygdedekning: string): boolean => trygdedekning === "FULL_DEKNING_FTRL";
  const erPensonistToggleEnabled = useFeatureToggle(MELOSYS_PENSJONIST);

  const filtrerInnvilgelsesResultater = (trygdedekning: string) => {
    if (!erPensonistToggleEnabled) {
      return innvilgelsesResultater;
    }

    if (FULL_DEKNING_FTRL(trygdedekning) && FTRL_KAP2_2_7_FØRSTE_LEDD) {
      return innvilgelsesResultater.filter((resultat) => resultat === "AVSLAATT");
    }
    return innvilgelsesResultater;
  };

  return (
    <div className="medlemskapsperioder">
      {/* eslint-disable-next-line no-console */}
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
                  onChange={(value) => handleChange([{ ...field, fomDato: value }], formIsValid, index)}
                />
              </Nav.Column>
              <Nav.Column className="dato">
                <Forms.Datovelger
                  label={index === 0 ? "Til og med" : ""}
                  control={control}
                  name={`medlemskapsperioder[${index}].tomDato`}
                  aria-label={`Til og med periode ${index + 1}`}
                  readOnly={!redigerbart || ukjentSluttdato}
                  onChange={(value) => handleChange([{ ...field, tomDato: value }], formIsValid, index)}
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
                  emptyFieldDisabled={!!field.trygdedekning}
                  onChange={(value) => handleChange([{ ...field, trygdedekning: value }], formIsValid, index)}
                >
                  {trygdedekninger.map((dekning) => (
                    <option key={dekning} value={dekning}>
                      {KV.kodeTilTerm(dekning, MKV.KTObjects.trygdedekninger)}
                    </option>
                  ))}
                </Forms.Select>
              </Nav.Column>
              <Nav.Column>
                <Forms.Select
                  label={index === 0 ? "Resultat" : ""}
                  hideLabel={index !== 0}
                  name={`medlemskapsperioder[${index}].innvilgelsesResultat`}
                  aria-label={`Resultat periode ${index + 1}`}
                  control={control}
                  readOnly={!redigerbart}
                  emptyFieldDisabled={!!field.innvilgelsesResultat}
                  onChange={(value) => handleChange([{ ...field, innvilgelsesResultat: value }], formIsValid, index)}
                >
                  {filtrerInnvilgelsesResultater(field.trygdedekning).map((resultat) => (
                    <option key={resultat} value={resultat}>
                      {KV.kodeTilTerm(resultat, MKV.KTObjects.innvilgelsesResultat)}
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
            {field.feil && (
              <Nav.Alert variant="error" className="medlemskapsperiodeFeil">
                {field.feil}
              </Nav.Alert>
            )}
          </div>
        ))}
        {visLeggTil && !medlemskapsTypeErPliktig && (
          <Nav.Row className="skillestrek">
            <Mui.Lenkeknapp onClick={handleLeggTil} ikon={Ikoner.Add}>
              Legg til periode
            </Mui.Lenkeknapp>
          </Nav.Row>
        )}
      </div>
    </div>
  );
}
