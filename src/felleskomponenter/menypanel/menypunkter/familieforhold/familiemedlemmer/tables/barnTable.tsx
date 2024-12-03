import { Familiemedlem } from "../../../../../../graphql";

import Ident from "../ident";
import * as StringUtils from "../../../../../../utils/streng";
import * as Tags from "../../../../tags";
import * as Utils from "../../../../../../utils";
import * as Nav from "../../../../../../navFrontend";

export function BarnTable({ barnListe }: { barnListe: Familiemedlem[] }) {
  return (
    <div className="menypanel__table-wrapper">
      <Nav.Table size="small">
        <Nav.Table.Header>
          <Nav.Table.Row>
            <Nav.Table.HeaderCell textSize="small">Navn</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell textSize="small">F.nr./d-nr.</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell textSize="small">Foreldreansvar</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell textSize="small">F.nr. annen forelder</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell>&nbsp;</Nav.Table.HeaderCell>
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>
          {barnListe.map((barn) => (
            <Nav.Table.Row key={Utils._uuid()}>
              <Nav.Table.DataCell textSize="small">{barn.navn}</Nav.Table.DataCell>
              <Nav.Table.DataCell textSize="small">
                <Ident ident={barn.ident} />
              </Nav.Table.DataCell>
              <Nav.Table.DataCell textSize="small">
                {StringUtils.storeForbokstaver(barn.foreldreansvar)}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell textSize="small">{barn.fnrAnnenForelder}</Nav.Table.DataCell>
              <Nav.Table.DataCell textSize="small">
                {barn.alder && barn.alder < 18 ? <Tags.Under18Aar /> : ""}
              </Nav.Table.DataCell>
            </Nav.Table.Row>
          ))}
        </Nav.Table.Body>
      </Nav.Table>
    </div>
  );
}
