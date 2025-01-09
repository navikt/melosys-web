import * as Nav from "../../../../../navFrontend";

import { FoedestedOgLand } from "./types";

interface UtfyltFoedestedProps {
  foedestedOgLand: FoedestedOgLand;
}

function Utfyltfoedestedogland({ foedestedOgLand }: UtfyltFoedestedProps) {
  return (
    <>
      <Nav.Row>
        <Nav.Column xs="6">
          <Nav.BodyLong size="small">Fødested</Nav.BodyLong>
        </Nav.Column>
        <Nav.Column xs="6">
          <Nav.BodyLong size="small">Fødeland</Nav.BodyLong>
        </Nav.Column>
      </Nav.Row>
      {foedestedOgLand && (
        <Nav.Row>
          <Nav.Column xs="6">
            <Nav.BodyLong weight="semibold" size="small">
              {foedestedOgLand.foedested}
            </Nav.BodyLong>
          </Nav.Column>
          <Nav.Column xs="6">
            <Nav.BodyLong weight="semibold" size="small">
              {foedestedOgLand.foedeland}
            </Nav.BodyLong>
          </Nav.Column>
        </Nav.Row>
      )}
    </>
  );
}

export default Utfyltfoedestedogland;
