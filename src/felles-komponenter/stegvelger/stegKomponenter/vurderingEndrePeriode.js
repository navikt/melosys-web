import React from 'react';
import PT from 'prop-types';
import { FieldArray, Field } from 'redux-form';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

const VurderingEndrePeriode = props => {
  return (
    <div className="vurderingEndrePeriode">
      <Nav.Undertittel>Endre lovvalgsperiode</Nav.Undertittel>
      I hvilken periode fyller søkeren kriteriene for artikkel 12, nr. 1?
      <Nav.Hovedknapp>Endre periode</Nav.Hovedknapp>
    </div>
  );
};

export default VurderingEndrePeriode;
