import React from "react";
import classNames from "classnames";

import * as Nav from "../../../../../navFrontend";
import * as Skjema from "../../../../skjema";

import { EnRedigeringsknappListeRedigererPreElementer } from "../../editerbartElementListe";

import "./redigererPreElementer.css";

const RedigererPreElementer = ({ className, redigerbart }: EnRedigeringsknappListeRedigererPreElementer) => {
  const cls = classNames(className, "arbeidsstedland__redigerer__preelementer");

  return (
    <div className={cls}>
      <Nav.Typo.Element>Opplysninger om arbeidssted</Nav.Typo.Element>
      <Nav.Row className="fast-arbeidssted">
        <fieldset>
          <Nav.Column xs="8">
            <legend>
              <Nav.Typo.Normaltekst>Vil arbeidstakeren ha et fast arbeidssted i utlandet?</Nav.Typo.Normaltekst>
            </legend>
          </Nav.Column>
          <Nav.Column xs="4" className="col">
            <Skjema.Radio disabled={!redigerbart} label="Ja" feltNavn="arbeidPaaLand.erFastArbeidssted" value />
            <Skjema.Radio
              disabled={!redigerbart}
              label="Nei"
              feltNavn="arbeidPaaLand.erFastArbeidssted"
              value={false}
            />
          </Nav.Column>
        </fieldset>
      </Nav.Row>
      <Nav.Row>
        <fieldset>
          <Nav.Column xs="8">
            <legend>
              <Nav.Typo.Normaltekst>
                Vil arbeidstakeren kun eller hovedsaklig arbeide på hjemmekontor?
              </Nav.Typo.Normaltekst>
            </legend>
          </Nav.Column>
          <Nav.Column xs="4" className="col">
            <Skjema.Radio disabled={!redigerbart} label="Ja" feltNavn="arbeidPaaLand.erHjemmekontor" value />
            <Skjema.Radio disabled={!redigerbart} label="Nei" feltNavn="arbeidPaaLand.erHjemmekontor" value={false} />
          </Nav.Column>
        </fieldset>
      </Nav.Row>
    </div>
  );
};

export default RedigererPreElementer;
