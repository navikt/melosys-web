import React from "react";

import * as Api from "../../services/api";

interface StrukturertAdresseProps {
  adresse: Partial<Api.StrukturertAdresse>;
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
