import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../../utils/navFrontend';

const VurderingFamilie = props => (
  <div>
    <Nav.typo.Undertittel className="undertittel">Skal familiemedlemmer oppgitt i søknaden innvilges medlemskap?</Nav.typo.Undertittel>
    <div className="fane__knapplinje" >
      <Nav.Hovedknapp
        mini
        disabled={false}
        className="fane__navigasjonsknapp"
        onClick={props.bekreftOgFortsett}>Fortsett
      </Nav.Hovedknapp>
    </div>
  </div>
);

VurderingFamilie.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

export default VurderingFamilie;
