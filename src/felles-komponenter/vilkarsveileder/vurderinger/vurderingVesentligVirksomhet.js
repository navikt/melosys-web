import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

export const VurderingVesentligVirksomhetTyper = {
  HAR_VESENTLIG_VIRKSOMHET: 'HAR_VESENTLIG_VIRKSOMHET',
  IKKE_VESENTLIG_VIRKSOMHET: 'IKKE_VESENTLIG_VIRKSOMHET',
};

const VurderingVesentligVirksomhet = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Undertittel>Vurdering av vesentlig virksomhet</Nav.Undertittel>
      <div className="vurderingBostedsland__skjemafelt">
        <Nav.Fieldset legend="Virksomheten har:">
          <Skjema.Radio feltNavn="faktaavklaringVesentligVirksomhetINorge" value={VurderingVesentligVirksomhetTyper.HAR_VESENTLIG_VIRKSOMHET} label="Vesentlig virksomhet" />
          <Skjema.Radio feltNavn="faktaavklaringVesentligVirksomhetINorge" value={VurderingVesentligVirksomhetTyper.IKKE_VESENTLIG_VIRKSOMHET} label="Ikke vesentlig virksomhet" />
        </Nav.Fieldset>
      </div>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingVesentligVirksomhet.ID = 'VESENTLIG_VIRKSOMHET';


VurderingVesentligVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingVesentligVirksomhet.defaultProps = {
  tilstand: {},
};

export default VurderingVesentligVirksomhet;
