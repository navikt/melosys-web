import { KTObject } from "@navikt/melosys-kodeverk";

import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Skjema from "../../../../skjema";

import MKV from "../../../../../melosyskodeverk";

import Sletterad from "../sletterad";

import { EnRedigeringsknappListeRedigerer } from "../../editerbartElementListe";

function Redigerer({
  redigerbart,
  overordnetFeltNavn,
  slett,
}: EnRedigeringsknappListeRedigerer<KV.Form.ArbeidsstedOffshore>) {
  return (
    <div>
      <Nav.Row>
        <Nav.Column xs="7">
          <Skjema.Input
            label="Navn på innretning"
            feltNavn={`${overordnetFeltNavn}.enhetNavn`}
            disabled={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          <Skjema.RadioGroup
            legend="Type innretning"
            name={`${overordnetFeltNavn}.innretningstype`}
            readOnly={!redigerbart}
          >
            {MKV.KTObjects.innretningstyper.map((type: KTObject) => (
              <Nav.Radio key={type.kode} value={type.kode}>
                {type.term}
              </Nav.Radio>
            ))}
          </Skjema.RadioGroup>
        </Nav.Column>
        <Nav.Column xs="5">
          <Skjema.LandVelger
            label="Lands sokkel"
            feltNavn={`${overordnetFeltNavn}.innretningLandkode`}
            disabled={!redigerbart}
            bredde="fullbredde"
          />
        </Nav.Column>
      </Nav.Row>
      <Sletterad onClick={slett} />
    </div>
  );
}

export default Redigerer;
