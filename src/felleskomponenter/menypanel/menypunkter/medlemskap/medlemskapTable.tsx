import { useState } from "react";

import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import * as Api from "../../../../services/api";
import ChevronKnapp from "../../../chevronKnapp/chevronKnapp";

interface MedlemskapTableProps {
  perioder: Api.Behandlinger.behandling.Medlemsperiode[];
}

const MedlemskapTable = ({ perioder }: MedlemskapTableProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="menypanel__table-wrapper">
      <table className="menypanel__table">
        <tbody>
          <tr className="header">
            <th>Fra og med</th>
            <th>Til og med</th>
            <th>Land</th>
            <th>Status</th>
            <th>Hjemmel</th>
          </tr>
          {(expanded ? perioder : perioder.slice(0, 2)).map((periode) => (
            <tr key={Utils._uuid()}>
              <td>{Utils.dato.formatterDatoTilNorsk(periode.periode.fom)}</td>
              <td>{Utils.dato.formatterDatoTilNorsk(periode.periode.tom)}</td>
              <td>{KV.objektTilTerm(periode.land)}</td>
              <td>{KV.objektTilTerm(periode.status)}</td>
              <td>{KV.objektTilTerm(periode.grunnlagstype)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {perioder.length > 2 && (
        <ChevronKnapp
          expanded={expanded}
          onChange={() => setExpanded(!expanded)}
          label={expanded ? "Vis færre" : "Vis flere"}
        />
      )}
    </div>
  );
};

export default MedlemskapTable;
