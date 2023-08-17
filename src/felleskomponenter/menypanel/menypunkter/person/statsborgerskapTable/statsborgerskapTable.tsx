import { useState } from "react";

import * as Utils from "../../../../../utils";
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
        <table className="menypanel__table">
          <tbody>
            <tr className="header">
              <th className={historisk ? "transparent" : ""}>Land</th>
              <th className={historisk ? "transparent" : ""}>Register</th>
              <th className={historisk ? "transparent" : ""}>Kilde</th>
              <th className={historisk ? "transparent" : ""}>Bekreftelsesdato</th>
              <th className="fixed-width">{periodetekst}</th>
            </tr>
            {statsborgerskapList.map((statsborgerskap) => (
              <tr key={Utils._uuid()}>
                <td>{statsborgerskap.land}</td>
                <td>{statsborgerskap.master}</td>
                <td>{statsborgerskap.kilde}</td>
                <td>{Utils.dato.formatterDatoTilNorsk(statsborgerskap.bekreftelsesdato)}</td>
                <td className={historisk ? "historisk-label" : "gyldig-label"}>
                  {renderPeriode(statsborgerskap, historisk)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
