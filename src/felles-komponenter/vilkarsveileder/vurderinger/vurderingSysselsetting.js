import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

export const VurderingSysselsettingTyper = {
  IKKE_ARBEIDENDE: 'IKKE_ARBEIDENDE',
  ARBEIDSTAKER: 'ARBEIDSTAKER',
  SELVSTENDIG: 'SELVSTENDIG',
  ARBEIDSTAKER_OG_SELVSTENDIG: 'ARBEIDSTAKER_OG_SELVSTENDIG',
  VERNEPLIKTIG: 'VERNEPLIKTIG',
};

const Sysselsetting = () => (
  <Nav.Fieldset legend="Vurder om søkeren er:">
    <Skjema.Radio feltNavn="faktaavklaringSysselsettingType" value={VurderingSysselsettingTyper.IKKE_ARBEIDENDE} label="Ikke yrkesaktiv" />
    <Skjema.Radio feltNavn="faktaavklaringSysselsettingType" value={VurderingSysselsettingTyper.ARBEIDSTAKER} label="Arbeidstaker / frilanser" />
    <Skjema.Radio feltNavn="faktaavklaringSysselsettingType" value={VurderingSysselsettingTyper.SELVSTENDIG} label="Selvstendig næringsdrivende" />
    <Skjema.Radio feltNavn="faktaavklaringSysselsettingType" value={VurderingSysselsettingTyper.ARBEIDSTAKER_OG_SELVSTENDIG} label="Både arbeidstakende og selvstendig" />
    <Skjema.Radio feltNavn="faktaavklaringSysselsettingType" value={VurderingSysselsettingTyper.VERNEPLIKTIG} label="Vernepliktig" />
  </Nav.Fieldset>
);

const VurderingSysselsetting = props => {
  const { bekreftOgFortsett, tilstand } = props;

  return (
    <div>
      { tilstand.visSysselsettingType && <Sysselsetting /> }
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingSysselsetting.ID = 'SYSSELSETTING';


VurderingSysselsetting.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingSysselsetting.defaultProps = {
  tilstand: {},
};


export default VurderingSysselsetting;
