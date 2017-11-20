import React from 'react';
import PT from 'prop-types';
import moment from 'moment';

/** EnkeltDato gjør det lettere å følge UU der datoer skal benyttes i tillegg til at
 * en konsekvent "-" vises der dato er ukjent eller ikke relevant.
 *
 *
 * @param { dato } String Datoen som skal settess inn
 * @param { visTidspunkt } Boolean Hvorvidt klokkeslett i datoen skal vises.
 */
function EnkeltDato(props) {
  const { dato, visTidspunkt } = props;
  const momentFormat = visTidspunkt ? 'DD.MM.YYYY HH:MM' : 'DD.MM.YYYY';

  const lesbarDato = moment(dato).format(momentFormat);
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
