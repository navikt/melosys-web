import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";

import MKV from "../../../../../melosyskodeverk";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

const RedigeringUtfort = ({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.ArbeidsstedFly>) => (
  <div className="arbeidssted__fly__redigeringutfort-wrapper">
    <Nav.Table>
      <Nav.Table.Header>
        <Nav.Table.Row>
          <Nav.Table.HeaderCell>Navn på hjemmebase</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell>Type flyvninger</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell>Hjemmebasens land</Nav.Table.HeaderCell>
        </Nav.Table.Row>
      </Nav.Table.Header>
      <Nav.Table.Body>
        {verdier.map((arbeidsstedFly) => (
          <Nav.Table.Row key={arbeidsstedFly.hjemmebaseNavn}>
            <Nav.Table.DataCell>{arbeidsstedFly.hjemmebaseNavn}</Nav.Table.DataCell>
            <Nav.Table.DataCell>
              {KV.kodeTilTerm(arbeidsstedFly.typeFlyvninger, MKV.KTObjects.flyvningstyper)}
            </Nav.Table.DataCell>
            <Nav.Table.DataCell>
              {KV.kodeTilTerm(arbeidsstedFly.hjemmebaseLand, MKV.KTObjects.landkoder)}
            </Nav.Table.DataCell>
          </Nav.Table.Row>
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  </div>
);

export default RedigeringUtfort;
