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

export const STEG = {
  ARTIKKEL_16: 'ARTIKKEL_16',
  ARTIKKEL_12_1: 'ARTIKKEL_12_1',
  ARTIKKEL_12_2: 'ARTIKKEL_12_2',
  INNGANG: 'INNGANG',
  SYSSELSETTING: 'SYSSELSETTING',
  IKKE_YRKESAKTIV: 'IKKE_YRKESAKTIV',
  FORUTGAENDE_MEDLEMSKAP: 'FORUTGAENDE_MEDLEMSKAP',
  YRKESAKTIVITET: 'YRKESAKTIVITET',
  UTSENDING: 'UTSENDING',
  YRKESAKTIVITET_ANTALL_LAND: 'YRKESAKTIVITET_ANTALL_LAND',
  VIRKSOMHET: 'VIRKSOMHET',
  VESENTLIG_VIRKSOMHET: 'VESENTLIG_VIRKSOMHET',
  AKTIVITET: 'AKTIVITET',
  BOSTEDSLAND: 'BOSTEDSLAND',
  TJENESTEMANN: 'TJENESTEMANN',
  FORRETNINGSSTED: 'FORRETNINGSSTED',
  ARBEIDSGIVERE: 'ARBEIDSGIVERE',
  VEDTAK: 'VEDTAK',
};

export const StegTilKontroller = {
  ARTIKKEL_16: 'Artikkel16',
  ARTIKKEL_12_1: 'Artikkel12_1',
  ARTIKKEL_12_2: 'Artikkel12_2',
  INNGANG: 'Inngang',
  SYSSELSETTING: 'Sysselsetting',
  IKKE_YRKESAKTIV: 'IkkeYrkesaktiv',
  FORUTGAENDE_MEDLEMSKAP: 'ForutgaendeMedlemskap',
  YRKESAKTIVITET: 'Yrkesaktivitet',
  UTSENDING: 'UTSENDING',
  YRKESAKTIVITET_ANTALL_LAND: 'YrkesaktivitetAntallLand',
  VIRKSOMHET: 'Virksomhet',
  VESENTLIG_VIRKSOMHET: 'VesentligVirksomhet',
  AKTIVITET: 'Aktivitet',
  BOSTEDSLAND: 'Bostedsland',
  TJENESTEMANN: 'Tjenestemann',
  FORRETNINGSSTED: 'Forretningssted',
  ARBEIDSGIVERE: 'Arbeidsgivere',
  VEDTAK: 'Vedtak',
};
