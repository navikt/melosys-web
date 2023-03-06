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
          <Nav.Row>
            <Nav.Column xs="9">
              <Nav.Typo.Element>Lagrede utkast</Nav.Typo.Element>
            </Nav.Column>
            <Nav.Column xs="3">
              <Nav.Typo.Element>Eier</Nav.Typo.Element>
            </Nav.Column>
          </Nav.Row>

          {alleUtkast.map((utkast) => (
            <Nav.Row key={utkast.tittel}>
              <Nav.Column xs="9">
                <Mui.Lenkeknapp
                  value={utkast.tittel}
                  onClick={velgUtkast}
                  ikon={Ikoner.Draft}
                  className="lagredeUtkast__utkast"
                >
                  {utkast.tittel}
                </Mui.Lenkeknapp>
              </Nav.Column>
              <Nav.Column xs="3">{utkast.lagretAvSaksbehandlerIdent}</Nav.Column>
            </Nav.Row>
          ))}
        </div>
      )}
    </>
  );
};

export default LagredeUtkast;
