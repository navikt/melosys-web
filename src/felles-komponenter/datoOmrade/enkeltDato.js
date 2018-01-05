import React from 'react';
import PT from 'prop-types';
import moment from 'moment';

/** Gjør en vurdering av innkomne datoformat og formatter til korrekt DD.MM.YYY, med eller uten tidspunkt
 *
 */
function FormatterDato(dato, visTidspunkt) {
  const momentFormat = visTidspunkt ? 'DD.MM.YYYY HH:MM' : 'DD.MM.YYYY';
  return moment(dato).format(momentFormat);
}

/** EnkeltDato gjør det lettere å følge UU der datoer skal benyttes i tillegg til at
 * en konsekvent "-" vises der dato er ukjent eller ikke relevant.
 *
 * @param { dato } String Datoen som skal settess inn
 * @param { visTidspunkt } Boolean Hvorvidt klokkeslett i datoen skal vises.
 */
function EnkeltDato(props) {
  const { dato, visTidspunkt } = props;
  const lesbarDato = FormatterDato(dato, visTidspunkt);

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
export { FormatterDato };
