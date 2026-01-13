import * as KV from "../../../../../kodeverk";
import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import Datovelger from "../../../../../felleskomponenter/datovelger";
import { Avgiftspliktigperiode } from "../../../../../services/modules/types/periodeTyper";
import "./medlemskapsperiodeSkjema.less";

interface MedlemskapsperioderDisplayProps {
  medlemskapsperioder: Avgiftspliktigperiode[] | null | undefined;
}

export function MedlemskapsperioderDisplay({ medlemskapsperioder }: MedlemskapsperioderDisplayProps) {
  if (!medlemskapsperioder || medlemskapsperioder.length === 0) {
    return null;
  }

  const forstePeriode = medlemskapsperioder[0];
  const bestemmelse =
    forstePeriode.type === "MEDLEMSKAPSPERIODE" || forstePeriode.type === "LOVVALGSPERIODE"
      ? forstePeriode.bestemmelse
      : "";

  return (
    <div className="medlemskapsperiode-display">
      {bestemmelse && (
        <Nav.Select label="Bestemmelse" value={bestemmelse} onChange={() => {}} readOnly>
          <option value={bestemmelse}>
            {KV.kodeTilTerm(bestemmelse, [
              ...Object.values(MKV.KTObjects.folketrygdloven_kap2_bestemmelser),
              ...Object.values(MKV.KTObjects.vertslandsavtale_bestemmelser),
            ] as string[])}
          </option>
        </Nav.Select>
      )}
      <div className="perioder">
        {/* Using index as key since backend returns id=0 for all periods, making IDs unreliable */}
        {medlemskapsperioder.map((periode, index) => {
          const trygdedekning =
            periode.type === "MEDLEMSKAPSPERIODE" || periode.type === "LOVVALGSPERIODE" ? periode.trygdedekning : "";
          return (
            <Nav.Row key={index} className="periode__rad medlemskapsperiode__rad">
              <Nav.Column className="dato">
                <Datovelger
                  label={index === 0 ? "Medlemskapsperiode" : ""}
                  onChange={() => {}}
                  value={Utils.dato.norskStringTilDate(periode.fomDato)}
                  readOnly={true}
                />
              </Nav.Column>
              <Nav.Column className="dato">
                <Datovelger
                  label={index === 0 ? <span className="invisible" /> : ""}
                  onChange={() => {}}
                  value={Utils.dato.norskStringTilDate(periode.tomDato)}
                  readOnly={true}
                />
              </Nav.Column>
              {trygdedekning && (
                <Nav.Column className="trygdedekning">
                  <Nav.Select
                    label={index === 0 ? "Dekning" : ""}
                    hideLabel={index !== 0}
                    value={trygdedekning}
                    onChange={() => {}}
                    readOnly
                  >
                    <option value={trygdedekning}>
                      {KV.kodeTilTerm(trygdedekning, MKV.KTObjects.trygdedekninger)}
                    </option>
                  </Nav.Select>
                </Nav.Column>
              )}
            </Nav.Row>
          );
        })}
      </div>
    </div>
  );
}
