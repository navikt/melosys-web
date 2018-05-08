import React from 'react';
import { connect } from 'react-redux';

import PT from 'prop-types';

import * as Skjema from '../skjema/';
import * as Nav from '../../utils/navFrontend';

import './opprettnyfagsak.css';
import LandVelger from '../skjema/landvelger';

import { KodeverkSelectors } from '../../ducks/kodeverk';

const OpprettNyFagSak = props => {
  const { opprettNyFagsakSubmit, valgbareSakstyper } = props;
  return (
    <div className="opprettnysak">
      <Nav.Systemtittel>Opprett ny sak</Nav.Systemtittel>
      <Nav.Column xs="12">
        <Skjema.ListeVelger
          feltNavn="journalforingSakstype"
          label="Sakstype:"
          placeholder="(velg eller skriv inn egen tittel)"
          muligeValg={valgbareSakstyper}
        />
      </Nav.Column>
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
      <div className="opprettnysak__knapper">
        <Nav.Knapp className="knapp" onClick={opprettNyFagsakSubmit}>Opprett ny sak</Nav.Knapp>
      </div>
    </div>
  );
};

OpprettNyFagSak.propTypes = {
  opprettNyFagsakSubmit: PT.func.isRequired,
  valgbareSakstyper: PT.array,
};

OpprettNyFagSak.defaultProps = {
  valgbareSakstyper: [],
};

const mapStateToProps = state => ({
  valgbareSakstyper: KodeverkSelectors.sakstyperSelector(state),
});

export default connect(mapStateToProps)(OpprettNyFagSak);
