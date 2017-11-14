import React, { Component } from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import DatoFelt from '../../skjema/datofelt';

import LandVelger from '../../skjema/landvelger';

import './vurderingLand.css';

class VurderingLand extends Component {

  render() {
    const { bekreftOgFortsett } = this.props;

    return (
      <div className="vurderingLand">
        <Nav.Undertittel>Utenlandsoppholdet:</Nav.Undertittel>
        <Nav.Fieldset legend="Når er søker i utlandet?">
          <Nav.Column xs="4">
            <DatoFelt label="Fra" />
          </Nav.Column>
          <Nav.Column xs="4">
            <DatoFelt label="Til" />
          </Nav.Column>
        </Nav.Fieldset>
        <Nav.Fieldset legend="Hvilke land skal søker arbeide i?">
          <Nav.Column xs="12">
            <LandVelger />
          </Nav.Column>
        </Nav.Fieldset>
        <div className="fane__knapplinje">
          <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
        </div>
      </div>
    );
  }
}

VurderingLand.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};


export default VurderingLand;
