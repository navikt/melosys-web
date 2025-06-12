import { Control } from "react-hook-form";
import * as Nav from "../../../../../navFrontend";
import * as Forms from "../../../../../felleskomponenter/forms";
import "./periodeVelger.css";
import MKV from "../../../../../melosyskodeverk";
import * as Utils from "../../../../../utils";

export interface PeriodeVelgerProps {
  redigerbart: boolean;
  control: Control;
  formValues: any;
}

export function PeriodeOgLandVelger({ redigerbart, control, formValues }: PeriodeVelgerProps) {
  return (
    <div className="perioder">
      <Nav.Heading size="xsmall">Periode</Nav.Heading>
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
