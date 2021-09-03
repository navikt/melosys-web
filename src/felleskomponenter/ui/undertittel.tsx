import React, { ElementType, ReactNode } from "react";
import classNames from "classnames";

import * as Nav from "../../utils/navFrontend";

import "./undertittel.css";

interface UndertittelProps {
  ikon?: ElementType;
  tekst: string;
  etterTekst?: ReactNode;
  className?: string;
  understrek?: boolean;
}

const Undertittel = ({ ikon: Ikon, tekst, etterTekst, className, understrek = false }: UndertittelProps) => {
  const cl = classNames("undertittel", className);
  const navUndertittelCl = classNames({ understrek }, "navUndertittel");

  return (
    <div className={cl}>
      <Nav.Typo.Undertittel className={navUndertittelCl}>
        {Ikon && <Ikon className="ikon" />}
        <span className="tekst">{tekst}</span>
        <span>{etterTekst}</span>
      </Nav.Typo.Undertittel>
    </div>
  );
};

export default Undertittel;
