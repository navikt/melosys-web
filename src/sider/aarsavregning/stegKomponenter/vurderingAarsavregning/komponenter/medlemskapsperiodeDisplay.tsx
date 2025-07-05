import * as KV from "../../../../../kodeverk";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import Datovelger from "../../../../../felleskomponenter/datovelger";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Ikoner from "../../../../../resources/images";
import "./medlemskapsperiodeSkjema.css";

interface MedlemskapsperiodeDisplayProps {
  fomDato: string;
  tomDato: string;
  trygdedekning: string;
  bestemmelse: string;
}

export function MedlemskapsperiodeDisplay({
  fomDato,
  tomDato,
  trygdedekning,
  bestemmelse,
}: MedlemskapsperiodeDisplayProps) {
  const handleDateChange = () => {
    // display component
  };

  return (
    <>
      <Nav.Select label="Bestemmelse" value={bestemmelse} readOnly>
        <option value={bestemmelse}>
          {KV.kodeTilTerm(bestemmelse, [
            ...Object.values(MKV.KTObjects.folketrygdloven_kap2_bestemmelser),
            ...Object.values(MKV.KTObjects.vertslandsavtale_bestemmelser),
          ] as string[])}
        </option>
      </Nav.Select>
      <div className="perioder">
        <Nav.Row className="periode__rad medlemskapsperiode__rad">
          <Nav.Column className="dato">
            <Datovelger
              label="Medlemskapsperiode"
              onChange={handleDateChange}
              value={Utils.dato.norskStringTilDate(fomDato)}
              readOnly={true}
            />
          </Nav.Column>
          <Nav.Column className="dato dato__tom">
            <Datovelger
              label={<span className="invisible" />}
              onChange={handleDateChange}
              value={Utils.dato.norskStringTilDate(tomDato)}
              readOnly={true}
            />
          </Nav.Column>
          <Nav.Column className="trygdedekning">
            <Nav.Select label="Dekning" value={trygdedekning} readOnly>
              <option value={trygdedekning}>{KV.kodeTilTerm(trygdedekning, MKV.KTObjects.trygdedekninger)}</option>
            </Nav.Select>
          </Nav.Column>
        </Nav.Row>
        <div className="legg-til__rad">
          <Mui.Lenkeknapp onClick={handleDateChange} ikon={Ikoner.Add} disabled>
            Legg til periode
          </Mui.Lenkeknapp>
        </div>
      </div>
    </>
  );
}
