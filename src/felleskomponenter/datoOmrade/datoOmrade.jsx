import { Fragment } from "react";
import * as PT from "prop-types";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";
import * as MPT from "../../proptypes";

import EnkeltDato from "../enkeltDato";

import "./datoOmrade.css";

/** Dato-område som viser fra- og til-dato.
 *
 * @param periode
 * @constructor
 */
const DatoOmrade = ({ periode, label }) => (
  <Fragment>
    {label && (
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Typo.Element>{label}</Nav.Typo.Element>
        </Nav.Column>
      </Nav.Row>
    )}
    <Nav.Row>
      <Nav.Column xs="6" className="blokk-xs">
        <Nav.Typo.Element>Fra</Nav.Typo.Element>
        <EnkeltDato dato={periode.fom} />
      </Nav.Column>
      <Nav.Column xs="6" className="blokk-xs">
        <Nav.Typo.Element>Til</Nav.Typo.Element>
        <EnkeltDato dato={periode.tom} />
      </Nav.Column>
    </Nav.Row>
  </Fragment>
);

DatoOmrade.propTypes = {
  periode: MPT.Periode.isRequired,
  label: PT.string,
};

DatoOmrade.defaultProps = {
  label: "",
};

export const DatoOmradeMedVarighet = ({ periode, label }) => {
  const varighet = Utils.dato.datoDiffMenneskelig(periode.fom, periode.tom);

  return (
    <div className="datoomradevarighet">
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Typo.Element>{label}</Nav.Typo.Element>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="4">
          <Nav.Typo.Element tag="span">Fra </Nav.Typo.Element>
          <EnkeltDato dato={periode.fom} />
        </Nav.Column>
        <Nav.Column xs="4">
          <Nav.Typo.Element tag="span">Til </Nav.Typo.Element>
          <EnkeltDato dato={periode.tom} />
        </Nav.Column>
        <Nav.Column xs="4">{varighet}</Nav.Column>
      </Nav.Row>
    </div>
  );
};

DatoOmradeMedVarighet.propTypes = {
  periode: MPT.Periode.isRequired,
  label: PT.string,
};

DatoOmradeMedVarighet.defaultProps = {
  label: "",
};

export const DatoOmradeDescription = ({ periode, label }) =>
  periode ? (
    <Fragment>
      <dt>{label}</dt>
      <dd>
        <EnkeltDato dato={periode.fom} defaultValue="" /> - <EnkeltDato dato={periode.tom} defaultValue="" />
      </dd>
    </Fragment>
  ) : null;

DatoOmradeDescription.defaultProps = {
  periode: {},
};

DatoOmradeDescription.propTypes = {
  periode: MPT.Periode,
  label: PT.string.isRequired,
};

export default DatoOmrade;
