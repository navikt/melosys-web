import React, { useState } from "react";

import * as Nav from "../../../../../../navFrontend";

import KopierbarTekst from "../../../../../kopierbarTekst";
import Informasjonsmodal from "./informasjonsmodal";

interface IdentProps {
  ident: string;
  visMerInformasjon?: boolean;
}

const Ident = ({ ident, visMerInformasjon = false }: IdentProps) => {
  const [visInformasjonsmodal, setVisInformasjonsmodal] = useState(false);

  return (
    <>
      <KopierbarTekst hovertekst="Kopier fødselsnummer">{ident}</KopierbarTekst>
      {visMerInformasjon && (
        <Nav.Flatknapp mini onClick={() => setVisInformasjonsmodal(true)}>
          Vis mer informasjon
        </Nav.Flatknapp>
      )}
      {visInformasjonsmodal && (
        <Informasjonsmodal
          contentLabel="Informasjon om annen forelder"
          onRequestClose={() => setVisInformasjonsmodal(false)}
        />
      )}
    </>
  );
};

export default Ident;
