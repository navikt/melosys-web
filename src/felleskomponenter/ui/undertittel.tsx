import React, { ElementType, ReactNode } from "react";
import classNames from "classnames";

import * as Nav from "../../utils/navFrontend";

import "./undertittel.css";

export enum IkonOrientering {
  Venstre = "Venstre",
  Hoyre = "Hoyre",
}

interface UndertittelProps {
  ikon?: ElementType;
  ikonOrientering?: IkonOrientering;
  tekst: string;
  etterTekst?: ReactNode;
  className?: string;
  understrek?: boolean;
}

const Undertittel = ({
  ikon: Ikon,
  ikonOrientering = IkonOrientering.Venstre,
  tekst,
  etterTekst,
  className,
  understrek = false,
}: UndertittelProps) => {
  const cl = classNames("undertittel", className);
  const navUndertittelCl = classNames({ understrek }, "navUndertittel");

  return (
    <div className={cl}>
      <Nav.Typo.Undertittel className={navUndertittelCl}>
        {Ikon && ikonOrientering === IkonOrientering.Venstre && <Ikon className="ikon ikon-venstre" />}
        <span className="tekst">{tekst}</span>
        <span>{etterTekst}</span>
        {Ikon && ikonOrientering === IkonOrientering.Hoyre && <Ikon className="ikon ikon-hoyre" />}
      </Nav.Typo.Undertittel>
    </div>
  );
};

export default Undertittel;
