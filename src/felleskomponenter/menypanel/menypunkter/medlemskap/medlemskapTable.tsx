import { useState } from "react";

import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import * as Api from "../../../../services/api";
import * as Nav from "../../../../navFrontend";
import ChevronKnapp from "../../../chevronKnapp/chevronKnapp";

interface MedlemskapTableProps {
  perioder: Api.Behandlinger.behandling.Medlemsperiode[];
}

const MedlemskapTable = ({ perioder }: MedlemskapTableProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="menypanel__table-wrapper">
      <Nav.Table>
        <Nav.Table.Header>
          <Nav.Table.Row>
            <Nav.Table.HeaderCell>Fra og med</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell>Til og med</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell>Land</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell>Status</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell>Hjemmel</Nav.Table.HeaderCell>
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>
          {(expanded ? perioder : perioder.slice(0, 2)).map((periode) => (
            <Nav.Table.Row key={Utils._uuid()}>
              <Nav.Table.DataCell>{Utils.dato.formatterDatoTilNorsk(periode.periode.fom)}</Nav.Table.DataCell>
              <Nav.Table.DataCell>{Utils.dato.formatterDatoTilNorsk(periode.periode.tom)}</Nav.Table.DataCell>
              <Nav.Table.DataCell>{KV.objektTilTerm(periode.land)}</Nav.Table.DataCell>
              <Nav.Table.DataCell>{KV.objektTilTerm(periode.status)}</Nav.Table.DataCell>
              <Nav.Table.DataCell>{KV.objektTilTerm(periode.grunnlagstype)}</Nav.Table.DataCell>
            </Nav.Table.Row>
          ))}
        </Nav.Table.Body>
      </Nav.Table>
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
