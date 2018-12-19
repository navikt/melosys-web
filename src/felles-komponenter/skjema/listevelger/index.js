import React from 'react';
import PT from 'prop-types';
import { Field, FieldArray } from 'redux-form';

import * as MPT from '../../../proptypes';

import ListevelgerEnkelt from './listevelgerEnkelt';
import ListevelgerFlervalg from './listevelgerFlervalg';

import './listevelger.css';

/** Listevelgeren tillater både én enkeltliste eller en array hvor
 * brukeren kan legge til flere valg. Hvilken av disse som skal benyttes
 * styres av multiListe-prop som gis til komponenten.
 *
 * Komponenten forventer en array av strings for å vise listevalg. Det betyr at
 * kodeverk-baserte objekter må reduces.
 */
const Listevelger = ({
  feltNavn, className, gruppe, ...rest
}) => (
  <div className="listevelger">
    {
      gruppe ?
        <FieldArray
          name={feltNavn}
          multiListe={gruppe}
          component={ListevelgerFlervalg}
          {...rest}
        />
        :
        <Field
          name={feltNavn}
          className={className}
          component={ListevelgerEnkelt}
          {...rest}
        />
    }
  </div>
);

Listevelger.propTypes = {
  feltNavn: PT.string.isRequired,
  className: PT.string,
  gruppe: PT.bool,
  muligeValg: PT.arrayOf(MPT.Kodeverk),
  tillatFritekst: PT.bool,
  disabled: PT.bool,
};

Listevelger.defaultProps = {
  className: '',
  gruppe: false,
  muligeValg: [],
  tillatFritekst: false,
  disabled: false,
};

export default Listevelger;
