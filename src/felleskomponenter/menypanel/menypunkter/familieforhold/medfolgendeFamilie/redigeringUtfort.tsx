import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";
import { Table } from "@navikt/ds-react";

const RedigeringUtfort = ({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.MedfolgendeFamilie>) => (
  <div className="menypanel__table-wrapper">
    <Table className="menypanel__table" size="small">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>F.nr./d-nr.</Table.HeaderCell>
          <Table.HeaderCell>Navn</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {verdier.map((familiemedlem) => (
          <Table.Row key={Utils._uuid()}>
            <Table.DataCell>{familiemedlem.fnr}</Table.DataCell>
            <Table.DataCell>{familiemedlem.navn}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  </div>
);

export default RedigeringUtfort;
