import React, { ChangeEventHandler } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../utils/navFrontend";
import * as Skjema from "../../../../skjema";

import Sletterad from "../sletterad";

import MKV from "../../../../../melosyskodeverk";

import { EnRedigeringsknappListeRedigerer } from "../../editerbartElementListe";

const Redigerer = ({
  redigerbart,
  overordnetFeltNavn,
  slett,
  settVerdi,
  verdier,
}: EnRedigeringsknappListeRedigerer<KV.Form.ArbeidsstedSkip>) => {
  const fartsomradeChangeHandler: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const fartsomrade = event.target.value;

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
          <Skjema.Input
            label="Navn på skip"
            feltNavn={`${overordnetFeltNavn}.enhetNavn`}
            disabled={!redigerbart}
            bredde="fullbredde"
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Select
            feltNavn={`${overordnetFeltNavn}.fartsomradeKode`}
            label="Fartsområde"
            disabled={!redigerbart}
            onChange={fartsomradeChangeHandler}
          >
            {MKV.KTObjects.begrunnelser.fartsomrader.map((omrade: KTObject) => (
              <option key={omrade.kode} value={omrade.kode}>
                {omrade.term}
              </option>
            ))}
          </Skjema.Select>
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
};

export default Redigerer;
