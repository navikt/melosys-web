/* eslint-disable */
/** Hver fane kan ha en rekke forskjellige statuser som er ment å indikere
 * feil eller varsler som saksbehandleren må håndtere.
 *
 * @type {{UBEHANDLET: string, AKTIV: string, BEHANDLET: string, ADVARSEL: string, FEIL: string}}
 */
export const FANE_STATUS = {
  UBEHANDLET: 'UBEHANDLET',
  AKTIV: 'AKTIV',
  OK: 'OK',
  ADVARSEL: 'ADVARSEL',
  FEIL: 'FEIL',
};
