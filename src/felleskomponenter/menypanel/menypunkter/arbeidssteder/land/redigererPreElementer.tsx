import React from "react";
import classNames from "classnames";

import * as Nav from "../../../../../utils/navFrontend";
import * as Skjema from "../../../../../felleskomponenter/skjema";

import { EnRedigeringsknappListeRedigererPreElementer } from "../../editerbartElementListe";

import "./redigererPreElementer.css";

const RedigererPreElementer = ({ className, redigerbart }: EnRedigeringsknappListeRedigererPreElementer) => {
  const cls = classNames(className, "arbeidsstedland__redigerer__preelementer");

  return (
    <div className={cls}>
      <Nav.typo.Element>Opplysninger om arbeidssted</Nav.typo.Element>
      <Nav.Row className="fast-arbeidssted">
        <fieldset>
          <Nav.Column xs="8">
            <legend>
              <Nav.typo.Normaltekst>Vil arbeidstakeren ha et fast arbeidssted i utlandet?</Nav.typo.Normaltekst>
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
              <Nav.typo.Normaltekst>
                Vil arbeidstakeren kun eller hovedsaklig arbeide på hjemmekontor?
              </Nav.typo.Normaltekst>
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
