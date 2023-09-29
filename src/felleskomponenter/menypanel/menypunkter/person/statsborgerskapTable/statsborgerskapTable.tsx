import { useState } from "react";

import * as Utils from "../../../../../utils";
import ChevronKnapp from "../../../../chevronKnapp/chevronKnapp";
import { Statsborgerskap } from "../../../../../graphql";
import { Table } from "@navikt/ds-react";

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
        <Table className="menypanel__table">
          <Table.Header>
            <Table.HeaderCell className={historisk ? "transparent" : ""}>Land</Table.HeaderCell>
            <Table.HeaderCell className={historisk ? "transparent" : ""}>Register</Table.HeaderCell>
            <Table.HeaderCell className={historisk ? "transparent" : ""}>Kilde</Table.HeaderCell>
            <Table.HeaderCell className={historisk ? "transparent" : ""}>Bekreftelsesdato</Table.HeaderCell>
            <Table.HeaderCell className="fixed-width">{periodetekst}</Table.HeaderCell>
          </Table.Header>
          <Table.Body>
            {statsborgerskapList.map((statsborgerskap) => (
              <Table.Row key={Utils._uuid()}>
                <Table.DataCell>{statsborgerskap.land}</Table.DataCell>
                <Table.DataCell>{statsborgerskap.master}</Table.DataCell>
                <Table.DataCell>{statsborgerskap.kilde}</Table.DataCell>
                <Table.DataCell>{Utils.dato.formatterDatoTilNorsk(statsborgerskap.bekreftelsesdato)}</Table.DataCell>
                <Table.DataCell className={historisk ? "historisk-label" : "gyldig-label"}>
                  {renderPeriode(statsborgerskap, historisk)}
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
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
