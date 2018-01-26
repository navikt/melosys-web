import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

import LandVelger from '../../skjema/landvelger/';

const VurderingBostedsland = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Jeg bekrefter å ha vurdert:">
        <Skjema.Checkbox feltNavn="faktaavklaringBekrefterFamiliebosted" value={VurderingBostedsland.TRUE} label="Hvor søkers nærmeste familie bor" />
        <Skjema.Checkbox feltNavn="faktaavklaringBekrefterDisponering" value={VurderingBostedsland.TRUE} label="Hvor søker disponerer" />
      </Nav.Fieldset>
      <Nav.Fieldset legend="Basert på dette vurderes bosted til:">
        <LandVelger feltNavn="faktaavklaringBostedsland" multiland={false} />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingBostedsland.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingBostedsland.defaultProps = {
  tilstand: {},
};

VurderingBostedsland.TRUE = 'true';

export default VurderingBostedsland;
