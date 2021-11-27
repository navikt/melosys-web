export const hentFaktaListe = (spesifiktFakta, alleFakta) =>
  alleFakta.filter((enkelt) => enkelt.referanse === spesifiktFakta) || [];
export const hentFakta = (spesifiktFakta, alleFakta) =>
  alleFakta.find((enkelt) => enkelt.referanse === spesifiktFakta) || {};
export const hentFaktaVerdi = (avklartfakta) => (avklartfakta && avklartfakta.fakta ? avklartfakta.fakta[0] : null);
