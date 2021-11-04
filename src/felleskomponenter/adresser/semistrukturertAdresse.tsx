import React from "react";

import { SemistrukturertAdresseformat } from "../../graphql";

interface SemistrukturertAdresseProps {
  adresse: Partial<SemistrukturertAdresseformat>;
}

const SemistrukturertAdresse = ({
  adresse: { adresselinje1, adresselinje2, adresselinje3, adresselinje4, postnummer, poststed, land },
}: SemistrukturertAdresseProps) => {
  const kommaLand = `, ${land}`;
  const postNrStedLandLinje = `${postnummer ?? ""} ${poststed ?? ""}${land ? kommaLand : ""}`;

  return (
    <address>
      {adresselinje1 && <div>{adresselinje1}</div>}
      {adresselinje2 && <div>{adresselinje2}</div>}
      {adresselinje3 && <div>{adresselinje3}</div>}
      {adresselinje4 && <div>{adresselinje4}</div>}
      <div>{postNrStedLandLinje}</div>
    </address>
  );
};

export default SemistrukturertAdresse;
