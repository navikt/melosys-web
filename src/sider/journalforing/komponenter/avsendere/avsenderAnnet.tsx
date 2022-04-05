import React from "react";

import * as Skjema from "../../../../felleskomponenter/skjema";

const AvsenderAnnet = () => (
  <div className="avsender">
    <Skjema.Input
      feltNavn="avsenderNavn"
      label="Oppgi avsenders navn"
      placeholder="Skriv inn..."
      className="avsender__input"
    />
  </div>
);

export default AvsenderAnnet;
