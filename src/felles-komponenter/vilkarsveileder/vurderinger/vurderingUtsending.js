import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

const VurderingUtsending = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Hva gjelder for søkeren?">
        <Skjema.Checkbox feltNavn="faktaavklaringUtsendingMindreEnn24Mnd" value={VurderingUtsending.TRUE} label="Er utsendingsperioden mindre enn 24 mnd?" />
        <Skjema.Checkbox feltNavn="faktaavklaringAnsattINorskSelskap" value={VurderingUtsending.TRUE} label="Skal personen være ansatt i det norske selskapet i hele utsendingsperioden?" />
        <Skjema.Checkbox feltNavn="faktaavklaringErstatterTidligereUtsendt" value={VurderingUtsending.TRUE} label="Skal personen erstatte en annen?" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingUtsending.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};

VurderingUtsending.TRUE = 'true';
VurderingUtsending.FALSE = 'false';

export default VurderingUtsending;
