
export function boolTilNorsk (value) {
  return value ? 'JA' : 'NEI';
}

export function norskTilBool (value) {
  return value ? (value.toLowerCase() === 'ja') : false;
}

export function boolTilStreng (value) {
  if (value === undefined) { return undefined; }
  return value ? 'true' : 'false';
}

export function strengTilBool (value) {
  return value === 'true';
}

export function strengTilInt (value) {
  return parseInt(value, 10) || 0;
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
