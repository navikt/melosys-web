import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import LandVelger from '../../skjema/landvelger/';

const VurderingForretningssted = props => {
  const { bekreftOgFortsett, tilstand } = props;


  return (
    <div>
      <Nav.Undertittel>Vurder arbeidsgivers forretningssted</Nav.Undertittel>
      <Nav.Fieldset legend="Arbeidsgiver 1:">
        <LandVelger feltNavn="faktaavkaringForretningsstedBeslutningLand1" label="Tar viktige besluttninger i" multiland={false} />
        <LandVelger feltNavn="faktaavkaringForretningsstedVesentligLand1" label="Har vesentlig virksomhet i" multiland={false} />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Arbeidsgiver 2:">
        <LandVelger feltNavn="faktaavkaringForretningsstedBeslutningLand2" label="Tar viktige besluttninger i" multiland={false} />
        <LandVelger feltNavn="faktaavkaringForretningsstedVesentligLand2" label="Har vesentlig virksomhet i" multiland={false} />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Arbeidsgiver 3:">
        <LandVelger feltNavn="faktaavkaringForretningsstedBeslutningLand3" label="Tar viktige besluttninger i" multiland={false} />
        <LandVelger feltNavn="faktaavkaringForretningsstedVesentligLand3" label="Har vesentlig virksomhet i" multiland={false} />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingForretningssted.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingForretningssted.defaultProps = {
  tilstand: {},
};

export default VurderingForretningssted;
