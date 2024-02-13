import { Control, FieldArrayWithId } from "react-hook-form";
import { KTObject } from "@navikt/melosys-kodeverk";
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

const { PLIKTIG } = MKV.Koder.medlemskapstyper;

export interface PeriodeElementerProps {
  redigerbart: boolean;
  trygdedekninger: string[];
  innvilgelsesResultater: KTObject[];
  control: Control;
  fields: FieldArrayWithId<FieldArrayProps, "medlemskapsperioder">[];
  handleSlett: (index: number) => void;
  handleChange: (medlemskapsperiode: MedlemskapsperiodeProp[], isValid: boolean, index: number) => void;
  formIsValid: boolean;
  handleLeggTil: () => void;
  visLeggTil: boolean;
}

export const Medlemskapsperioder = ({
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
}: PeriodeElementerProps) => {
  const kanSlettePeriode = redigerbart && fields.length !== 1;
  const medlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const medlemskapsTypeErPliktig = medlemskapsperioder.some((periode) => periode.medlemskapstype === PLIKTIG);

  return (
    <div className="medlemskapsperioder">
      <div className="skjema__panel">
        {fields?.map((field, index) => (
          <div key={field.id}>
            <Nav.Row className="skjema__panel__rad">
              <Nav.Column className="dato">
                {index === 0 ? <Nav.Typo.Element>Fra og med</Nav.Typo.Element> : null}
                <Forms.Datovelger
                  control={control}
                  name={`medlemskapsperioder[${index}].fomDato`}
                  aria-label={`Fra og med periode ${index + 1}`}
                  disabled={!redigerbart}
                  onChange={(value) => handleChange([{ ...field, fomDato: value }], formIsValid, index)}
                />
              </Nav.Column>
              <Nav.Column className="dato">
                {index === 0 ? <Nav.Typo.Element>Til og med</Nav.Typo.Element> : null}
                <Forms.Datovelger
                  control={control}
                  name={`medlemskapsperioder[${index}].tomDato`}
                  aria-label={`Til og med periode ${index + 1}`}
                  disabled={!redigerbart}
                  onChange={(value) => handleChange([{ ...field, tomDato: value }], formIsValid, index)}
                />
              </Nav.Column>
              <Nav.Column className="trygdedekning">
                {index === 0 ? <Nav.Typo.Element>Trygdedekning</Nav.Typo.Element> : null}
                <Forms.Select
                  name={`medlemskapsperioder[${index}].trygdedekning`}
                  aria-label={`Trygdedekning periode ${index + 1}`}
                  control={control}
                  disabled={!redigerbart}
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
                {index === 0 ? <Nav.Typo.Element>Resultat</Nav.Typo.Element> : null}
                <Forms.Select
                  name={`medlemskapsperioder[${index}].innvilgelsesResultat`}
                  aria-label={`Resultat periode ${index + 1}`}
                  control={control}
                  disabled={!redigerbart}
                  emptyFieldDisabled={!!field.innvilgelsesResultat}
                  onChange={(value) => handleChange([{ ...field, innvilgelsesResultat: value }], formIsValid, index)}
                >
                  {innvilgelsesResultater.map((item: KTObject) => (
                    <option key={item.kode} value={item.kode}>
                      {item.term}
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
              <Nav.AlertStripe type="feil" className="medlemskapsperiodeFeil">
                {field.feil}
              </Nav.AlertStripe>
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
};
