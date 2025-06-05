import { ReactNode } from "react";

import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";

interface JaNeiSvarProps {
  svar: boolean | null | undefined;
}

export function JaNeiSvar({ svar }: JaNeiSvarProps) {
  const svarString = Utils._isNil(svar) ? "-" : Utils._capitalize(Utils.streng.boolTilNorsk(Boolean(svar)));

  return (
    <Nav.BodyLong weight="semibold" size="small">
      {svarString}
    </Nav.BodyLong>
  );
}

interface LabelOgSvarProps {
  label: string;
  svar: ReactNode;
}

export function LabelOgSvar({ label, svar }: LabelOgSvarProps) {
  return (
    <Nav.Row>
      <Nav.Column xs="10">
        <Nav.BodyLong size="small">{label}</Nav.BodyLong>
      </Nav.Column>
      <Nav.Column xs="2">{svar}</Nav.Column>
    </Nav.Row>
  );
}
