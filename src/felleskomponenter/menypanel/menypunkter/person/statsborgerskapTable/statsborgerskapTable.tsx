import { useState } from "react";

import * as Utils from "../../../../../utils";
import * as Nav from "../../../../../navFrontend";
import ChevronKnapp from "../../../../chevronKnapp/chevronKnapp";
import { Statsborgerskap } from "../../../../../graphql";

interface StatsborgerskapTableProps {
  statsborgerskapList: Statsborgerskap[];
  historisk?: boolean;
}

const renderPeriode = (statsborgerskap: Statsborgerskap, historisk?: boolean) => {
  if (historisk) {
    return `${
      statsborgerskap.gyldigFraOgMed ? Utils.dato.formatterDatoTilNorsk(statsborgerskap.gyldigFraOgMed) : ""
    } - ${statsborgerskap.gyldigTilOgMed ? Utils.dato.formatterDatoTilNorsk(statsborgerskap.gyldigTilOgMed) : ""}`;
  }
  return statsborgerskap.gyldigFraOgMed ? Utils.dato.formatterDatoTilNorsk(statsborgerskap.gyldigFraOgMed) : "";
};

const StatsborgerskapTable = ({ statsborgerskapList, historisk }: StatsborgerskapTableProps) => {
  const [expanded, setExpanded] = useState(false);
  const periodetekst = `Gyldig f.o.m.${historisk ? " - t.o.m." : ""}`;

  return (
    <div className="menypanel__table-wrapper">
      {!historisk || expanded ? (
        <Nav.Table className="menypanel__table">
          <Nav.Table.Header>
            <Nav.Table.Row>
              <Nav.Table.HeaderCell className={historisk ? "transparent" : ""}>Land</Nav.Table.HeaderCell>
              <Nav.Table.HeaderCell className={historisk ? "transparent" : ""}>Register</Nav.Table.HeaderCell>
              <Nav.Table.HeaderCell className={historisk ? "transparent" : ""}>Kilde</Nav.Table.HeaderCell>
              <Nav.Table.HeaderCell className={historisk ? "transparent" : ""}>Bekreftelsesdato</Nav.Table.HeaderCell>
              <Nav.Table.HeaderCell className="fixed-width">{periodetekst}</Nav.Table.HeaderCell>
            </Nav.Table.Row>
          </Nav.Table.Header>
          <Nav.Table.Body>
            {statsborgerskapList.map((statsborgerskap) => (
              <Nav.Table.Row key={Utils._uuid()}>
                <Nav.Table.DataCell>{statsborgerskap.land}</Nav.Table.DataCell>
                <Nav.Table.DataCell>{statsborgerskap.master}</Nav.Table.DataCell>
                <Nav.Table.DataCell>{statsborgerskap.kilde}</Nav.Table.DataCell>
                <Nav.Table.DataCell>
                  {Utils.dato.formatterDatoTilNorsk(statsborgerskap.bekreftelsesdato)}
                </Nav.Table.DataCell>
                <Nav.Table.DataCell className={historisk ? "historisk-label" : "gyldig-label"}>
                  {renderPeriode(statsborgerskap, historisk)}
                </Nav.Table.DataCell>
              </Nav.Table.Row>
            ))}
          </Nav.Table.Body>
        </Nav.Table>
      ) : null}
      {historisk && (
        <ChevronKnapp
          expanded={expanded}
          onChange={() => setExpanded(!expanded)}
          label={expanded ? "Lukk historikk" : "Åpne historikk"}
        />
      )}
    </div>
  );
};

export default StatsborgerskapTable;
