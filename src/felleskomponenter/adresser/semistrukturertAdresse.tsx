import React from "react";

import { SemistrukturertAdresseformat } from "../../graphql";

interface SemistrukturertAdresseProps {
  adresse: Partial<SemistrukturertAdresseformat>;
}

const SemistrukturertAdresse = ({
  adresse: { adresselinje1, adresselinje2, adresselinje3, adresselinje4, postnummer, poststed, land },
}: SemistrukturertAdresseProps) => (
  <address>
    <div>{adresselinje1}</div>
    <div>{adresselinje2}</div>
    <div>{adresselinje3}</div>
    <div>{adresselinje4}</div>
    <div>
      {postnummer} {poststed}, {land}
    </div>
  </address>
);

export default SemistrukturertAdresse;
