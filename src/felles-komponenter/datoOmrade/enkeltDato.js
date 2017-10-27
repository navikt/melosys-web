import React from 'react';
import PT from 'prop-types';

/** EnkeltDato gjør det lettere å følge UU der datoer skal benyttes i tillegg til at
 * en konsekvent "-" vises der dato er ukjent eller ikke relevant.
 *
 * @param props.dato
 * @constructor
 */
function EnkeltDato(props) {
  const { dato } = props;
  return (dato ? <time dateTime={dato}>{dato}</time> : '-');
}

EnkeltDato.propTypes = {
  dato: PT.string,
};

EnkeltDato.defaultProps = {
  dato: '',
};

export default EnkeltDato;
