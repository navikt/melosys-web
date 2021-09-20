import React from "react";

import { SemistrukturertAdresseformat } from "../../graphql";

interface SemistrukturertAdresseProps {
  adresse: Partial<SemistrukturertAdresseformat>;
}

const SemistrukturertAdresse = ({
  adresse: { adresselinje1, adresselinje2, adresselinje3, adresselinje4, postnummer, poststed, land },
}: SemistrukturertAdresseProps) => {
  const postNrStedLandLinje = `${postnummer} ${poststed}, ${land}`;

  return (
    <address>
      <div>{adresselinje1}</div>
      <div>{adresselinje2}</div>
      <div>{adresselinje3}</div>
      <div>{adresselinje4}</div>
      <div>{postNrStedLandLinje}</div>
    </address>
  );
};

export default SemistrukturertAdresse;
