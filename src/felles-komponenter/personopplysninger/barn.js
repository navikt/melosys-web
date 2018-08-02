import React from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Skjema from '../skjema';
import Landvelger from '../skjema/landvelger';
import * as Nav from '../../utils/navFrontend';

import './barn.css';

const uuid = require('uuid/v4');

const BarnEnkelt = ({ barnEnkelt }) => {
  return (
    <dl className="barnEnkelt">
      <dd>{barnEnkelt.sammensattNavn}</dd>
      <dd><Skjema.Checkbox feltNavn="skalværramed" label="Barnet skal være med søker." /></dd>
    </dl>
  );
};

const Barn = ({ barn }) => {
  return (
    <div className="barn">
      <Nav.Fieldset legend="Barn">
        <div className="barnListe">
          {barn.map(barnEnkelt => <BarnEnkelt key={uuid()} barnEnkelt={barnEnkelt} />)}
        </div>
      </Nav.Fieldset>
    </div>
  );
};

export default Barn;
