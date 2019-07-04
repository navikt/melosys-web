import React from 'react';
import { FieldArray } from 'redux-form';

import ArbeidUtlandWrapper from './arbeidUtlandWrapper';

import './arbeidUtland.css';


const ArbeidUtland = props => (<FieldArray name="arbeidUtland" component={ArbeidUtlandWrapper} props={props} />);


export default ArbeidUtland;
