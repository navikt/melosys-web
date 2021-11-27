export const hentLovvalgsland = (lovvalgsperioder) => {
  const periode = lovvalgsperioder.length > 0 ? lovvalgsperioder[0] : {};
  return periode.lovvalgsland;
};

export const finnLovvalgsland = (lovvalgslandKode, lovvalgsland) =>
  lovvalgsland.map((lb) => lb.kode).find((kode) => kode === lovvalgslandKode);
