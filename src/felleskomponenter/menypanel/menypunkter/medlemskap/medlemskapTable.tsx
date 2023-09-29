import { useState } from "react";

import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import * as Api from "../../../../services/api";
import ChevronKnapp from "../../../chevronKnapp/chevronKnapp";
import { Table } from "@navikt/ds-react";

interface MedlemskapTableProps {
  perioder: Api.Behandlinger.behandling.Medlemsperiode[];
}

const MedlemskapTable = ({ perioder }: MedlemskapTableProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="menypanel__table-wrapper">
      <Table>
        <Table.Header>
          <Table.HeaderCell>Fra og med</Table.HeaderCell>
          <Table.HeaderCell>Til og med</Table.HeaderCell>
          <Table.HeaderCell>Land</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell>Hjemmel</Table.HeaderCell>
        </Table.Header>
        <Table.Body>
          {(expanded ? perioder : perioder.slice(0, 2)).map((periode) => (
            <Table.Row key={Utils._uuid()}>
              <Table.DataCell>{Utils.dato.formatterDatoTilNorsk(periode.periode.fom)}</Table.DataCell>
              <Table.DataCell>{Utils.dato.formatterDatoTilNorsk(periode.periode.tom)}</Table.DataCell>
              <Table.DataCell>{KV.objektTilTerm(periode.land)}</Table.DataCell>
              <Table.DataCell>{KV.objektTilTerm(periode.status)}</Table.DataCell>
              <Table.DataCell>{KV.objektTilTerm(periode.grunnlagstype)}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
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
