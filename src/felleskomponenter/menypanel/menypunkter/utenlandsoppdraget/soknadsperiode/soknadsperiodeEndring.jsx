import PT from "prop-types";

import * as Nav from "../../../../../navFrontend";

import Knapperad from "../../../../knapperad";

import Datovelger from "../../../../datovelger";
import * as Utils from "../../../../../utils/dato";

import "./soknadsperiodeEndring.css";

const SoknadsperiodeEndring = (props) => {
  const {
    soknadsperiodeFom,
    soknadsperiodeTom,
    soknadsperiodeFomErrors,
    soknadsperiodeTomErrors,
    setSoknadsperiodeFom,
    setSoknadsperiodeTom,
    avbryt,
    lagre,
  } = props;

  return (
    <Nav.Fieldset legend="" className="soknadsperiode-endring">
      <Nav.Row>
        <Nav.Column xs="12" className="soknadsperiode-endring__datofelt-container">
          <Datovelger
            label="Fra og med"
            value={Utils.norskStringTilDate(soknadsperiodeFom)}
            onChange={setSoknadsperiodeFom}
            bredde="S"
            feil={soknadsperiodeFomErrors}
            brukInternValidering
          />
          <Datovelger
            label="Til og med"
            value={Utils.norskStringTilDate(soknadsperiodeTom)}
            onChange={setSoknadsperiodeTom}
            bredde="S"
            minDate={Utils.norskStringTilDate(soknadsperiodeFom)}
            feil={soknadsperiodeTomErrors}
            brukInternValidering
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Knapperad
            capitalCase
            avbryt={avbryt}
            avbrytTekst="Avbryt"
            bekreft={lagre}
            bekreftTekst="Lagre"
            redigerbart
            bekreftRedigerbart={!soknadsperiodeTomErrors && !soknadsperiodeFomErrors}
          />
        </Nav.Column>
      </Nav.Row>
    </Nav.Fieldset>
  );
};

SoknadsperiodeEndring.propTypes = {
  avbryt: PT.func.isRequired,
  lagre: PT.func.isRequired,
  soknadsperiodeFom: PT.string.isRequired,
  soknadsperiodeTom: PT.string.isRequired,
  soknadsperiodeFomErrors: PT.string,
  soknadsperiodeTomErrors: PT.string,
  setSoknadsperiodeFom: PT.func.isRequired,
  setSoknadsperiodeTom: PT.func.isRequired,
};

SoknadsperiodeEndring.defaultProps = {
  soknadsperiodeFomErrors: undefined,
  soknadsperiodeTomErrors: undefined,
};

export default SoknadsperiodeEndring;
