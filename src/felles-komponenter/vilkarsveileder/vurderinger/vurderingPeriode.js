import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

import LandVelger from '../../skjema/landvelger';

const VurderingPeriode = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div className="vurdering__periode">
      <Nav.Fieldset legend="Periode for søknad?">
        <Nav.Column xs="4">
          <Skjema.Input datoFelt label="Fra" feltNavn="faktaavklaringPeriodeFraOgMed" />
        </Nav.Column>
        <Nav.Column xs="4">
          <Skjema.Input datoFelt label="Til" feltNavn="faktaavklaringPeriodeTilOgMed" />
        </Nav.Column>
      </Nav.Fieldset>
      <Nav.Fieldset legend="Land som søker skal arbeide eller oppholde seg i:">
        <Nav.Column xs="12">
          <LandVelger feltNavn="faktaavklaringOppholdsLand" multiLand />
        </Nav.Column>
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingPeriode.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};


export default VurderingPeriode;
