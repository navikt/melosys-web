import { Control, FieldArrayWithId } from "react-hook-form";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../../../melosyskodeverk";
import * as Forms from "../../../../../../felleskomponenter/forms";
import * as Ikoner from "../../../../../../resources/images";
import * as Nav from "../../../../../../navFrontend";
import * as Mui from "../../../../../../felleskomponenter/ui";

import LabelMedHjelpetekst from "../../../../../../felleskomponenter/labelMedHjelpetekst";

import { FieldArrayProps, MedlemskapsperiodeProp } from "../vurderingPerioder";

export interface PeriodeElementerProps {
  redigerbart: boolean;
  trygdedekninger: KTObject[];
  innvilgelsesResultater: KTObject[];
  control: Control;
  fields: FieldArrayWithId<FieldArrayProps, "medlemskapsperioder">[];
  handleSlett: (index: number) => void;
  handleChange: (medlemskapsperiode: MedlemskapsperiodeProp[], isValid: boolean, index: number) => void;
  formIsValid: boolean;
}

export const PeriodeElementer = ({
  redigerbart,
  trygdedekninger,
  innvilgelsesResultater,
  fields,
  control,
  handleSlett,
  formIsValid,
  handleChange,
}: PeriodeElementerProps) => {
  const kanSlettePeriode = redigerbart && fields.length !== 1;

  return (
    <Nav.Fieldset
      legend={
        <LabelMedHjelpetekst
          label="Medlemskapsperiode(r)"
          hjelpetekst="Melosys har foreslått medlemskapsperioder på bakgrunn av periode og dekning det er søkt for, og tidspunktet søknaden ble mottatt. Du har mulighet til å gjøre endringer. Hvis du har mottatt opplysninger om at søknadsperiode eller trygdedekning det er søkt om er endret, må du endre dette i det inngangssteget «Inngang»."
          hjelpetekstClassName="hjelpetekst"
        />
      }
    >
      <Nav.Row className="labelRad">
        <Nav.Column xs="2">
          <Nav.Typo.Element>Fra og med</Nav.Typo.Element>
        </Nav.Column>
        <Nav.Column xs="2">
          <Nav.Typo.Element>Til og med</Nav.Typo.Element>
        </Nav.Column>
        <Nav.Column xs="4">
          <Nav.Typo.Element>Trygdedekning</Nav.Typo.Element>
        </Nav.Column>
        <Nav.Column xs="2">
          <Nav.Typo.Element>Resultat</Nav.Typo.Element>
        </Nav.Column>
      </Nav.Row>

      {fields?.map((field, index) => (
        <div key={field.id}>
          <Nav.Row>
            <Nav.Column xs="2">
              <Forms.Datovelger
                control={control}
                name={`medlemskapsperioder[${index}].fomDato`}
                disabled={!redigerbart}
                onChange={(value) => handleChange([{ ...field, fomDato: value }], formIsValid, index)}
              />
            </Nav.Column>
            <Nav.Column xs="2">
              <Forms.Datovelger
                control={control}
                name={`medlemskapsperioder[${index}].tomDato`}
                disabled={!redigerbart}
                onChange={(value) => handleChange([{ ...field, tomDato: value }], formIsValid, index)}
              />
            </Nav.Column>
            <Nav.Column xs="4">
              <Forms.Select
                name={`medlemskapsperioder[${index}].trygdedekning`}
                control={control}
                disabled={!redigerbart}
                emptyFieldDisabled={!!field.trygdedekning}
                onChange={(value) => handleChange([{ ...field, trygdedekning: value }], formIsValid, index)}
              >
                {trygdedekninger.map((item: KTObject) => (
                  <option key={item.kode} value={item.kode}>
                    {item.term}
                  </option>
                ))}
              </Forms.Select>
            </Nav.Column>
            <Nav.Column xs="2">
              <Forms.Select
                name={`medlemskapsperioder[${index}].innvilgelsesResultat`}
                control={control}
                disabled={!redigerbart}
                emptyFieldDisabled={!!field.innvilgelsesResultat}
                onChange={(value) => handleChange([{ ...field, innvilgelsesResultat: value }], formIsValid, index)}
              >
                {innvilgelsesResultater
                  .filter((item: KTObject) => item.kode !== MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET)
                  .map((item: KTObject) => (
                    <option key={item.kode} value={item.kode}>
                      {item.term}
                    </option>
                  ))}
              </Forms.Select>
            </Nav.Column>
            <Nav.Column xs="2">
              {kanSlettePeriode && (
                <Mui.Knapp className="slettKnapp" ikon={Ikoner.Bin} onClick={() => handleSlett(index)} mini>
                  Slett
                </Mui.Knapp>
              )}
            </Nav.Column>
          </Nav.Row>
          {field.feil && (
            <Nav.AlertStripe type="feil" className="medlemskapsperiodeFeil">
              {field.feil}
            </Nav.AlertStripe>
          )}
        </div>
      ))}
    </Nav.Fieldset>
  );
};
