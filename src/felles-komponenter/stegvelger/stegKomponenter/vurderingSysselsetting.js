import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

export const VurderingSysselsettingTyper = {
  YRKESAKTIV: 'YRKESAKTIV',
  YRKESAKTIV_SKIP: 'YRKESAKTIV_SKIP',
  YRKESAKTIV_FLYVENDE: 'YRKESAKTIV_FLYVENDE',
  IKKE_YRKESAKTIV: 'IKKE_YRKESAKTIV',
  KONTANTYTELSESMOTTAKER: 'KONTANTYTELSESMOTTAKER',
};

const VurderingSysselsetting = props => {
  const { bekreftOgFortsett, tilstand } = props;
  const { harAvklaring } = tilstand;

  return (
    <div>
      <Nav.Undertittel>Vurdering av aktivitet</Nav.Undertittel>
      <Nav.Fieldset legend="Vurder om søkeren er:">
        <Skjema.Radio feltNavn="avklartefakta.sysselsetting" value={VurderingSysselsettingTyper.YRKESAKTIV} label="Yrkesaktiv" />
        <Skjema.Radio feltNavn="avklartefakta.sysselsetting" value={VurderingSysselsettingTyper.YRKESAKTIV_SKIP} label="Yrkesaktiv på skip" />
        <Skjema.Radio feltNavn="avklartefakta.sysselsetting" value={VurderingSysselsettingTyper.YRKESAKTIV_FLYVENDE} label="Yrkesaktiv som flyvende personell" />
        <Skjema.Radio feltNavn="avklartefakta.sysselsetting" value={VurderingSysselsettingTyper.IKKE_YRKESAKTIV} label="Ikke yrkesaktiv" />
        <Skjema.Radio feltNavn="avklartefakta.sysselsetting" value={VurderingSysselsettingTyper.KONTANTYTELSESMOTTAKER} label="Kontantytelsesmottaker" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!harAvklaring} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
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
