import { Table } from "@navikt/ds-react";

import { Familiemedlem } from "../../../../../../graphql";

import Ident from "../ident";
import * as StringUtils from "../../../../../../utils/streng";
import * as Tags from "../../../../tags";
import * as Utils from "../../../../../../utils";

export const BarnTable = ({ barnListe }: { barnListe: Familiemedlem[] }) => {
  return (
    <div className="menypanel__table-wrapper">
      <Table size="small">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell textSize="small">Navn</Table.HeaderCell>
            <Table.HeaderCell textSize="small">F.nr./d-nr.</Table.HeaderCell>
            <Table.HeaderCell textSize="small">Foreldreansvar</Table.HeaderCell>
            <Table.HeaderCell textSize="small">F.nr. annen forelder</Table.HeaderCell>
            <Table.HeaderCell>&nbsp;</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {barnListe.map((barn) => (
            <Table.Row key={Utils._uuid()}>
              <Table.DataCell textSize="small">{barn.navn}</Table.DataCell>
              <Table.DataCell textSize="small">
                <Ident ident={barn.ident} />
              </Table.DataCell>
              <Table.DataCell textSize="small">{StringUtils.storeForbokstaver(barn.foreldreansvar)}</Table.DataCell>
              <Table.DataCell textSize="small">{barn.fnrAnnenForelder}</Table.DataCell>
              <Table.DataCell textSize="small">
                {barn.alder && barn.alder < 18 ? <Tags.Under18Aar /> : ""}
              </Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};
