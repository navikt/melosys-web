import classNames from "classnames";

import * as Nav from "../../../../../navFrontend";
import * as Skjema from "../../../../skjema";

import { EnRedigeringsknappListeRedigererPreElementer } from "../../editerbartElementListe";

import "./redigererPreElementer.less";

function RedigererPreElementer({ className, redigerbart }: EnRedigeringsknappListeRedigererPreElementer) {
  const cls = classNames(className, "arbeidsstedland__redigerer__preelementer");

  return (
    <div className={cls}>
      <Nav.BodyLong weight="semibold" size="small">
        Opplysninger om arbeidssted
      </Nav.BodyLong>
      <Nav.Row className="radiogroup__rad">
        <Skjema.RadioGroup
          legend="Vil arbeidstakeren ha et fast arbeidssted i utlandet?"
          name="arbeidPaaLand.erFastArbeidssted"
          readOnly={!redigerbart}
        >
          <Nav.Radio value>Ja</Nav.Radio>
          <Nav.Radio value={false}>Nei</Nav.Radio>
        </Skjema.RadioGroup>
      </Nav.Row>
      <Nav.Row className="radiogroup__rad">
        <Skjema.RadioGroup
          legend="Vil arbeidstakeren kun eller hovedsaklig arbeide på hjemmekontor?"
          name="arbeidPaaLand.erHjemmekontor"
          readOnly={!redigerbart}
        >
          <Nav.Radio value>Ja</Nav.Radio>
          <Nav.Radio value={false}>Nei</Nav.Radio>
        </Skjema.RadioGroup>
      </Nav.Row>
    </div>
  );
}

export default RedigererPreElementer;
