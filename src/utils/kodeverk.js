const kodeverkObjektTilTerm = kodeverkObjekt => {
  if (!kodeverkObjekt) { return '(mangler informasjon)'; }
  if (!kodeverkObjekt.term) { return '(mangler informasjons term)'; }
  return Object.keys(kodeverkObjekt).includes('term') ? kodeverkObjekt.term : null;
};

const kodeverkObjektTilKode = kodeverkObjekt => {
  if (!kodeverkObjekt) { return '(mangler informasjon)'; }
  if (!kodeverkObjekt.kode) { return '(mangler informasjons kode)'; }
  return Object.keys(kodeverkObjekt).includes('kode') ? kodeverkObjekt.kode : null;
};

export {
  kodeverkObjektTilTerm,
  kodeverkObjektTilKode,
};
