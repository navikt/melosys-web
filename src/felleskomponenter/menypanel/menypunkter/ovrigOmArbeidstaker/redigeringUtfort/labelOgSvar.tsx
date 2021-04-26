import React, { ReactNode } from "react";

import * as Nav from "../../../../../utils/navFrontend";
import * as Utils from "../../../../../utils";

import "./redigeringUtfort.css";

interface JaNeiSvarProps {
  svar: boolean | null | undefined;
}

export const JaNeiSvar = ({ svar }: JaNeiSvarProps) => {
  const svarString = Utils._isNil(svar) ? "-" : Utils._capitalize(Utils.streng.boolTilNorsk(svar));

  return <Nav.typo.Element>{svarString}</Nav.typo.Element>;
};

interface LabelOgSvarProps {
  label: string;
  svar: ReactNode;
}

export const LabelOgSvar = ({ label, svar }: LabelOgSvarProps) => (
  <Nav.Row>
    <Nav.Column xs="10">
      <Nav.typo.Normaltekst>{label}</Nav.typo.Normaltekst>
    </Nav.Column>
    <Nav.Column xs="2">{svar}</Nav.Column>
  </Nav.Row>
);
