import React, { Fragment } from "react";

import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import MKV from "../../../../melosyskodeverk";

type AvsenderUtenlandskTrygdemyndighetProps = {
  utenlandskTrygdemyndighetLandkode?: string;
  fullmektigLandEndret: (landkode: string) => void;
};

const AvsenderUtenlandskTrygdemyndighet = ({
  utenlandskTrygdemyndighetLandkode = "",
  fullmektigLandEndret,
}: AvsenderUtenlandskTrygdemyndighetProps) => (
  <div className="avsender">
    <Skjema.LandVelger
      feltNavn="utenlandskTrygdemyndighetLandkode"
      label="Velg land"
      // @ts-ignore
      onChange={fullmektigLandEndret}
      className="avsender__input"
    />
    {utenlandskTrygdemyndighetLandkode && (
      <Fragment>
        <Nav.Typo.Element>Avsender</Nav.Typo.Element>
        <Nav.Typo.Normaltekst>
          Trygdemyndighet i {KV.kodeTilTerm(utenlandskTrygdemyndighetLandkode, MKV.KTObjects.landkoder)}
        </Nav.Typo.Normaltekst>
      </Fragment>
    )}
  </div>
);

export default AvsenderUtenlandskTrygdemyndighet;
