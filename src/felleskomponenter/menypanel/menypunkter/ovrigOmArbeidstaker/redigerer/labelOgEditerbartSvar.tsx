import { ReactNode } from "react";

import * as Nav from "../../../../../navFrontend";
import * as Skjema from "../../../../skjema";

import "./labelOgEditerbartSvar.css";

interface RadioknappSvarProps {
  feltNavn: string;
}

export const RadioknappSvar = ({ feltNavn }: RadioknappSvarProps) => (
  <>
    <Skjema.Radio label="Ja" feltNavn={feltNavn} value />
    <Skjema.Radio label="Nei" feltNavn={feltNavn} value={false} />
  </>
);

interface LabelOgEditerbartSvarProps {
  label: string;
  svar: ReactNode;
}

const LabelOgEditerbartSvar = ({ label, svar }: LabelOgEditerbartSvarProps) => (
  <Nav.Row className="ovrig-om-arbeidstaker__label-og-editerbart-svar">
    <fieldset>
      <Nav.Column xs="8">
        <legend>
          <Nav.Typo.Normaltekst>{label}</Nav.Typo.Normaltekst>
        </legend>
      </Nav.Column>
      <Nav.Column xs="4" className="col">
        {svar}
      </Nav.Column>
    </fieldset>
  </Nav.Row>
);

export default LabelOgEditerbartSvar;
