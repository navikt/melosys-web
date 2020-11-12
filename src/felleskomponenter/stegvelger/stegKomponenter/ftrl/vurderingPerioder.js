import React from 'react';
import * as Nav from "../../../../utils/navFrontend";

const VurderingPerioder = (props) => (
  <div>
    <Nav.typo.Undertittel className="undertittel">Vurder medlemskapsperioder</Nav.typo.Undertittel>
    <div className="fane__knapplinje" >
      <Nav.Hovedknapp
        mini
        disabled={false}
        className="fane__navigasjonsknapp"
        data-cy-nesteknapp="knapp_steg0"
        onClick={props.bekreftOgFortsett}>Fortsett
      </Nav.Hovedknapp>
    </div>
  </div>
);

export default VurderingPerioder;
