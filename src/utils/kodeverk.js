const kodeverkObjektTilTerm = kodeverkObjekt => {
  if (!kodeverkObjekt || !kodeverkObjekt.term) { return '(mangler informasjon)'; }
  return Object.keys(kodeverkObjekt).includes('term') ? kodeverkObjekt.term : null;
};

const kodeverkObjektTilKode = kodeverkObjekt => {
  if (!kodeverkObjekt || !kodeverkObjekt.kode) { throw new Error('Ukjent kode'); }
  return Object.keys(kodeverkObjekt).includes('kode') ? kodeverkObjekt.kode : null;
};

const finnEnkeltKodeFraListe = (kodeSomSkalFinnes, kodeverkListe) => (
  kodeverkListe.find(enkelt => enkelt.kode === kodeSomSkalFinnes) || undefined
);

const kodeTilVerdi = (kode, muligeValg) => {
  const valgtKodeverkObjekt = muligeValg.find(item => kodeverkObjektTilKode(item) === kode);
  return valgtKodeverkObjekt && kodeverkObjektTilTerm(valgtKodeverkObjekt);
};

const verdiTilKode = (verdi, muligeValg) => {
  const valgtKodeverkObjekt = muligeValg.find(item => kodeverkObjektTilTerm(item) === verdi);
  return valgtKodeverkObjekt && kodeverkObjektTilKode(valgtKodeverkObjekt);
};

export {
  finnEnkeltKodeFraListe,
  kodeverkObjektTilTerm,
  kodeverkObjektTilKode,
  verdiTilKode,
  kodeTilVerdi,
};
