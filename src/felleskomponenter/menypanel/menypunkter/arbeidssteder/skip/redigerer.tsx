import { KTObject } from "@navikt/melosys-kodeverk";

import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Skjema from "../../../../skjema";

import Sletterad from "../sletterad";

import MKV from "../../../../../melosyskodeverk";

import { EnRedigeringsknappListeRedigerer } from "../../editerbartElementListe";

function Redigerer({
  redigerbart,
  overordnetFeltNavn,
  slett,
  settVerdi,
  verdier,
}: EnRedigeringsknappListeRedigerer<KV.Form.ArbeidsstedSkip>) {
  const fartsomradeChangeHandler = (fartsomrade: unknown) => {
    if (fartsomrade === MKV.Koder.begrunnelser.fartsomrader.INNENRIKS) {
      settVerdi("flaggLandkode", null);
    } else if (fartsomrade === MKV.Koder.begrunnelser.fartsomrader.UTENRIKS) {
      settVerdi("territorialfarvann", null);
    }
  };

  return (
    <div>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input label="Navn på skip" feltNavn={`${overordnetFeltNavn}.enhetNavn`} disabled={!redigerbart} />
        </Nav.Column>
        <Nav.Column xs="6">
          <Skjema.Input label="Yrke" feltNavn={`${overordnetFeltNavn}.yrke`} disabled={!redigerbart} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.RadioGroup
            legend="Fartsområde"
            name={`${overordnetFeltNavn}.fartsomradeKode`}
            readOnly={!redigerbart}
            onChange={fartsomradeChangeHandler}
          >
            {MKV.KTObjects.begrunnelser.fartsomrader.map((omrade: KTObject) => (
              <Nav.Radio key={omrade.kode} value={omrade.kode}>
                {omrade.term}
              </Nav.Radio>
            ))}
          </Skjema.RadioGroup>
        </Nav.Column>
        <Nav.Column xs="6">
          {verdier && verdier.fartsomradeKode === MKV.Koder.begrunnelser.fartsomrader.INNENRIKS && (
            <Skjema.LandVelger
              feltNavn={`${overordnetFeltNavn}.territorialfarvann`}
              label="Lands territorialfarvann"
              disabled={!redigerbart}
              bredde="fullbredde"
            />
          )}
          {verdier && verdier.fartsomradeKode === MKV.Koder.begrunnelser.fartsomrader.UTENRIKS && (
            <Skjema.LandVelger
              feltNavn={`${overordnetFeltNavn}.flaggLandkode`}
              label="Flaggstat"
              disabled={!redigerbart}
              bredde="fullbredde"
            />
          )}
        </Nav.Column>
      </Nav.Row>
      <Sletterad onClick={slett} />
    </div>
  );
}

export default Redigerer;
