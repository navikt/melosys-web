import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import MKV from "../../../../melosyskodeverk";
import { sorterLandOgGjørOmTilStoreForbokstaver } from "../../../../utils/land";

interface AvsenderUtenlandskTrygdemyndighetProps {
  utenlandskTrygdemyndighetLandkode?: string;
  fullmektigLandEndret: (landkode: string) => void;
}

function AvsenderUtenlandskTrygdemyndighet({
  utenlandskTrygdemyndighetLandkode,
  fullmektigLandEndret,
}: AvsenderUtenlandskTrygdemyndighetProps) {
  const landkoderTilUtenlandskTrygdemyndighet = sorterLandOgGjørOmTilStoreForbokstaver(
    MKV.Kodekombinasjoner.unikeAvtaleland,
  );

  return (
    <div className="avsender">
      <Skjema.LandVelger
        feltNavn="utenlandskTrygdemyndighetLandkode"
        label="Land"
        onChange={fullmektigLandEndret}
        className="avsender__input"
        bredde="XL"
        landkoder={landkoderTilUtenlandskTrygdemyndighet}
      />
      <div className="avsender__navn">
        <Nav.BodyLong weight="semibold" size="small" className="avsender__navn__label">
          Avsender:
        </Nav.BodyLong>
        {utenlandskTrygdemyndighetLandkode && (
          <Nav.BodyLong size="small">
            Trygdemyndighet i {KV.kodeTilTerm(utenlandskTrygdemyndighetLandkode, landkoderTilUtenlandskTrygdemyndighet)}
          </Nav.BodyLong>
        )}
      </div>
    </div>
  );
}

export default AvsenderUtenlandskTrygdemyndighet;
