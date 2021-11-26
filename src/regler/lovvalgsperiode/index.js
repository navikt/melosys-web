export const hentLovvalgsperiode = (lovvalgsperioder) => {
  const periode = lovvalgsperioder.length > 0 ? lovvalgsperioder[0] : {};
  return { fomDato: periode.fomDato, tomDato: periode.tomDato };
};
