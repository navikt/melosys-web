import React, { ElementType, ReactElement } from "react";

import * as Nav from "../../../navFrontend";
import "./komponent.css";

interface KomponentProps {
  ikon: ElementType;
  tittel: string;
  innhold: ReactElement;
}

const Komponent = ({ ikon: Ikon, tittel, innhold }: KomponentProps) => {
  return (
    <div className="journalføringKomponent">
      <div className="journalføringKomponent__overskrift">
        <Ikon className="journalføringKomponent__ikon" />
        <Nav.Typo.Undertittel className="journalføringKomponent__tittel">{tittel}</Nav.Typo.Undertittel>
      </div>
      <div className="journalføringKomponent__innhold">{innhold}</div>
    </div>
  );
};

export const KomponentUtenOverskrift = ({ innhold }: { innhold: ReactElement }) => (
  <div className="journalføringKomponent">{innhold}</div>
);

export default Komponent;
