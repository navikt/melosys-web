import React, { useState } from "react";

import PT from "prop-types";

import * as Nav from "../../../../../utils/navFrontend";

import Knapperad from "../../../../knapperad";

import "./soknadsperiode.css";
import { FeatureToggle } from "../../../../../featuretoggle";
import Datovelger from "../../../../datovelger";
import * as Utils from "../../../../../utils/dato";

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

  const [fomHarFokus, setFomHarFokus] = useState(false);
  const [tomHarFokus, setTomHarFokus] = useState(false);

  const vedFomEndring = (nyDato) => vedFeltEndring("soknadsperiodeFom", Utils.dateTilNorskString(nyDato));
  const vedTomEndring = (nyDato) => vedFeltEndring("soknadsperiodeTom", Utils.dateTilNorskString(nyDato));

  const vedFomFokus = () => {
    setFomHarFokus(true);
  };
  const vedTomFokus = () => {
    setTomHarFokus(true);
  };

  const vedFomBlur = (nyDato) => {
    setFomHarFokus(false);
    vedFeltEndring("soknadsperiodeFom", Utils.vaskInputDato(nyDato) || nyDato);
  };
  const vedTomBlur = (nyDato) => {
    setTomHarFokus(false);
    vedFeltEndring("soknadsperiodeTom", Utils.vaskInputDato(nyDato) || nyDato);
  };

  const fomFeil = !fomHarFokus && soknadsperiodeFomErrors ? { feilmelding: soknadsperiodeFomErrors } : undefined;
  const tomFeil = !tomHarFokus && soknadsperiodeTomErrors ? { feilmelding: soknadsperiodeTomErrors } : undefined;

  return (
    <Nav.Fieldset legend="">
      <Nav.Row>
        <Nav.Column xs="6">
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
                  onFocus={vedFomFokus}
                  feil={fomFeil}
                />
              )
            }
          </FeatureToggle>
        </Nav.Column>
        <Nav.Column xs="6">
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
                  onFocus={vedTomFokus}
                  feil={tomFeil}
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
