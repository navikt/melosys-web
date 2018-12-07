import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

export const VurderingYrkesgruppeTyper = {
  YRKESAKTIV: 'YRKESAKTIV',
  YRKESAKTIV_SKIP: 'YRKESAKTIV_SKIP',
  YRKESAKTIV_FLYVENDE: 'YRKESAKTIV_FLYVENDE',
  IKKE_YRKESAKTIV: 'IKKE_YRKESAKTIV',
  KONTANTYTELSESMOTTAKER: 'KONTANTYTELSESMOTTAKER',
};

const VurderingYrkesgruppe = props => {
  const { bekreftOgFortsett, tilstand } = props;
  const { harAvklaring } = tilstand;

  return (
    <div>
      <Nav.Undertittel>Vurdering av yrkesgruppe</Nav.Undertittel>
      <Nav.Fieldset legend="Vurder om søkeren er:">
        <Skjema.Radio feltNavn="avklartefakta.yrkesgruppe" value={VurderingYrkesgruppeTyper.YRKESAKTIV} label="Yrkesaktiv" />
        <Skjema.Radio feltNavn="avklartefakta.yrkesgruppe" value={VurderingYrkesgruppeTyper.YRKESAKTIV_SKIP} label="Yrkesaktiv på skip" />
        <Skjema.Radio feltNavn="avklartefakta.yrkesgruppe" value={VurderingYrkesgruppeTyper.YRKESAKTIV_FLYVENDE} label="Yrkesaktiv som flyvende personell" />
        <Skjema.Radio feltNavn="avklartefakta.yrkesgruppe" value={VurderingYrkesgruppeTyper.IKKE_YRKESAKTIV} label="Ikke yrkesaktiv" />
        <Skjema.Radio feltNavn="avklartefakta.yrkesgruppe" value={VurderingYrkesgruppeTyper.KONTANTYTELSESMOTTAKER} label="Kontantytelsesmottaker" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!harAvklaring} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingYrkesgruppe.ID = 'YRKESGRUPPE';


VurderingYrkesgruppe.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingYrkesgruppe.defaultProps = {
  tilstand: {},
};


export default VurderingYrkesgruppe;
