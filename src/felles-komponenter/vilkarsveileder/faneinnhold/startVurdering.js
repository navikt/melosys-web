import React from 'react';
import * as Nav from '../../../utils/navFrontend';

import '../komponenter/stegIkon.css';

function OppretteSak() {
  return (
    <div>
      <Nav.Undertittel>Saken er opprettet:</Nav.Undertittel>
      <Nav.Normaltekst>Saken er nå opprettet. Det er manglelfulle opplysninger i søknaden. Du kan velge å fylle dem ut nå, eller utsette det til saken skal behandles.</Nav.Normaltekst>
      <div className="fane__knapplinje">
        <Nav.Knapp className="fane__navigasjonsknapp" onClick={() => {}}>Sett i kø</Nav.Knapp>
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={() => this.bekreftOgFortsett()}>Start behandling</Nav.Knapp>
      </div>
    </div>
  );
}

OppretteSak.propTypes = {

};

OppretteSak.defaultProps = {

};

export default OppretteSak;
