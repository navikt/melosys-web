import * as Nav from "../../../../../navFrontend";

import "./labelOgEditerbartSvar.less";
import * as Skjema from "../../../../skjema";

interface LabelOgEditerbartSvarProps {
  label: string;
  feltNavn: string;
}

function LabelOgEditerbartSvar({ label, feltNavn }: LabelOgEditerbartSvarProps) {
  return (
    <Nav.Row className="ovrig-om-arbeidstaker__label-og-editerbart-svar">
      <Skjema.RadioGroup legend={label} name={feltNavn}>
        <Nav.Radio value>Ja</Nav.Radio>
        <Nav.Radio value={false}>Nei</Nav.Radio>
      </Skjema.RadioGroup>
    </Nav.Row>
  );
}

export default LabelOgEditerbartSvar;
