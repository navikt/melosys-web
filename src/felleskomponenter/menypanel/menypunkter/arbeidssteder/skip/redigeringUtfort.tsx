import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";

import MKV from "../../../../../melosyskodeverk";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

function RedigeringUtfort({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.ArbeidsstedSkip>) {
  return (
    <div className="arbeidssted__utland__redigeringutfort-wrapper">
      <Nav.Table>
        <Nav.Table.Header>
          <Nav.Table.Row>
            <Nav.Table.HeaderCell>Navn på skip</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell>Yrke</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell>Fartsområde</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell>Flaggstat/lands territorialfarvann</Nav.Table.HeaderCell>
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>
          {verdier.map((arbeidsstedSkip) => (
            <Nav.Table.Row key={arbeidsstedSkip.enhetNavn}>
              <Nav.Table.DataCell>{arbeidsstedSkip.enhetNavn}</Nav.Table.DataCell>
              <Nav.Table.DataCell>{arbeidsstedSkip.yrke}</Nav.Table.DataCell>
              <Nav.Table.DataCell>
                {KV.kodeTilTerm(arbeidsstedSkip.fartsomradeKode, MKV.KTObjects.begrunnelser.fartsomrader)}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell>
                {KV.kodeTilTerm(
                  arbeidsstedSkip.flaggLandkode ?? arbeidsstedSkip.territorialfarvann,
                  MKV.KTObjects.landkoder,
                )}
              </Nav.Table.DataCell>
            </Nav.Table.Row>
          ))}
        </Nav.Table.Body>
      </Nav.Table>
    </div>
  );
}

export default RedigeringUtfort;
