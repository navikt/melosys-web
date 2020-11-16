import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../../utils/navFrontend';

const VurderingBestemmelse = props => (
  <div>
    <Nav.typo.Undertittel className="undertittel">Hvilken bestemmelse skal søknaden vurderes etter?</Nav.typo.Undertittel>
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

VurderingBestemmelse.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

export default VurderingBestemmelse;
