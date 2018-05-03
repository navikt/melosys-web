import React from 'react';
import PT from 'prop-types';
import { Field, FieldArray } from 'redux-form';

import ListevelgerEnkelt from './listevelgerEnkelt';
import ListevelgerGruppe from './listevelgerGruppe';

import './listevelger.css';

/** Listevelgeren tillater både én enkeltliste eller en array hvor
 * brukeren kan legge til flere valg. Hvilken av disse som skal benyttes
 * styres av multiListe-prop som gis til komponenten.
 *
 * Komponenten forventer en array av strings for å vise listevalg. Det betyr at
 * kodeverk-baserte objekter må reduces.
 */
const Listevelger = ({
  id, feltNavn, className, gruppe, ...rest
}) => (
  <div className="listevelger">
    {
      gruppe ?
        <FieldArray
          id={id}
          name={feltNavn}
          multiListe={gruppe}
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
  gruppe: PT.bool,
};

Listevelger.defaultProps = {
  className: '',
  id: undefined,
  gruppe: false,
};

export default Listevelger;
