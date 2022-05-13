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
      <div className="overskrift">
        <Ikon className="ikon" />
        <Nav.Typo.Undertittel className="tittel">{tittel}</Nav.Typo.Undertittel>
      </div>
      {innhold}
    </div>
  );
};

export default Komponent;
