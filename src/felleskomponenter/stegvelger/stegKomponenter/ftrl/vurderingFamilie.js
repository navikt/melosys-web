import React from 'react';
import * as Nav from "../../../../utils/navFrontend";

const VurderingFamilie = (props) => (
  <div>
    <Nav.typo.Undertittel className="undertittel">Skal familiemedlemmer oppgitt i søknaden innvilges medlemskap?</Nav.typo.Undertittel>
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

export default VurderingFamilie;
