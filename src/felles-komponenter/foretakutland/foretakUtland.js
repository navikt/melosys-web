import React from 'react';
import { FieldArray } from 'redux-form';

import ForetakUtlandWrapper from './foretakUtlandWrapper';
import './foretakUtland.css';

const ForetakUtland = props => (
  <FieldArray
    name="foretakUtland"
    component={ForetakUtlandWrapper}
    props={props}
  />
);
export default ForetakUtland;
