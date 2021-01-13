import React from "react";
import { StrukturertAdresse as StrukturertAdresseType } from "Domene";

interface StrukturertAdresseProps {
  adresse: Partial<StrukturertAdresseType>;
}

const StrukturertAdresse = ({
  adresse: { gatenavn, husnummer, region, postnummer, poststed, landkode },
}: StrukturertAdresseProps) => (
  <address>
    <div>
      {gatenavn} {husnummer}
    </div>
    <div>
      {postnummer} {poststed}
    </div>
    <div>
      {region} {landkode}
    </div>
  </address>
);

export default StrukturertAdresse;
