import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";

import MKV from "../../../../../melosyskodeverk";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

function RedigeringUtfort({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.ArbeidsstedFly>) {
  return (
    <div className="arbeidssted__fly__redigeringutfort-wrapper">
      <Nav.Table>
        <Nav.Table.Header>
          <Nav.Table.Row>
            <Nav.Table.HeaderCell>Navn på hjemmebase</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell>Hjemmebasens land</Nav.Table.HeaderCell>
            <Nav.Table.HeaderCell>Vanlig hjemmebase</Nav.Table.HeaderCell>
          </Nav.Table.Row>
        </Nav.Table.Header>
        <Nav.Table.Body>
          {verdier.map((arbeidsstedFly) => (
            <Nav.Table.Row key={arbeidsstedFly.hjemmebaseNavn}>
              <Nav.Table.DataCell>{arbeidsstedFly.hjemmebaseNavn}</Nav.Table.DataCell>
              <Nav.Table.DataCell>
                {KV.kodeTilTerm(arbeidsstedFly.hjemmebaseLand, MKV.KTObjects.landkoder)}
              </Nav.Table.DataCell>
              <Nav.Table.DataCell>{formaterVanligHjemmebase(arbeidsstedFly)}</Nav.Table.DataCell>
            </Nav.Table.Row>
          ))}
        </Nav.Table.Body>
      </Nav.Table>
    </div>
  );
}

function formaterVanligHjemmebase(fly: KV.Form.ArbeidsstedFly): string {
  if (fly.erVanligHjemmebase == null) return "";
  if (fly.erVanligHjemmebase) return "Ja";
  const land = fly.vanligHjemmebaseLand ? KV.kodeTilTerm(fly.vanligHjemmebaseLand, MKV.KTObjects.landkoder) : "";
  const navn = fly.vanligHjemmebaseNavn ?? "";
  return ["Nei", navn, land].filter(Boolean).join(" — ");
}

export default RedigeringUtfort;
