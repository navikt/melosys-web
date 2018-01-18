import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

const VurderingArbeidstype = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Vurder om søkeren er:">
        <Skjema.Radio feltNavn="faktaavklaringArbeidstype" value="ARBEIDSTAKER" label="Arbeidstaker" />
        <Skjema.Radio feltNavn="faktaavklaringArbeidstype" value="SELVSTENDIG" label="Selvstendig næringsdrivende" />
        <Skjema.Radio feltNavn="faktaavklaringArbeidstype" value="ARBEIDSTAKER_OG_SELVSTENDIG" label="Både arbeidstaker og selvstendig" />
        <Skjema.Radio feltNavn="faktaavklaringArbeidstype" value="IKKE_ARBEIDSAKTIV_YTELSESMOTTAKER" label="Ikke arbeidsaktiv / ytelsesmottaker" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingArbeidstype.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};


export default VurderingArbeidstype;
