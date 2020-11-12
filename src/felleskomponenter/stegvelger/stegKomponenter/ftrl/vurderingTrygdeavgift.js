import React from 'react';
import * as Nav from "../../../../utils/navFrontend";

const VurderingTrygdeavgift = (props) => (
  <div>
    <Nav.typo.Undertittel className="undertittel">Trygdeavgift</Nav.typo.Undertittel>
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

export default VurderingTrygdeavgift;
