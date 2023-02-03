import React, { MouseEventHandler } from "react";
import * as Api from "../../../../services/api";
import * as Ikoner from "../../../../resources/images";
import * as Mui from "../../../ui";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";

import "./lagredeUtkast.css";

interface LagredeUtkastProps {
  alleUtkast: Api.Brevutkast.BrevutkastResDto[];
  settAktivtUtkast: (utkast: Api.Brevutkast.BrevutkastResDto | null) => void;
}

const LagredeUtkast = ({ alleUtkast, settAktivtUtkast }: LagredeUtkastProps) => {
  const velgUtkast: MouseEventHandler<HTMLButtonElement> = (event) => {
    const tittel = (event.target as HTMLButtonElement).value;
    const valgtUtkast = alleUtkast.find((utkast) => utkast.tittel === tittel);
    settAktivtUtkast(valgtUtkast || null);
  };

  return (
    <>
      {!Utils._isEmpty(alleUtkast) && (
        <div className="lagredeUtkast">
          <Nav.Typo.Element>Lagrede utkast</Nav.Typo.Element>
          {alleUtkast.map((utkast) => (
            <Mui.Lenkeknapp
              key={utkast.tittel}
              value={utkast.tittel}
              onClick={velgUtkast}
              ikon={Ikoner.Draft}
              className="lagredeUtkast__utkast"
            >
              {utkast.tittel}
            </Mui.Lenkeknapp>
          ))}
        </div>
      )}
    </>
  );
};

export default LagredeUtkast;
