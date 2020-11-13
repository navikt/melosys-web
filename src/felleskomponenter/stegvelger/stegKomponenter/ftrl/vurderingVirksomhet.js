import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../../utils/navFrontend';

const VurderingVirksomhet = props => (
  <div>
    <Nav.typo.Undertittel className="undertittel">Velg virksomhet</Nav.typo.Undertittel>
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

VurderingVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

export default VurderingVirksomhet;
