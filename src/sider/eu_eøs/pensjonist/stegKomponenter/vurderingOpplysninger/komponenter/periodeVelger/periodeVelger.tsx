import { Control } from "react-hook-form";
import * as Nav from "../../../../../../../navFrontend";
import * as Forms from "../../../../../../../felleskomponenter/forms";
import "./periodeVelger.css";
import MKV from "../../../../../../../melosyskodeverk";
import * as Utils from "../../../../../../../utils";

export interface PeriodeVelgerProps {
  redigerbart: boolean;
  control: Control;
  formValues: any;
  ukjentSluttdato?: boolean;
  handleChange: () => void;
  ukjentSluttdatoKey: string;
}

export function PeriodeOgLandVelger({
  redigerbart,
  control,
  formValues,
  ukjentSluttdato,
  handleChange,
  ukjentSluttdatoKey,
}: PeriodeVelgerProps) {
  return (
    <div className="perioder">
      <Nav.Heading className="skjema_tittel" size="xsmall">
        Periode
      </Nav.Heading>

      <div className="skjema__panel">
        <Nav.Row className="skjema__panel__rad">
          <Nav.Column className="dato">
            <Forms.Datovelger
              label="Fra og med"
              control={control}
              name="fomDato"
              aria-label="Fra og med"
              readOnly={!redigerbart}
              onChange={handleChange}
            />
          </Nav.Column>
          <Nav.Column className="dato">
            <Forms.Datovelger
              key={ukjentSluttdatoKey}
              label="Til og med"
              minDate={Utils.dato.norskStringTilDate(formValues?.fomDato)}
              control={control}
              name="tomDato"
              aria-label="Til og med"
              readOnly={!redigerbart || ukjentSluttdato}
              onChange={handleChange}
            />
          </Nav.Column>
          <Nav.Column className="brederefelt">
            <Forms.Select
              label="Bostedsland"
              control={control}
              name="bostedLandkode"
              disabled={!redigerbart}
              onChange={handleChange}
            >
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
