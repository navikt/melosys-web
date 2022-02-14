import React from "react";

import * as Api from "../../services/api";

interface StrukturertAdresseProps {
  adresse: Partial<Api.StrukturertAdresse>;
}

const StrukturertAdresse = ({
  adresse: {
    tilleggsnavn,
    gatenavn,
    husnummerEtasjeLeilighet,
    region,
    postboks,
    postnummer,
    poststed,
    landkode,
    coAdressenavn,
  },
}: StrukturertAdresseProps) => (
  <address>
    <div>{coAdressenavn}</div>
    <div>{tilleggsnavn}</div>
    <div>
      {gatenavn} {husnummerEtasjeLeilighet}
    </div>
    <div>
      {postnummer} {poststed} {postboks}
    </div>
    <div>
      {region} {landkode}
    </div>
  </address>
);

export default StrukturertAdresse;
