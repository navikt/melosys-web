import { Control } from "react-hook-form";
import * as Nav from "../../../../../navFrontend";
import * as Forms from "../../../../../felleskomponenter/forms";
import "./periodeVelger.css";
import MKV from "../../../../../melosyskodeverk";
import * as Utils from "../../../../../utils";
import { UkjentSluttdatoMedlemskapsperiode } from "../../../../ftrl/saksbehandling/stegKomponenter/vurderingPeriode/komponenter/ukjentSluttdatoMedlemskapsperiode";
import { useSelector } from "react-redux";
import { oppsummertfaktaSelectors } from "../../../../../ducks/oppsummertfakta";

export interface PeriodeVelgerProps {
  redigerbart: boolean;
  control: Control;
  formValues: any;
  onUkjentDato: (name: string, value: string) => void;
}

export function PeriodeOgLandVelger({ redigerbart, control, formValues, onUkjentDato }: PeriodeVelgerProps) {
  const ukjentSluttdatoMedlemskapsperiode = useSelector(
    oppsummertfaktaSelectors.UkjentSluttdatoMedlemskapsperiodeSelector,
  );

  console.log("PeriodeOgLandVelger formValues", formValues);

  return (
    <div className="perioder">
      <Nav.Heading size="xsmall">Periode</Nav.Heading>

      <UkjentSluttdatoMedlemskapsperiode
        ukjentSluttdatoMedlemskapsperiode={ukjentSluttdatoMedlemskapsperiode || false}
        onUkjentSluttdatoChange={() => {
          const fomISODate = Utils.dato.formatterDatoTilISO(formValues.fomDato, "");
          if (fomISODate) {
            const fomDate = new Date(fomISODate);
            const tomDate = new Date(fomDate);
            tomDate.setFullYear(tomDate.getFullYear() + 10);
            onUkjentDato("tomDato", Utils.dato.formatterDatoTilNorsk(tomDate.toISOString()));
          }
        }}
        erPensjonist={true}
      />

      <div className="skjema__panel">
        <Nav.Row className="skjema__panel__rad">
          <Nav.Column className="dato">
            <Forms.Datovelger
              label="Fra og med"
              control={control}
              name="fomDato"
              aria-label="Fra og med"
              readOnly={!redigerbart}
            />
          </Nav.Column>
          <Nav.Column className="dato">
            <Forms.Datovelger
              label="Til og med"
              minDate={Utils.dato.norskStringTilDate(formValues?.fomDato)}
              control={control}
              name="tomDato"
              aria-label="Til og med"
              readOnly={!redigerbart}
            />
          </Nav.Column>
          <Nav.Column className="brederefelt">
            <Forms.Select label="Bostedsland" control={control} name="bostedsland" disabled={!redigerbart}>
              {MKV.KTObjects.landkoder.map((item: any) => (
                <option key={item.kode} value={item.kode} label={Utils.land.landTekstFormat(item)} />
              ))}
            </Forms.Select>
          </Nav.Column>
        </Nav.Row>
      </div>
    </div>
  );
}
