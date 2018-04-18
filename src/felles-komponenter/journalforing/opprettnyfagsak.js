import React from 'react';

import PT from 'prop-types';

import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';

import './opprettnyfagsak.css';
import LandVelger from '../skjema/landvelger';

const OpprettNyFagSak = props => {
  const { opprettNyFagsakSubmit } = props;
  return (
    <div className="opprettnysak">
      <h2>Ny Sak</h2>
      <Nav.Fieldset legend="Soknadperiode">
        <Nav.Column xs="4">
          <Skjema.Input datoFelt label="Fra" feltNavn="journalforingPeriodeFraOgMed" />
        </Nav.Column>
        <Nav.Column xs="4">
          <Skjema.Input datoFelt label="Til" feltNavn="journalforingPeriodeTilOgMed" />
        </Nav.Column>
      </Nav.Fieldset>
      <Nav.Fieldset legend="Land:">
        <Nav.Column xs="12">
          <LandVelger feltNavn="journalforingOppholdsLand" multiLand />
        </Nav.Column>
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={opprettNyFagsakSubmit}>Opprett ny sak</Nav.Knapp>
      </div>
    </div>
  );
};

OpprettNyFagSak.propTypes = {
  opprettNyFagsakSubmit: PT.func.isRequired,
};
export default OpprettNyFagSak;
