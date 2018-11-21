import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import LandVelger from '../../skjema/landvelger/';

const VurderingAktivitet = props => {
  const { bekreftOgFortsett, tilstand } = props;

  const sporsmal = tilstand.sporOmHovedtyngden ? 'Hvor skjer hovedtyngden av aktiviteten?' : 'Hvor utføres aktiviteten?';

  return (
    <div>
      <Nav.Fieldset legend={sporsmal}>
        <LandVelger feltNavn="avklartefaktaAktivitetLand" multiland={false} />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
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
