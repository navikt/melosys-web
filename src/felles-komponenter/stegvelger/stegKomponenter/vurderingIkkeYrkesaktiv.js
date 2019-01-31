import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

import { VurderingIkkeYrkesaktivTyper } from '../../../kodeverk/koder';

const IkkeYrkesaktiv = () => (
  <Nav.Fieldset legend="Vurder om søkeren er:">
    <Skjema.Radio feltNavn="avklartefaktaIkkeYrkesaktivType" value={VurderingIkkeYrkesaktivTyper.STUDENT} label="Student" />
    <Skjema.Radio feltNavn="avklartefaktaIkkeYrkesaktivType" value={VurderingIkkeYrkesaktivTyper.PENSJONIST} label="Pensjonist" />
    <Skjema.Radio feltNavn="avklartefaktaIkkeYrkesaktivType" value={VurderingIkkeYrkesaktivTyper.INGEN_AV_DISSE} label="Ingen av disse" />
  </Nav.Fieldset>
);

const VurderingIkkeYrkesaktiv = props => {
  const { bekreftOgFortsett } = props;

  return (
    <div>
      <IkkeYrkesaktiv />
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingIkkeYrkesaktiv.ID = 'IKKEYRKESAKTIV';


VurderingIkkeYrkesaktiv.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingIkkeYrkesaktiv.defaultProps = {
  tilstand: {},
};


export default VurderingIkkeYrkesaktiv;
