
export function boolTilNorsk (value) {
  return value ? 'JA' : 'NEI';
}

export function norskTilBool (value) {
  return value ? (value.toLowerCase() === 'ja') : false;
}

export function boolTilStreng (value) {
  if (value === undefined || value === null) { return undefined; }
  return value ? 'true' : 'false';
}

export function strengTilBool (value) {
  return value === 'true';
}

export function strengTilInt (value) {
  return parseInt(value, 10) || null;
}

export function tekstEllerDash(data) {
  return data || '-';
}

/* eslint-disable prefer-rest-params */
export function storeForbokstaver() {
  const tekst = Array.prototype.filter.call(arguments, s => s).join(' ');
  return (
    tekst &&
    tekst.replace(
      /\w\S*/g,
      ord => ord.charAt(0).toUpperCase() + ord.substr(1).toLowerCase()
    )
  );
}

export function arrayTilKonjunksjon(liste) {
  if (!liste) { return ''; }
  if (typeof liste === 'string') { return liste; }
  return liste.reduce((samling, element, index) => {
    const konjunksjon = index < liste.length - 2 ? ', ' : ' og ';
    const erVedSisteElement = index === (liste.length - 1);
    return `${samling}${element}${!erVedSisteElement ? konjunksjon : ''}`;
  }, '');
}
