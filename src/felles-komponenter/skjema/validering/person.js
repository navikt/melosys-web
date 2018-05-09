const fulltNavn = value => {
  const regex = /^[a-zA-Z.'-]{2,50}(?: [a-zA-Z.'-]{2,50})+$/;
  return value && value.search(regex) ? 'Du må skrive inn både fornavn og etternavn.' : null;
};

const fnr = value => {
  const regex = /^\d{11,11}$/;
  return (value.search(regex) ? 'Fødselsnummer må bestå av 11 siffer' : null);
};

const erFnr = verdi => {
  const regex = RegExp(/^\d{11,11}$/);
  return regex.test(verdi);
};

const erDnr = verdi => {
  const regex = RegExp(/^\d{11,11}$/);
  return regex.test(verdi);
};

export {
  fulltNavn,
  fnr,
  erFnr,
  erDnr,
};
