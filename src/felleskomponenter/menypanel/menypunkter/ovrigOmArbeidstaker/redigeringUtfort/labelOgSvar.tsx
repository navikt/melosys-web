import React, { ReactNode } from "react";

import * as Nav from "../../../../../utils/navFrontend";
import * as Utils from "../../../../../utils";

interface JaNeiSvarProps {
  svar: boolean | null | undefined;
}

export const JaNeiSvar = ({ svar }: JaNeiSvarProps) => {
  const svarString = Utils._isNil(svar) ? "-" : Utils._capitalize(Utils.streng.boolTilNorsk(svar));

  return <Nav.Typo.Element>{svarString}</Nav.Typo.Element>;
};

interface LabelOgSvarProps {
  label: string;
  svar: ReactNode;
}

export const LabelOgSvar = ({ label, svar }: LabelOgSvarProps) => (
  <Nav.Row>
    <Nav.Column xs="10">
      <Nav.Typo.Normaltekst>{label}</Nav.Typo.Normaltekst>
    </Nav.Column>
    <Nav.Column xs="2">{svar}</Nav.Column>
  </Nav.Row>
);
