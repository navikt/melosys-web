import * as Nav from "../../../../../navFrontend";

import "./labelOgEditerbartSvar.css";
import * as Skjema from "../../../../skjema";

interface LabelOgEditerbartSvarProps {
  label: string;
  feltNavn: string;
}

const LabelOgEditerbartSvar = ({ label, feltNavn }: LabelOgEditerbartSvarProps) => (
  <Nav.Row className="ovrig-om-arbeidstaker__label-og-editerbart-svar">
    <Skjema.RadioGroup legend={label} hideLegend name={feltNavn}>
      <Nav.Radio value>Ja</Nav.Radio>
      <Nav.Radio value={false}>Nei</Nav.Radio>
    </Skjema.RadioGroup>
  </Nav.Row>
);

export default LabelOgEditerbartSvar;
