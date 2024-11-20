import { Fragment } from "react";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import EnkeltDato from "../enkeltDato";

import "./datoOmrade.css";

interface DatoOmradeProps {
  periode: {
    fom?: string | null;
    tom?: string | null;
  };
  label?: string;
}

const DatoOmrade = ({ periode, label = "" }: DatoOmradeProps) => (
  <Fragment>
    {label && (
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.BodyLong weight="semibold" size="small">
            {label}
          </Nav.BodyLong>
        </Nav.Column>
      </Nav.Row>
    )}
    <Nav.Row>
      <Nav.Column xs="6" className="blokk-xs">
        <Nav.BodyLong weight="semibold" size="small">
          Fra
        </Nav.BodyLong>
        <EnkeltDato dato={periode.fom} />
      </Nav.Column>
      <Nav.Column xs="6" className="blokk-xs">
        <Nav.BodyLong weight="semibold" size="small">
          Til
        </Nav.BodyLong>
        <EnkeltDato dato={periode.tom} />
      </Nav.Column>
    </Nav.Row>
  </Fragment>
);

export const DatoOmradeMedVarighet = ({ periode, label = "" }: DatoOmradeProps) => {
  const varighet = Utils.dato.datoDiffMenneskelig(periode.fom, periode.tom);

  return (
    <div className="datoomradevarighet">
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.BodyLong weight="semibold" size="small">
            {label}
          </Nav.BodyLong>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="4">
          <Nav.BodyLong weight="semibold" size="small">
            Fra{" "}
          </Nav.BodyLong>
          <EnkeltDato dato={periode.fom} />
        </Nav.Column>
        <Nav.Column xs="4">
          <Nav.BodyLong weight="semibold" size="small">
            Til{" "}
          </Nav.BodyLong>
          <EnkeltDato dato={periode.tom} />
        </Nav.Column>
        <Nav.Column xs="4">{varighet}</Nav.Column>
      </Nav.Row>
    </div>
  );
};

export const DatoOmradeDescription = ({ periode, label = "" }: DatoOmradeProps) =>
  periode ? (
    <Fragment>
      <dt>{label}</dt>
      <dd>
        <EnkeltDato dato={periode.fom} defaultValue="" /> - <EnkeltDato dato={periode.tom} defaultValue="" />
      </dd>
    </Fragment>
  ) : null;

export default DatoOmrade;
