import React from "react";

import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import MKV from "../../../../melosyskodeverk";

type AvsenderUtenlandskTrygdemyndighetProps = {
  utenlandskTrygdemyndighetLandkode?: string;
  fullmektigLandEndret: (landkode: string) => void;
};

const AvsenderUtenlandskTrygdemyndighet = ({
  utenlandskTrygdemyndighetLandkode,
  fullmektigLandEndret,
}: AvsenderUtenlandskTrygdemyndighetProps) => (
  <div className="avsender">
    <Skjema.LandVelger
      feltNavn="utenlandskTrygdemyndighetLandkode"
      label="Land"
      // @ts-ignore
      onChange={fullmektigLandEndret}
      className="avsender__input"
      bredde="XL"
    />
    <div className="avsender__navn">
      <Nav.Typo.Element className="avsender__navn__label">Avsender:</Nav.Typo.Element>
      {utenlandskTrygdemyndighetLandkode && (
        <Nav.Typo.Normaltekst>
          Trygdemyndighet i {KV.kodeTilTerm(utenlandskTrygdemyndighetLandkode, MKV.KTObjects.landkoder)}
        </Nav.Typo.Normaltekst>
      )}
    </div>
  </div>
);

export default AvsenderUtenlandskTrygdemyndighet;
