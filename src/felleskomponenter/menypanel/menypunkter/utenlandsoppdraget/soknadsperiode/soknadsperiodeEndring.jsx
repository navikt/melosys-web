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

  const vedFomEndring = (nyDato) => setSoknadsperiodeFom(Utils.dateTilNorskString(nyDato));
  const vedTomEndring = (nyDato) => setSoknadsperiodeTom(Utils.dateTilNorskString(nyDato));

  return (
    <Nav.Fieldset legend="" className="soknadsperiode-endring">
      <Nav.Row>
        <Nav.Column xs="12" className="soknadsperiode-endring__datofelt-container">
          <Datovelger
            label="Fra og med:"
            value={Utils.norskStringTilDate(soknadsperiodeFom)}
            onChange={vedFomEndring}
            bredde="S"
            maxDate={Utils.norskStringTilDate(soknadsperiodeTom)}
            feil={soknadsperiodeFomErrors}
          />
          <Datovelger
            label="Til og med:"
            value={Utils.norskStringTilDate(soknadsperiodeTom)}
            onChange={vedTomEndring}
            bredde="S"
            minDate={Utils.norskStringTilDate(soknadsperiodeFom)}
            feil={soknadsperiodeTomErrors}
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
