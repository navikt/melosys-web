import { Fragment } from "react";

import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";

import { StrukturertAdresse } from "../../../../adresser";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

import "./redigeringUtfort.less";

function RedigeringUtfort({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.FysiskArbeidssted>) {
  return (
    <div className="arbeidssted__utland__redigeringutfort">
      {verdier.map((element, index) => (
        <Fragment key={index}>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.BodyLong weight="semibold" size="small">
                Navn på virksomhet
              </Nav.BodyLong>
              <Nav.BodyLong size="small">{element.virksomhetNavn}</Nav.BodyLong>
            </Nav.Column>
          </Nav.Row>
          <StrukturertAdresse adresse={element.adresse} />
        </Fragment>
      ))}
    </div>
  );
}

export default RedigeringUtfort;
