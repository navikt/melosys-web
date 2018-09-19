const kodeverkObjektTilTerm = kodeverkObjekt => {
  if (!kodeverkObjekt || !kodeverkObjekt.term) { return '(mangler informasjon)'; }
  return Object.keys(kodeverkObjekt).includes('term') ? kodeverkObjekt.term : null;
};

const kodeverkObjektTilKode = kodeverkObjekt => {
  if (!kodeverkObjekt || !kodeverkObjekt.kode) { throw new Error('Ukjent kode'); }
  return Object.keys(kodeverkObjekt).includes('kode') ? kodeverkObjekt.kode : null;
};

export {
  kodeverkObjektTilTerm,
  kodeverkObjektTilKode,
};
