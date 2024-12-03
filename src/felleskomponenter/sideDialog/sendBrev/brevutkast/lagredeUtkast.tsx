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

function LagredeUtkast({ alleUtkast, settAktivtUtkast }: LagredeUtkastProps) {
  const velgUtkast = (value: string) => {
    const valgtUtkast = alleUtkast.find((utkast) => utkast.tittel === value);
    settAktivtUtkast(valgtUtkast || null);
  };

  return (
    <>
      {!Utils._isEmpty(alleUtkast) && (
        <div className="lagredeUtkast">
          <Nav.Row>
            <Nav.Column xs="9">
              <Nav.BodyLong weight="semibold" size="small">
                Lagrede utkast
              </Nav.BodyLong>
            </Nav.Column>
            <Nav.Column xs="3">
              <Nav.BodyLong weight="semibold" size="small">
                Eier
              </Nav.BodyLong>
            </Nav.Column>
          </Nav.Row>

          {alleUtkast.map((utkast) => (
            <Nav.Row key={utkast.tittel}>
              <Nav.Column xs="9">
                <Mui.Lenkeknapp
                  value={utkast.tittel}
                  onClick={() => velgUtkast(utkast.tittel)}
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
}

export default LagredeUtkast;
