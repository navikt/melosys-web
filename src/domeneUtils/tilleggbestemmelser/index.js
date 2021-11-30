export const hentTilleggBestemmelse = (lovvalgsperioder) => {
  const periode = lovvalgsperioder.length > 0 ? lovvalgsperioder[0] : {};
  return periode.tilleggBestemmelse;
};

export const finnTilleggBestemmelse = (tilleggBestemmelseKode, tilleggBestemmelser) =>
  tilleggBestemmelser.map((lb) => lb.kode).find((kode) => kode === tilleggBestemmelseKode);
