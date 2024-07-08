import { Table } from "@navikt/ds-react";

import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

const RedigeringUtfort = ({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.MedfolgendeFamilie>) => (
  <div className="menypanel__table-wrapper">
    <Table className="menypanel__table" size="small">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell textSize="small">Navn</Table.HeaderCell>
          <Table.HeaderCell textSize="small">F.dato/f.nr./d-nr.</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {verdier.map((familiemedlem) => (
          <Table.Row key={Utils._uuid()}>
            <Table.DataCell textSize="small">{familiemedlem.navn}</Table.DataCell>
            <Table.DataCell textSize="small">{familiemedlem.fnr}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  </div>
);

export default RedigeringUtfort;
