import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import * as Nav from "../../../../../navFrontend";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

const RedigeringUtfort = ({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.MedfolgendeFamilie>) => (
  <div className="menypanel__table-wrapper">
    <Nav.Table className="menypanel__table" size="small">
      <Nav.Table.Header>
        <Nav.Table.Row>
          <Nav.Table.HeaderCell textSize="small">Navn</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell textSize="small">F.dato/f.nr./d-nr.</Nav.Table.HeaderCell>
        </Nav.Table.Row>
      </Nav.Table.Header>
      <Nav.Table.Body>
        {verdier.map((familiemedlem) => (
          <Nav.Table.Row key={Utils._uuid()}>
            <Nav.Table.DataCell textSize="small">{familiemedlem.navn}</Nav.Table.DataCell>
            <Nav.Table.DataCell textSize="small">{familiemedlem.fnr}</Nav.Table.DataCell>
          </Nav.Table.Row>
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  </div>
);

export default RedigeringUtfort;
