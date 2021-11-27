export const hentLovvalgsbestemmelse = (lovvalgsperioder) => {
  const periode = lovvalgsperioder.length > 0 ? lovvalgsperioder[0] : {};
  return periode.lovvalgsbestemmelse;
};

export const finnLovvalgsbestemmelse = (lovvalgsbestemmelseKode, lovvalgsbestemmelser) =>
  lovvalgsbestemmelser.map((lb) => lb.kode).find((kode) => kode === lovvalgsbestemmelseKode);
