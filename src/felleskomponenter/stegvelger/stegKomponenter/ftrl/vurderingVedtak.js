import React from 'react';
import * as Nav from '../../../../utils/navFrontend';

const VurderingVedtak = () => (
  <div>
    <Nav.typo.Undertittel className="undertittel">Frivillig medlemskap etter paragraf 2.8</Nav.typo.Undertittel>
    <div className="fane__knapplinje" >
      <Nav.Hovedknapp
        mini
        disabled={false}
        className="fane__navigasjonsknapp"
        data-cy-nesteknapp="knapp_steg0"
        onClick={() => {}}>Vedta
      </Nav.Hovedknapp>
    </div>
  </div>
);

export default VurderingVedtak;
