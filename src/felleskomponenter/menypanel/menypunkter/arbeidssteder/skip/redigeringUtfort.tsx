import * as KV from "../../../../../kodeverk";

import MKV from "../../../../../melosyskodeverk";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

import { Table } from "@navikt/ds-react";

const RedigeringUtfort = ({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.ArbeidsstedSkip>) => (
  <div className="arbeidssted__utland__redigeringutfort-wrapper">
    <Table>
      <Table.Header>
        <Table.HeaderCell>Navn på skip</Table.HeaderCell>
        <Table.HeaderCell>Fartsområde</Table.HeaderCell>
        <Table.HeaderCell>Flaggstat/lands territorialfarvann</Table.HeaderCell>
      </Table.Header>
      <Table.Body>
        {verdier.map((arbeidsstedSkip) => (
          <Table.Row key={arbeidsstedSkip.enhetNavn}>
            <Table.DataCell>{arbeidsstedSkip.enhetNavn}</Table.DataCell>
            <Table.DataCell>
              {KV.kodeTilTerm(arbeidsstedSkip.fartsomradeKode, MKV.KTObjects.begrunnelser.fartsomrader)}
            </Table.DataCell>
            <Table.DataCell>
              {KV.kodeTilTerm(arbeidsstedSkip.territorialfarvann, MKV.KTObjects.landkoder)}
            </Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  </div>
);

export default RedigeringUtfort;
