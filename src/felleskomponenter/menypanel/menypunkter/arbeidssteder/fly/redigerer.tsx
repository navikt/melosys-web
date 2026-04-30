import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Skjema from "../../../../skjema";

import Sletterad from "../sletterad";

import { EnRedigeringsknappListeRedigerer } from "../../editerbartElementListe";

function Redigerer({
  redigerbart,
  overordnetFeltNavn,
  slett,
  verdier,
}: EnRedigeringsknappListeRedigerer<KV.Form.ArbeidsstedFly>) {
  return (
    <div>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input
            label="Navn på hjemmebase"
            feltNavn={`${overordnetFeltNavn}.hjemmebaseNavn`}
            disabled={!redigerbart}
          />
        </Nav.Column>
        <Nav.Column xs="6">
          <Skjema.LandVelger
            label="Hjemmebasens land"
            feltNavn={`${overordnetFeltNavn}.hjemmebaseLand`}
            disabled={!redigerbart}
            bredde="fullbredde"
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Skjema.RadioGroup
            legend="Er dette hjemmebasen arbeidstakeren jobber fra til vanlig?"
            name={`${overordnetFeltNavn}.erVanligHjemmebase`}
            readOnly={!redigerbart}
          >
            <Nav.Radio value>Ja</Nav.Radio>
            <Nav.Radio value={false}>Nei</Nav.Radio>
          </Skjema.RadioGroup>
        </Nav.Column>
      </Nav.Row>
      {verdier?.erVanligHjemmebase === false && (
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.Input
              label="Vanlig hjemmebase — navn"
              feltNavn={`${overordnetFeltNavn}.vanligHjemmebaseNavn`}
              disabled={!redigerbart}
            />
          </Nav.Column>
          <Nav.Column xs="6">
            <Skjema.LandVelger
              label="Vanlig hjemmebase — land"
              feltNavn={`${overordnetFeltNavn}.vanligHjemmebaseLand`}
              disabled={!redigerbart}
              bredde="fullbredde"
            />
          </Nav.Column>
        </Nav.Row>
      )}
      <Sletterad onClick={slett} />
    </div>
  );
}

export default Redigerer;
