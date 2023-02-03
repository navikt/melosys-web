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
  const finnTittelTilUtkast = (utkast: Api.Brevutkast.BrevutkastResDto): string =>
    !Utils._isEmpty(utkast.brevbestilling.dokumentTittel)
      ? utkast.brevbestilling.dokumentTittel!!
      : utkast.brevbestilling.produserbardokument.term!!;

  const velgUtkast: MouseEventHandler<HTMLButtonElement> = (event) => {
    const tittel = (event.target as HTMLButtonElement).value;
    const valgtUtkast = alleUtkast.find((utkast) => finnTittelTilUtkast(utkast) === tittel);
    settAktivtUtkast(valgtUtkast || null);
  };

  return (
    <>
      {!Utils._isEmpty(alleUtkast) && (
        <div className="lagredeUtkast">
          <Nav.Typo.Element>Lagrede utkast</Nav.Typo.Element>
          {alleUtkast.map((utkast) => (
            <Mui.Lenkeknapp
              key={finnTittelTilUtkast(utkast)}
              value={finnTittelTilUtkast(utkast)}
              onClick={velgUtkast}
              ikon={Ikoner.Draft}
              className="lagredeUtkast__utkast"
            >
              {finnTittelTilUtkast(utkast)}
            </Mui.Lenkeknapp>
          ))}
        </div>
      )}
    </>
  );
};

export default LagredeUtkast;
