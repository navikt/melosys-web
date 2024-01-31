import * as KV from "../../../../../kodeverk";

import MKV from "../../../../../melosyskodeverk";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

import { Table } from "@navikt/ds-react";

const RedigeringUtfort = ({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.ArbeidsstedFly>) => (
  <div className="arbeidssted__fly__redigeringutfort-wrapper">
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Navn på hjemmebase</Table.HeaderCell>
          <Table.HeaderCell>Type flyvninger</Table.HeaderCell>
          <Table.HeaderCell>Hjemmebasens land</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {verdier.map((arbeidsstedFly) => (
          <Table.Row key={arbeidsstedFly.hjemmebaseNavn}>
            <Table.DataCell>{arbeidsstedFly.hjemmebaseNavn}</Table.DataCell>
            <Table.DataCell>
              {KV.kodeTilTerm(arbeidsstedFly.typeFlyvninger, MKV.KTObjects.flyvningstyper)}
            </Table.DataCell>
            <Table.DataCell>{KV.kodeTilTerm(arbeidsstedFly.hjemmebaseLand, MKV.KTObjects.landkoder)}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  </div>
);

export default RedigeringUtfort;
