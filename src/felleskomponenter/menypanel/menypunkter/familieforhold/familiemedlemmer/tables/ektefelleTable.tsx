import { Table } from "@navikt/ds-react";

import * as Utils from "../../../../../../utils";
import { Familiemedlem } from "../../../../../../graphql";

import Ident from "../ident";

export const EktefelleTable = ({ ektefelleListe }: { ektefelleListe: Familiemedlem[] }) => {
  return (
    <div className="menypanel__table-wrapper">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell textSize="small">Navn</Table.HeaderCell>
            <Table.HeaderCell textSize="small">F.nr./d-nr.</Table.HeaderCell>
            <Table.HeaderCell textSize="small">Fra og med</Table.HeaderCell>
            <Table.HeaderCell textSize="small">Relasjon</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {ektefelleListe.map((ektefelle) => (
            <Table.Row key={Utils._uuid()}>
              <Table.DataCell textSize="small">{ektefelle.navn}</Table.DataCell>
              <Table.DataCell textSize="small">
                <Ident ident={ektefelle.ident} />
              </Table.DataCell>
              <Table.DataCell textSize="small">
                {Utils.dato.formatterDatoTilNorsk(ektefelle.sivilstand?.gyldigFraOgMed)}
              </Table.DataCell>
              <Table.DataCell textSize="small">{ektefelle.sivilstand?.type}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};
