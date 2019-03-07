import * as Koder from './koder';
import * as Form from './form';

const objektTilTerm = KTObjekt => {
  if (!KTObjekt || !KTObjekt.term) { return '(mangler informasjon)'; }
  return Object.keys(KTObjekt).includes('term') ? KTObjekt.term : null;
};

const objektTilKode = KTObjekt => {
  if (!KTObjekt || !KTObjekt.kode) { throw new Error('Ukjent kode'); }
  return Object.keys(KTObjekt).includes('kode') ? KTObjekt.kode : null;
};

const finnEnkeltKodeFraListe = (kodeSomSkalFinnes, kodeverkListe) => (
  kodeverkListe.find(enkelt => enkelt.kode === kodeSomSkalFinnes) || undefined
);

const kodeTilTerm = (kode, muligeValg) => {
  const valgtKodeverkObjekt = muligeValg.find(item => objektTilKode(item) === kode);
  return valgtKodeverkObjekt && objektTilTerm(valgtKodeverkObjekt);
};

const termTilKode = (verdi, muligeValg) => {
  const valgtKodeverkObjekt = muligeValg.find(item => objektTilTerm(item) === verdi);
  return valgtKodeverkObjekt && objektTilKode(valgtKodeverkObjekt);
};

export {
  Koder,
  Form,
  objektTilTerm,
  objektTilKode,
  finnEnkeltKodeFraListe,
  kodeTilTerm,
  termTilKode,
};
