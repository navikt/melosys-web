const adresseKreves = value => (value.length === 0 ? 'Vær snill å taste inn adressen.' : null);

const norskPostNummer = value => {
  const regex = /^\d{4,4}$/;
  return (value.search(regex) ? 'Postnummeret ser ikke ut til å stemme' : null);
};

export {
  adresseKreves,
  norskPostNummer,
};
