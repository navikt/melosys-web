import React from 'react';

import PT from 'prop-types';

import * as Nav from '../../../../../utils/navFrontend';

import './soknadsperiode.css';

const SoknadsperiodeEndring = props => {
  const {
    soknadsperiodeNyFom,
    soknadsperiodeNyTom,
    vedFeltEndring,
    avbryt,
    oppdaterPeriode,
    vedFeltFokusUt,
    erDatoerGyldig,
  } = props;

  return (
    <Nav.Row>
      <Nav.Column xs="12">
        <Nav.Fieldset legend="Skriv inn korrigert søknadsperiode:">
          <Nav.Row>
            <Nav.Column xs="3">
              <Nav.Input
                bredde="S"
                label="Fra og med:"
                value={soknadsperiodeNyFom}
                onChange={event => vedFeltEndring('soknadsperiodeNyFom', event.target.value)}
                onBlur={() => vedFeltFokusUt('soknadsperiodeNyFom')}
              />
            </Nav.Column>
            <Nav.Column xs="3">
              <Nav.Input
                bredde="S"
                label="Til og med:"
                value={soknadsperiodeNyTom}
                onChange={event => vedFeltEndring('soknadsperiodeNyTom', event.target.value)}
                onBlur={() => vedFeltFokusUt('soknadsperiodeNyTom')}
              />
            </Nav.Column>
            <Nav.Column xs="12">
              <Nav.Hovedknapp disabled={!erDatoerGyldig} onClick={oppdaterPeriode}>Oppdater registeropplysningene</Nav.Hovedknapp>
              <Nav.Knapp onClick={avbryt}>Avbryt</Nav.Knapp>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
      </Nav.Column>
    </Nav.Row>
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
