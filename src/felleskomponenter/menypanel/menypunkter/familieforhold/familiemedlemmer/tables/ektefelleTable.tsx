import * as Utils from "../../../../../../utils";
import * as Nav from "../../../../../../navFrontend";
import { Familiemedlem } from "../../../../../../graphql";

import Ident from "../ident";

export const EktefelleTable = ({ ektefelleListe }: { ektefelleListe: Familiemedlem[] }) => {
  return (
    <div className="menypanel__table-wrapper">
      <Nav.Table>
        <Nav.Table.Header>
          <Nav.Table.Row>
            <Nav.Table.HeaderCell textSize="small">Navn</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell textSize="small">F.nr./d-nr.</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell textSize="small">Fra og med</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell textSize="small">Relasjon</Nav.Table.HeaderCell>
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>
          {ektefelleListe.map((ektefelle) => (
            <Nav.Table.Row key={Utils._uuid()}>
              <Nav.Table.DataCell textSize="small">{ektefelle.navn}</Nav.Table.DataCell>
              <Nav.Table.DataCell textSize="small">
                <Ident ident={ektefelle.ident} />
              </Nav.Table.DataCell>
              <Nav.Table.DataCell textSize="small">
                {Utils.dato.formatterDatoTilNorsk(ektefelle.sivilstand?.gyldigFraOgMed)}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell textSize="small">{ektefelle.sivilstand?.type}</Nav.Table.DataCell>
            </Nav.Table.Row>
          ))}
        </Nav.Table.Body>
      </Nav.Table>
    </div>
  );
};
