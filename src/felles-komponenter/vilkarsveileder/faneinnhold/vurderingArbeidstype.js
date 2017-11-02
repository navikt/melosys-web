import React from 'react';
import * as Nav from '../../../utils/navFrontend';

import '../komponenter/stegIkon.css';

function VurderingArbeidstype() {
  return (
    <div>
      <Nav.Undertittel>Vurdering:</Nav.Undertittel>
      <Nav.Fieldset legend="Vurder om søkeren er:">
        <Nav.Radio id="steg0_ikke_arbeidende" name="arbeidssted" label="Ikke arbeidende / ytelsesmottaker" />
        <Nav.Radio id="steg0_arbeidstaker" name="arbeidssted" label="Arbeidstaker" />
        <Nav.Radio id="steg0_selvstendig" name="arbeidssted" label="Selvstendig næringsdrivende" />
        <Nav.Radio id="steg0_arbeidstaker_selvstendig" name="arbeidssted" label="Både arbeidstakende og selvstendig" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={() => this.bekreftOgFortsett()}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
}

VurderingArbeidstype.propTypes = {

};

VurderingArbeidstype.defaultProps = {

};

export default VurderingArbeidstype;
