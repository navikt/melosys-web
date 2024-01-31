import * as Utils from "../../../../../../utils";

import { Familiemedlem } from "../../../../../../graphql";

import Ident from "../ident";
import { Table } from "@navikt/ds-react";

interface EktefelleTableProps {
  ektefelleListe: Familiemedlem[];
}

function EktefelleTable({ ektefelleListe }: EktefelleTableProps) {
  return (
    <div className="menypanel__table-wrapper">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Navn</Table.HeaderCell>
            <Table.HeaderCell>F.nr./d-nr.</Table.HeaderCell>
            <Table.HeaderCell>Fra og med</Table.HeaderCell>
            <Table.HeaderCell>Relasjon</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {ektefelleListe.map((ektefelle) => (
            <Table.Row key={Utils._uuid()}>
              <Table.DataCell>{ektefelle.navn}</Table.DataCell>
              <Table.DataCell>
                <Ident ident={ektefelle.ident} />
              </Table.DataCell>
              <Table.DataCell>{Utils.dato.formatterDatoTilNorsk(ektefelle.sivilstand?.gyldigFraOgMed)}</Table.DataCell>
              <Table.DataCell>{ektefelle.sivilstand?.type}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

export default EktefelleTable;
