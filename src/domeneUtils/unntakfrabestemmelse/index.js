export const hentUnntakFraBestemmelse = (perioder) => {
  const periode = perioder.length > 0 ? perioder[0] : {};
  return periode.unntakFraBestemmelse;
};

export const finnUnntakFraBestemmelse = (unntakFraBestemmelseKode, unntakFraBestemmelser) =>
  unntakFraBestemmelser.map((lb) => lb.kode).find((kode) => kode === unntakFraBestemmelseKode);
