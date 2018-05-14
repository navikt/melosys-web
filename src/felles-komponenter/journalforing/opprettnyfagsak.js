import React from 'react';

import PT from 'prop-types';

import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';

import './opprettnyfagsak.css';
import LandVelger from '../skjema/landvelger';

const OpprettNyFagSak = props => {
  const { opprettFagsak } = props;
  return (
    <div className="opprettnysak">
      <Nav.Systemtittel>Opprett ny sak</Nav.Systemtittel>
      <Nav.Fieldset legend="Soknadperiode:" className="opprettnysak__soknadsperiode">
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.Input datoFelt label="Fra" feltNavn="journalforingPeriodeFraOgMed" />
          </Nav.Column>
          <Nav.Column xs="6">
            <Skjema.Input datoFelt label="Til" feltNavn="journalforingPeriodeTilOgMed" />
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
      <Nav.Fieldset legend="Land:">
        <Nav.Row>
          <Nav.Column xs="12">
            <LandVelger feltNavn="journalforingOppholdsLand" multiLand />
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
      <div className="opprettnysak__knapper">
        <Nav.Knapp className="knapp" onClick={opprettFagsak}>Opprett ny sak</Nav.Knapp>
      </div>
    </div>
  );
};

OpprettNyFagSak.propTypes = {
  opprettFagsak: PT.func.isRequired,
};

export default OpprettNyFagSak;
