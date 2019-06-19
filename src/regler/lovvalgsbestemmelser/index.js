export const lovvalgsbestemmelseType = 'lovvalgsbestemmelse';

export const slettLovvalgsbestemmelse = felt => ({
  felt,
  type: lovvalgsbestemmelseType,
});

export const hentLovvalgsbestemmelse = lovvalgsperioder => {
  const periode = lovvalgsperioder.length > 0 ? lovvalgsperioder[0] : {};
  return periode.lovvalgsbestemmelse;
};

export const finnLovvalgsbestemmelse = (lovvalgsbestemmelseKode, lovvalgsbestemmelser) => (
  lovvalgsbestemmelser
    .map(lb => lb.kode)
    .find(kode => kode === lovvalgsbestemmelseKode)
);

export const lagLovvalgsbestemmelse = felt => (
  {
    felt: lovvalgsbestemmelseType,
    oppdaterRedux: true,
    type: lovvalgsbestemmelseType,
    innhold: felt,
  }
);

export const konverterLovvalgsbestemmelseTilStegData = lovvalgsbestemmelse => (
  {
    felt: lovvalgsbestemmelseType,
    type: lovvalgsbestemmelseType,
    innhold: lovvalgsbestemmelse,
  }
);
