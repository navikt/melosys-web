import React from 'react';
import PT from 'prop-types';
import { Field, FieldArray } from 'redux-form';

import ListevelgerEnkelt from './listevelgerEnkelt';
import ListevelgerGruppe from './listevelgerGruppe';

import './listevelger.css';

/** Listevelgeren tillater både én enkeltliste eller en array hvor
 * brukeren kan legge til flere valg. Hvilken av disse som skal benyttes
 * styres av multiListe-prop.
 */
const Listevelger = ({
  id, feltNavn, className, multiListe, ...rest
}) => (
  <div className="listevelger">
    {
      multiListe ?
        <FieldArray
          id={id}
          name={feltNavn}
          multiListe={multiListe}
          component={ListevelgerGruppe}
          {...rest}
        />
        :
        <Field
          name={feltNavn}
          errorClass="skjemaelement--harFeil"
          className={className}
          id={id}
          component={ListevelgerEnkelt}
          props={rest}
        />
    }
  </div>
);

Listevelger.propTypes = {
  feltNavn: PT.string.isRequired,
  id: PT.string,
  className: PT.string,
  multiListe: PT.bool,
};

Listevelger.defaultProps = {
  className: '',
  id: undefined,
  multiListe: false,
};

export default Listevelger;
