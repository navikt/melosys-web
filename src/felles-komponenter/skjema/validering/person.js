const fulltNavn = value => {
  const regex = /^[a-zA-Z.'-]{2,50}(?: [a-zA-Z.'-]{2,50})+$/;
  return value && value.search(regex) ? 'Du må skrive inn både fornavn og etternavn.' : null;
};

const fnr = value => {
  const regex = /^\d{9,9}$/;
  return (value.search(regex) ? 'Fødselsnummer må bestå av 9 siffer' : null);
};

export {
  fulltNavn,
  fnr,
};
