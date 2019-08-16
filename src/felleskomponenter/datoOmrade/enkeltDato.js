import React from 'react';
import PT from 'prop-types';

import { formatterDatoTilNorsk } from '../../utils/dato';

/** EnkeltDato gjør det lettere å følge UU der datoer skal benyttes i tillegg til at
 * en konsekvent "-" vises der dato er ukjent eller ikke relevant.
 *
 * @param { props }  props object
 */
function EnkeltDato(props) {
  // Datoen som skal settess inn
  // Boolean Hvorvidt klokkeslett i datoen skal vises.
  const { dato, visTidspunkt } = props;
  const lesbarDato = formatterDatoTilNorsk(dato, visTidspunkt);

  return (dato ? <time dateTime={dato}>{lesbarDato}</time> : '-');
}

EnkeltDato.propTypes = {
  dato: PT.string,
  visTidspunkt: PT.bool,
};

EnkeltDato.defaultProps = {
  dato: '',
  visTidspunkt: false,
};


export default EnkeltDato;
