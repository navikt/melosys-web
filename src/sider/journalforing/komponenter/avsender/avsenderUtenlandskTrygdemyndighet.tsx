import React from "react";

import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import MKV from "../../../../melosyskodeverk";
import { useFeatureToggle } from "../../../../featuretoggle";

type AvsenderUtenlandskTrygdemyndighetProps = {
  utenlandskTrygdemyndighetLandkode?: string;
  fullmektigLandEndret: (landkode: string) => void;
};

const AvsenderUtenlandskTrygdemyndighet = ({
  utenlandskTrygdemyndighetLandkode,
  fullmektigLandEndret,
}: AvsenderUtenlandskTrygdemyndighetProps) => {
  const behandleAlleSakerToggle = useFeatureToggle("melosys.behandle_alle_saker");
  const avtaleLand = [
    {
      kode: "LA",
      term: "Land A",
    },
    {
      kode: "LB",
      term: "Land B",
    },
  ];
  const landkoderTilUtenlandskTrygdemyndighet =
    behandleAlleSakerToggle === "enabled" ? MKV.KTObjects.landkoder.concat(avtaleLand) : MKV.KTObjects.landkoder;

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
