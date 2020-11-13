import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../../utils/navFrontend';

const VurderingRepresentant = props => (
  <div>
    <Nav.typo.Undertittel className="undertittel">Representant i Norge</Nav.typo.Undertittel>
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

VurderingRepresentant.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

export default VurderingRepresentant;
