import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

export const VurderingYrkesaktivitetFordelingTyper = {
  ETT_LAND_IKKE_NORGE: 'ETT_LAND_IKKE_NORGE',
  KUN_NORGE: 'KUN_NORGE',
  TO_ELLER_FLERE_LAND: 'TO_ELLER_FLERE_LAND',
};

const AntallLand = () => (
  <Nav.Fieldset legend="Hvor mange land skal søker ha yrkesaktivitet i?">
    <Skjema.Radio feltNavn="faktaavklaringAntallLand" value={VurderingYrkesaktivitetFordelingTyper.KUN_NORGE} label="Kun Norge" />
    <Skjema.Radio feltNavn="faktaavklaringAntallLand" value={VurderingYrkesaktivitetFordelingTyper.ETT_LAND_IKKE_NORGE} label="Ett land, ikke Norge" />
    <Skjema.Radio feltNavn="faktaavklaringAntallLand" value={VurderingYrkesaktivitetFordelingTyper.TO_ELLER_FLERE_LAND} label="To eller flere land" />
  </Nav.Fieldset>
);

const VurderingYrkesaktivitetFordeling = props => {
  const { bekreftOgFortsett, tilstand } = props;

  return (
    <div>
      { tilstand.visAntallLand && <AntallLand /> }
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingYrkesaktivitetFordeling.ID = 'YRKESAKTIVITET_FORDELING';


VurderingYrkesaktivitetFordeling.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingYrkesaktivitetFordeling.defaultProps = {
  tilstand: {},
};

export default VurderingYrkesaktivitetFordeling;
