import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import LandVelger from '../../skjema/landvelger';

const VurderingAktivitet = props => {
  const { bekreftOgFortsett, tilstand } = props;
  const { harAvklaring } = tilstand;

  return (
    <div>
      <Nav.Fieldset legend="Hvor utføres aktiviteten?">
        <LandVelger feltNavn="avklartefaktaAktivitetLand" multiland={false} />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!harAvklaring} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingAktivitet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingAktivitet.defaultProps = {
  tilstand: {},
};

export default VurderingAktivitet;
