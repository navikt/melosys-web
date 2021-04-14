import React from "react";

import PT from "prop-types";

import * as Nav from "../../../../../utils/navFrontend";

import Knapperad from "../../../../knapperad";

import "./soknadsperiode.css";
import { FeatureToggle } from "../../../../../featuretoggle";
import Datovelger from "../../../../datovelger/datovelger";
import { norskStringTilDate } from "../../../../../utils/dato";

const SoknadsperiodeEndring = (props) => {
  const {
    soknadsperiodeNyFom,
    soknadsperiodeNyTom,
    vedFeltEndring,
    avbryt,
    oppdaterPeriode,
    vedFeltFokusUt,
    erDatoerGyldig,
  } = props;

  const vedFomEndring = (nyDato) => vedFeltEndring("soknadsperiodeNyFom", nyDato?.toLocaleDateString());
  const vedTomEndring = (nyDato) => vedFeltEndring("soknadsperiodeNyTom", nyDato?.toLocaleDateString());
  const vedFomFokusUt = () => vedFeltFokusUt("soknadsperiodeNyFom");
  const vedTomFokusUt = () => vedFeltFokusUt("soknadsperiodeNyTom");

  return (
    <Nav.Fieldset legend="">
      <Nav.Row>
        <Nav.Column xs="6">
          <FeatureToggle togglename="melosys.input.DATOFELT">
            {(status) =>
              status === "enabled" ? (
                <Datovelger
                  label="Fra og med:"
                  value={norskStringTilDate(soknadsperiodeNyFom)}
                  onChange={vedFomEndring}
                  onBlur={vedFomFokusUt}
                  bredde="S"
                />
              ) : (
                <Nav.Input
                  bredde="S"
                  label="Fra og med:"
                  value={soknadsperiodeNyFom}
                  onChange={(event) => vedFeltEndring("soknadsperiodeNyFom", event.target.value)}
                  onBlur={() => vedFeltFokusUt("soknadsperiodeNyFom")}
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
                  value={norskStringTilDate(soknadsperiodeNyTom)}
                  onChange={vedTomEndring}
                  onBlur={vedTomFokusUt}
                  bredde="S"
                />
              ) : (
                <Nav.Input
                  bredde="S"
                  label="Til og med:"
                  value={soknadsperiodeNyTom}
                  onChange={(event) => vedFeltEndring("soknadsperiodeNyTom", event.target.value)}
                  onBlur={() => vedFeltFokusUt("soknadsperiodeNyTom")}
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
            bekreft={oppdaterPeriode}
            bekreftTekst="Lagre"
            redigerbart
            bekreftRedigerbart={erDatoerGyldig}
          />
        </Nav.Column>
      </Nav.Row>
    </Nav.Fieldset>
  );
};

SoknadsperiodeEndring.propTypes = {
  avbryt: PT.func.isRequired,
  oppdaterPeriode: PT.func.isRequired,
  soknadsperiodeNyFom: PT.string.isRequired,
  soknadsperiodeNyTom: PT.string.isRequired,
  vedFeltEndring: PT.func.isRequired,
  vedFeltFokusUt: PT.func.isRequired,
  erDatoerGyldig: PT.bool.isRequired,
};

export default SoknadsperiodeEndring;
