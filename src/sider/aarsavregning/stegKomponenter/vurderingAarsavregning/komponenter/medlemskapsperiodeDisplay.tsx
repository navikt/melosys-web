import * as KV from "../../../../../kodeverk";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import Datovelger from "../../../../../felleskomponenter/datovelger";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import "./medlemskapsperiodeSkjema.less";

interface MedlemskapsperioderDisplayProps {
  medlemskapsperioder: Medlemskapsperiode[];
}

export function MedlemskapsperioderDisplay({ medlemskapsperioder }: MedlemskapsperioderDisplayProps) {
  if (!medlemskapsperioder || medlemskapsperioder.length === 0) {
    return null;
  }

  const handleDateChange = () => {
    // display component
  };

  return (
    <div className="medlemskapsperiode-display">
      <Nav.Select label="Bestemmelse" value={medlemskapsperioder[0].bestemmelse} readOnly>
        <option value={medlemskapsperioder[0].bestemmelse}>
          {KV.kodeTilTerm(medlemskapsperioder[0].bestemmelse, [
            ...Object.values(MKV.KTObjects.folketrygdloven_kap2_bestemmelser),
            ...Object.values(MKV.KTObjects.vertslandsavtale_bestemmelser),
          ] as string[])}
        </option>
      </Nav.Select>
      <div className="perioder">
        {medlemskapsperioder.map((periode, index) => (
          <Nav.Row key={index} className="periode__rad medlemskapsperiode__rad">
            <Nav.Column className="dato">
              <Datovelger
                label={index === 0 ? "Medlemskapsperiode" : ""}
                onChange={handleDateChange}
                value={Utils.dato.norskStringTilDate(periode.fomDato)}
                readOnly={true}
              />
            </Nav.Column>
            <Nav.Column className="dato">
              <Datovelger
                label={index === 0 ? <span className="invisible" /> : ""}
                onChange={handleDateChange}
                value={Utils.dato.norskStringTilDate(periode.tomDato)}
                readOnly={true}
              />
            </Nav.Column>
            <Nav.Column className="trygdedekning">
              {index === 0 ? (
                <Nav.Select label="Dekning" value={periode.trygdedekning} readOnly>
                  <option value={periode.trygdedekning}>
                    {KV.kodeTilTerm(periode.trygdedekning, MKV.KTObjects.trygdedekninger)}
                  </option>
                </Nav.Select>
              ) : (
                <Nav.Select label="" hideLabel value={periode.trygdedekning} readOnly>
                  <option value={periode.trygdedekning}>
                    {KV.kodeTilTerm(periode.trygdedekning, MKV.KTObjects.trygdedekninger)}
                  </option>
                </Nav.Select>
              )}
            </Nav.Column>
          </Nav.Row>
        ))}
      </div>
    </div>
  );
}
