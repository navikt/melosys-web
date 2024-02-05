import * as KV from "../../../../../kodeverk";

import MKV from "../../../../../melosyskodeverk";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

import { Table } from "@navikt/ds-react";

const RedigeringUtfort = ({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.ArbeidsstedOffshore>) => (
  <div className="arbeidssted__offshore__redigeringutfort-wrapper">
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Navn på innretning</Table.HeaderCell>
          <Table.HeaderCell>Type innretning</Table.HeaderCell>
          <Table.HeaderCell>Lands sokkel</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {verdier.map((arbeidsstedOffshore) => (
          <Table.Row key={arbeidsstedOffshore.enhetNavn}>
            <Table.DataCell>{arbeidsstedOffshore.enhetNavn}</Table.DataCell>
            <Table.DataCell>
              {KV.kodeTilTerm(arbeidsstedOffshore.innretningstype, MKV.KTObjects.innretningstyper)}
            </Table.DataCell>
            <Table.DataCell>
              {KV.kodeTilTerm(arbeidsstedOffshore.innretningLandkode, MKV.KTObjects.landkoder)}
            </Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  </div>
);

export default RedigeringUtfort;
