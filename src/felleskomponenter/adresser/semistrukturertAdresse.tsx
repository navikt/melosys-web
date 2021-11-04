import React from "react";

import { SemistrukturertAdresseformat } from "../../graphql";

type PostnrStedLandLinjeProps = Pick<SemistrukturertAdresseProps["adresse"], "land" | "postnummer" | "poststed">;

export const PostnrStedLandLinje = ({ land, postnummer, poststed }: PostnrStedLandLinjeProps) => {
  const skalViseKomma = (postnummer || poststed) && land;
  const skalViseMellomrom = postnummer && poststed;
  const postNrStedLandLinje = `${postnummer ?? ""}${skalViseMellomrom ? " " : ""}${poststed ?? ""}${
    skalViseKomma ? ", " : ""
  }${land ?? ""}`;

  return <div>{postNrStedLandLinje}</div>;
};

interface SemistrukturertAdresseProps {
  adresse: Partial<SemistrukturertAdresseformat>;
}

const SemistrukturertAdresse = ({
  adresse: { adresselinje1, adresselinje2, adresselinje3, adresselinje4, postnummer, poststed, land },
}: SemistrukturertAdresseProps) => (
  <address>
    {adresselinje1 && <div>{adresselinje1}</div>}
    {adresselinje2 && <div>{adresselinje2}</div>}
    {adresselinje3 && <div>{adresselinje3}</div>}
    {adresselinje4 && <div>{adresselinje4}</div>}
    <PostnrStedLandLinje postnummer={postnummer} poststed={poststed} land={land} />
  </address>
);

export default SemistrukturertAdresse;
