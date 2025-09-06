import { ElementType, ReactNode, SVGProps } from "react";
import classNames from "classnames";

import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import "./undertittel.less";

interface UndertittelProps {
  ikon?: ElementType;
  ikonProps?: SVGProps<SVGElement>;
  tekst: string;
  etterTekst?: ReactNode;
  className?: string;
  understrek?: boolean;
}

function Undertittel({ ikon: Ikon, tekst, etterTekst, className, understrek = false, ikonProps }: UndertittelProps) {
  const cl = classNames("undertittel", className);
  const navUndertittelCl = classNames({ "undertittel--understrek": understrek }, "undertittel__navUndertittel");

  const undertittelId = Utils._uuid();

  const defaultIkonProps = {
    role: "img",
    focusable: "false",
    "aria-labelledby": undertittelId,
    title: `${tekst} - ${etterTekst}`,
  };

  return (
    <div className={cl}>
      <Nav.Heading level="3" id={undertittelId} className={navUndertittelCl}>
        {Ikon && <Ikon className="undertittel__ikon" {...defaultIkonProps} {...ikonProps} />}
        <span className="undertittel__tekst">{tekst}</span>
        <span>{etterTekst}</span>
      </Nav.Heading>
    </div>
  );
}

export default Undertittel;
