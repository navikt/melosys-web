import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

const VurderingUtsending = props => {
  const { bekreftOgFortsett, tilstand } = props;

  const utsendingMindreEnn24Mnd = tilstand.visUtsendingMindreEnn24Mnd
    ?
    <Skjema.Checkbox feltNavn="faktaavklaringUtsendingMindreEnn24Mnd" value={VurderingUtsending.TRUE} label="Er utsendingsperioden mindre enn 24 mnd?" />
    :
    null;

  const erstatterTidligereUtsendt = tilstand.visErstatterTidligereUtsendt
    ?
    <Skjema.Checkbox feltNavn="faktaavklaringErstatterTidligereUtsendt" value={VurderingUtsending.TRUE} label="Skal personen erstatte en annen?" />
    :
    null;

  const ansattINorskSelskap = tilstand.visAnsattINorskSelskap
    ?
    <Skjema.Checkbox feltNavn="faktaavklaringAnsattINorskSelskap" value={VurderingUtsending.TRUE} label="Skal personen være ansatt i det norske selskapet i hele utsendingsperioden?" />
    :
    null;

  return (
    <div>
      <Nav.Fieldset legend="Hva gjelder for søkeren?">
        {utsendingMindreEnn24Mnd}
        {ansattINorskSelskap}
        {erstatterTidligereUtsendt}
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingUtsending.TRUE = 'true';
VurderingUtsending.FALSE = 'false';

VurderingUtsending.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingUtsending.defaultProps = {
  tilstand: {},
};

export default VurderingUtsending;
