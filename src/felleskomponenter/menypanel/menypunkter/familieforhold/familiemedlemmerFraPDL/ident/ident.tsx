import React from "react";

import KopierbarTekst from "../../../../../kopierbarTekst";

interface IdentProps {
  ident: string;
}

const Ident = ({ ident }: IdentProps) => <KopierbarTekst hovertekst="Kopier fødselsnummer">{ident}</KopierbarTekst>;

export default Ident;
