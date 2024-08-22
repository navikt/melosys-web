import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";
import MKV from "../../../../../melosyskodeverk";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

const RedigeringUtfort = ({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.ArbeidsstedOffshore>) => (
  <div className="arbeidssted__offshore__redigeringutfort-wrapper">
    <Nav.Table>
      <Nav.Table.Header>
        <Nav.Table.Row>
          <Nav.Table.HeaderCell>Navn på innretning</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell>Type innretning</Nav.Table.HeaderCell>
          <Nav.Table.HeaderCell>Lands sokkel</Nav.Table.HeaderCell>
        </Nav.Table.Row>
      </Nav.Table.Header>
      <Nav.Table.Body>
        {verdier.map((arbeidsstedOffshore) => (
          <Nav.Table.Row key={arbeidsstedOffshore.enhetNavn}>
            <Nav.Table.DataCell>{arbeidsstedOffshore.enhetNavn}</Nav.Table.DataCell>
            <Nav.Table.DataCell>
              {KV.kodeTilTerm(arbeidsstedOffshore.innretningstype, MKV.KTObjects.innretningstyper)}
            </Nav.Table.DataCell>
            <Nav.Table.DataCell>
              {KV.kodeTilTerm(arbeidsstedOffshore.innretningLandkode, MKV.KTObjects.landkoder)}
            </Nav.Table.DataCell>
          </Nav.Table.Row>
        ))}
      </Nav.Table.Body>
    </Nav.Table>
  </div>
);

export default RedigeringUtfort;
