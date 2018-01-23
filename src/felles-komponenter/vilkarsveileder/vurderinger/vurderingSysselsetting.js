import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

const VurderingSysselsetting = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <Nav.Fieldset legend="Vurder om søkeren er:">
        <Skjema.Radio feltNavn="faktaavklaringSysselsettingType" value={VurderingSysselsetting.IKKE_ARBEIDENDE} label="Ikke yrkesaktiv" />
        <Skjema.Radio feltNavn="faktaavklaringSysselsettingType" value={VurderingSysselsetting.ARBEIDSTAKER} label="Arbeidstaker / frilanser" />
        <Skjema.Radio feltNavn="faktaavklaringSysselsettingType" value={VurderingSysselsetting.SELVSTENDIG} label="Selvstendig næringsdrivende" />
        <Skjema.Radio feltNavn="faktaavklaringSysselsettingType" value={VurderingSysselsetting.ARBEIDSTAKER_OG_SELVSTENDIG} label="Både arbeidstakende og selvstendig" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingSysselsetting.ID = 'SYSSELSETTING';
VurderingSysselsetting.IKKE_ARBEIDENDE = 'IKKE_ARBEIDENDE';
VurderingSysselsetting.ARBEIDSTAKER = 'ARBEIDSTAKER';
VurderingSysselsetting.SELVSTENDIG = 'SELVSTENDIG';
VurderingSysselsetting.ARBEIDSTAKER_OG_SELVSTENDIG = 'ARBEIDSTAKER_OG_SELVSTENDIG';

VurderingSysselsetting.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
};


export default VurderingSysselsetting;
