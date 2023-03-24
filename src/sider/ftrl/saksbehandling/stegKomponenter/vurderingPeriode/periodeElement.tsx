import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Ikoner from "../../../../../resources/images";
import * as Forms from "../../../../../felleskomponenter/forms";
import { MedlemskapsperiodeProp } from "./vurderingPerioder";

interface FormValuesProp {
  medlemskapsperioder?: MedlemskapsperiodeProp[];
}

interface PeriodeElementProps {
  index: number;
  redigerbart: boolean;
  trygdedekninger: KTObject[];
  innvilgelsesResultater: KTObject[];
  control: any;
  formValues: FormValuesProp;
  handleSlett: (index: number) => void;
  erPeriodeFoerSoknadMottatDato: (medlemskapsperiode: MedlemskapsperiodeProp) => boolean;
}

export const PeriodeElement = ({
  index,
  redigerbart,
  trygdedekninger,
  innvilgelsesResultater,
  formValues,
  control,
  handleSlett,
  erPeriodeFoerSoknadMottatDato,
}: PeriodeElementProps) => {
  const skalDelvisInnvilgetVises =
    formValues?.medlemskapsperioder &&
    erPeriodeFoerSoknadMottatDato(formValues.medlemskapsperioder[index]) &&
    formValues.medlemskapsperioder[index].trygdedekning === MKV.Koder.trygdedekninger.PENSJONSDEL;

  if (!formValues || !formValues.medlemskapsperioder) return null;
  return (
    <Nav.Fieldset legend="Periode" className="understrek">
      <Nav.Row>
        <Nav.Column xs="2">
          <Forms.Datovelger
            label="Fra og med:"
            control={control}
            name={`medlemskapsperioder[${index}].fomDato`}
            disabled
          />
        </Nav.Column>
        <Nav.Column xs="2">
          <Forms.Datovelger
            label="Til og med:"
            control={control}
            name={`medlemskapsperioder[${index}].tomDato`}
            disabled={!redigerbart}
          />
        </Nav.Column>
        <Nav.Column xs="4">
          <Forms.Select
            label="Trygdedekning"
            name={`medlemskapsperioder[${index}].trygdedekning`}
            control={control}
            disabled={!redigerbart}
            emptyFieldDisabled={!!formValues.medlemskapsperioder[index].trygdedekning}
          >
            {trygdedekninger.map((item: KTObject) => (
              <option key={item.kode} value={item.kode}>
                {item.term}
              </option>
            ))}
          </Forms.Select>
        </Nav.Column>
        <Nav.Column xs="4">
          <Forms.Select
            label="Resultat"
            name={`medlemskapsperioder[${index}].innvilgelsesResultat`}
            control={control}
            disabled={!redigerbart}
            emptyFieldDisabled={!!formValues.medlemskapsperioder[index].innvilgelsesResultat}
          >
            {innvilgelsesResultater
              .filter((item: KTObject) =>
                skalDelvisInnvilgetVises ? true : item.kode !== MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET
              )
              .map((item: KTObject) => (
                <option key={item.kode} value={item.kode}>
                  {item.term}
                </option>
              ))}
          </Forms.Select>
        </Nav.Column>
      </Nav.Row>
      {formValues.medlemskapsperioder[index].feil && (
        <Nav.AlertStripe type="feil" style={{ marginBottom: "1rem" }}>
          {formValues.medlemskapsperioder[index].feil}
        </Nav.AlertStripe>
      )}
      {redigerbart &&
        index === formValues.medlemskapsperioder.length - 1 &&
        formValues.medlemskapsperioder.length !== 1 && (
          <Nav.Lenker className="slettKnapp" href="#" onClick={() => handleSlett(index)} title="Slett periode">
            <Ikoner.Bin />
            <span>Slett periode</span>
          </Nav.Lenker>
        )}
    </Nav.Fieldset>
  );
};
