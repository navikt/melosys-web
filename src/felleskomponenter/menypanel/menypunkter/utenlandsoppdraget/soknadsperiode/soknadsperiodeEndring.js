import React from "react";

import PT from "prop-types";

import * as Nav from "../../../../../utils/navFrontend";

import Knapperad from "../../../../knapperad";

import { FeatureToggle } from "../../../../../featuretoggle";
import Datovelger from "../../../../datovelger";
import * as Utils from "../../../../../utils/dato";

import "./soknadsperiodeEndring.css";

const SoknadsperiodeEndring = (props) => {
  const {
    soknadsperiodeFom,
    soknadsperiodeTom,
    soknadsperiodeFomErrors,
    soknadsperiodeTomErrors,
    vedFeltEndring,
    avbryt,
    lagre,
  } = props;

  const vedFomEndring = (nyDato) => vedFeltEndring("soknadsperiodeFom", Utils.dateTilNorskString(nyDato));
  const vedTomEndring = (nyDato) => vedFeltEndring("soknadsperiodeTom", Utils.dateTilNorskString(nyDato));

  const vedFomBlur = (nyDato) => vedFeltEndring("soknadsperiodeFom", Utils.vaskInputDato(nyDato) || nyDato);
  const vedTomBlur = (nyDato) => vedFeltEndring("soknadsperiodeTom", Utils.vaskInputDato(nyDato) || nyDato);

  return (
    <Nav.Fieldset legend="" className="soknadsperiode-endring">
      <Nav.Row>
        <Nav.Column xs="12" className="soknadsperiode-endring__datofelt-container">
          <FeatureToggle togglename="melosys.input.DATOFELT">
            {(status) =>
              status === "enabled" ? (
                <Datovelger
                  label="Fra og med:"
                  value={Utils.norskStringTilDate(soknadsperiodeFom)}
                  onChange={vedFomEndring}
                  bredde="S"
                  maxDate={Utils.norskStringTilDate(soknadsperiodeTom)}
                  feil={soknadsperiodeFomErrors}
                />
              ) : (
                <Nav.Input
                  bredde="S"
                  label="Fra og med:"
                  value={soknadsperiodeFom}
                  onChange={(event) => vedFeltEndring("soknadsperiodeFom", event.target.value)}
                  onBlur={(event) => event.target.value && vedFomBlur(event.target.value)}
                  feil={soknadsperiodeFomErrors && { feilmelding: soknadsperiodeFomErrors }}
                />
              )
            }
          </FeatureToggle>
          <FeatureToggle togglename="melosys.input.DATOFELT">
            {(status) =>
              status === "enabled" ? (
                <Datovelger
                  label="Til og med:"
                  value={Utils.norskStringTilDate(soknadsperiodeTom)}
                  onChange={vedTomEndring}
                  bredde="S"
                  minDate={Utils.norskStringTilDate(soknadsperiodeFom)}
                  feil={soknadsperiodeTomErrors}
                />
              ) : (
                <Nav.Input
                  bredde="S"
                  label="Til og med:"
                  value={soknadsperiodeTom}
                  onChange={(event) => vedFeltEndring("soknadsperiodeTom", event.target.value)}
                  onBlur={(event) => event.target.value && vedTomBlur(event.target.value)}
                  feil={soknadsperiodeTomErrors && { feilmelding: soknadsperiodeTomErrors }}
                />
              )
            }
          </FeatureToggle>
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
  vedFeltEndring: PT.func.isRequired,
};

SoknadsperiodeEndring.defaultProps = {
  soknadsperiodeFomErrors: undefined,
  soknadsperiodeTomErrors: undefined,
};

export default SoknadsperiodeEndring;
