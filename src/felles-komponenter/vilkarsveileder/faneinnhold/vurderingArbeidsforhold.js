import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';

const VurderingArbeidsforhold = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Undertittel>Velg relevante arbeidsforhold:</Nav.Undertittel>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingArbeidsforhold.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};


export default VurderingArbeidsforhold;
