import React from "react";

import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import MKV from "../../../../melosyskodeverk";
import { sorterLandOgGjørOmTilStoreForbokstaver } from "../../../../utils/land";

type AvsenderUtenlandskTrygdemyndighetProps = {
  utenlandskTrygdemyndighetLandkode?: string;
  fullmektigLandEndret: (landkode: string) => void;
};

const AvsenderUtenlandskTrygdemyndighet = ({
  utenlandskTrygdemyndighetLandkode,
  fullmektigLandEndret,
}: AvsenderUtenlandskTrygdemyndighetProps) => {
  const landkoderTilUtenlandskTrygdemyndighet = sorterLandOgGjørOmTilStoreForbokstaver(
    MKV.Kodekombinasjoner.unikeAvtaleland
  );

  return (
    <div className="avsender">
      <Skjema.LandVelger
        feltNavn="utenlandskTrygdemyndighetLandkode"
        label="Land"
        // @ts-ignore
        onChange={fullmektigLandEndret}
        className="avsender__input"
        bredde="XL"
        landkoder={landkoderTilUtenlandskTrygdemyndighet}
      />
      <div className="avsender__navn">
        <Nav.Typo.Element className="avsender__navn__label">Avsender:</Nav.Typo.Element>
        {utenlandskTrygdemyndighetLandkode && (
          <Nav.Typo.Normaltekst>
            Trygdemyndighet i {KV.kodeTilTerm(utenlandskTrygdemyndighetLandkode, landkoderTilUtenlandskTrygdemyndighet)}
          </Nav.Typo.Normaltekst>
        )}
      </div>
    </div>
  );
};

export default AvsenderUtenlandskTrygdemyndighet;
