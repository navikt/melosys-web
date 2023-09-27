import { Familiemedlem } from "../../../../../../graphql";

import Ident from "../ident";
import * as StringUtils from "../../../../../../utils/streng";
import * as Etiketter from "../../../../etiketter";
import * as Utils from "../../../../../../utils";
import { Table } from "@navikt/ds-react";

interface BarnTableProps {
  barnListe: Familiemedlem[];
}

function BarnTable({ barnListe }: BarnTableProps) {
  return (
    <div className="menypanel__table-wrapper">
      <Table>
        <Table.Header>
          <Table.HeaderCell>Navn</Table.HeaderCell>
          <Table.HeaderCell>F.nr./d-nr.</Table.HeaderCell>
          <Table.HeaderCell>Foreldreansvar</Table.HeaderCell>
          <Table.HeaderCell>F.nr. annen forelder</Table.HeaderCell>
          <Table.HeaderCell>&nbsp;</Table.HeaderCell>
        </Table.Header>
        <Table.Body>
          {barnListe.map((barn) => (
            <Table.Row key={Utils._uuid()}>
              <Table.DataCell>{barn.navn}</Table.DataCell>
              <Table.DataCell>
                <Ident ident={barn.ident} />
              </Table.DataCell>
              <Table.DataCell>{StringUtils.storeForbokstaver(barn.foreldreansvar)}</Table.DataCell>
              <Table.DataCell>{barn.fnrAnnenForelder}</Table.DataCell>
              <Table.DataCell>{barn.alder && barn.alder < 18 ? <Etiketter.Under18Aar /> : ""}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

export default BarnTable;
