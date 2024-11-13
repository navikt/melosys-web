import { Fragment } from "react";

import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";

import { StrukturertAdresse } from "../../../../adresser";

import { EnRedigeringsknappListeRedigeringUtfort } from "../../editerbartElementListe";

import "./redigeringUtfort.css";

const RedigeringUtfort = ({ verdier }: EnRedigeringsknappListeRedigeringUtfort<KV.Form.FysiskArbeidssted>) => (
  <div className="arbeidssted__utland__redigeringutfort">
    {verdier.map((element, index) => (
      /* eslint-disable-next-line react/no-array-index-key */
      <Fragment key={index}>
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Typo.Element>Navn på virksomhet</Nav.Typo.Element>
            <Nav.BodyLong size="small">{element.virksomhetNavn}</Nav.BodyLong>
          </Nav.Column>
        </Nav.Row>
        <StrukturertAdresse adresse={element.adresse} />
      </Fragment>
    ))}
  </div>
);

export default RedigeringUtfort;
