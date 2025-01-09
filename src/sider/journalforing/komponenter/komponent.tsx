import { ElementType, ReactElement } from "react";

import * as Nav from "../../../navFrontend";
import "./komponent.css";

interface KomponentProps {
  ikon: ElementType;
  tittel: string;
  innhold: ReactElement;
}

function Komponent({ ikon: Ikon, tittel, innhold }: KomponentProps) {
  return (
    <div className="journalføringKomponent">
      <div className="journalføringKomponent__overskrift">
        <Ikon className="journalføringKomponent__ikon" />
        <Nav.Heading size="xsmall" className="journalføringKomponent__tittel">
          {tittel}
        </Nav.Heading>
      </div>
      <div className="journalføringKomponent__innhold">{innhold}</div>
    </div>
  );
}

export function KomponentUtenOverskrift({ innhold }: { innhold: ReactElement }) {
  return <div className="journalføringKomponent">{innhold}</div>;
}

export default Komponent;
