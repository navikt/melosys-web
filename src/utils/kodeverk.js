const kodeverkObjektTilTerm = kodeverkObjekt => {
  if (kodeverkObjekt === null) { return '(mangler informasjon)'; }
  return Object.keys(kodeverkObjekt).includes('term') ? kodeverkObjekt.term : null;
};

const kodeverkObjektTilKode = kodeverkObjekt => {
  if (kodeverkObjekt === null) { return '(mangler informasjon)'; }
  return Object.keys(kodeverkObjekt).includes('kode') ? kodeverkObjekt.kode : null;
};

export {
  kodeverkObjektTilTerm,
  kodeverkObjektTilKode,
};
