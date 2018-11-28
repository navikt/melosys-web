import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

export const VurderingSokkelSkipTyper = {
  SKIP_INNENRIKS: 'SKIP_INNENRIKS',
  SKIP_ETT_LAND: 'SKIP_ETT_LAND',
  SOKKEL_NORSK: 'SOKKEL_NORSK',
  SOKKEL_UTLAND: 'SOKKEL_UTLAND',
  SOKKEL_ELLER_SKIP_FLERE_LAND: 'SOKKEL_ELLER_SKIP_FLERE_LAND',
};

const VurderingSokkelSkip = props => {
  const { bekreftOgFortsett, tilstand } = props;
  const { harAvklaring } = tilstand;

  return (
    <div>
      <Nav.Undertittel>Vurdering av sokkel eller skip</Nav.Undertittel>
      <Nav.Fieldset legend="Hvordan arbeider søkeren:">
        <Skjema.Radio feltNavn="vilkar.sokkel_skip" value={VurderingSokkelSkipTyper.YRKESAKTIV} label="På norsk sokkel" />
        <Skjema.Radio feltNavn="vilkar.sokkel_skip" value={VurderingSokkelSkipTyper.YRKESAKTIV_SKIP} label="På skip i innenrikstrafikk" />
        <Skjema.Radio feltNavn="vilkar.sokkel_skip" value={VurderingSokkelSkipTyper.YRKESAKTIV_FLYVENDE} label="På skip registrert i ett land" />
        <Skjema.Radio feltNavn="vilkar.sokkel_skip" value={VurderingSokkelSkipTyper.IKKE_YRKESAKTIV} label="Utsendt til et annet lands sokkel" />
        <Skjema.Radio feltNavn="vilkar.sokkel_skip" value={VurderingSokkelSkipTyper.KONTANTYTELSESMOTTAKER} label="To sokler / skip i flere land" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!harAvklaring} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingSokkelSkip.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingSokkelSkip.defaultProps = {
  tilstand: {},
};


export default VurderingSokkelSkip;
