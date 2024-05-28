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
      <Nav.Row className="radiogroup__rad">
        <Skjema.RadioGroup
          legend="Vil arbeidstakeren ha et fast arbeidssted i utlandet?"
          name="arbeidPaaLand.erFastArbeidssted"
          disabled={!redigerbart}
        >
          <Nav.Radio value>Ja</Nav.Radio>
          <Nav.Radio value={false}>Nei</Nav.Radio>
        </Skjema.RadioGroup>
      </Nav.Row>
      <Nav.Row className="radiogroup__rad">
        <Skjema.RadioGroup
          legend="Vil arbeidstakeren kun eller hovedsaklig arbeide på hjemmekontor?"
          name="arbeidPaaLand.erHjemmekontor"
          disabled={!redigerbart}
        >
          <Nav.Radio value>Ja</Nav.Radio>
          <Nav.Radio value={false}>Nei</Nav.Radio>
        </Skjema.RadioGroup>
      </Nav.Row>
    </div>
  );
};

export default RedigererPreElementer;
