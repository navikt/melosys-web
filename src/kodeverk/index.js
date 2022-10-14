import * as AvsenderTyper from "./avsendertyper";
import * as Koder from "./koder";
import * as Form from "./form";
import * as Menypunkter from "./menypunkter";
import * as Feilmeldinger from "./feilmeldinger";
import * as Utils from "./utils";

const objektTilTermUtenFeilmelding = (KTObjekt) => {
  if (!KTObjekt || !KTObjekt.term) return null;
  return Object.keys(KTObjekt).includes("term") ? KTObjekt.term : null;
};

const objektTilTerm = (KTObjekt, defaultMelding = "(mangler informasjon)") =>
  objektTilTermUtenFeilmelding(KTObjekt) || defaultMelding;

const objektTilKodeUtenFeilmelding = (KTObjekt) => {
  if (!KTObjekt || !KTObjekt.kode) return null;
  return Object.keys(KTObjekt).includes("kode") ? KTObjekt.kode : null;
};

const objektTilKode = (KTObjekt) => {
  if (!KTObjekt || !KTObjekt.kode) {
    throw new Error("Ukjent kode");
  }
  return Object.keys(KTObjekt).includes("kode") ? KTObjekt.kode : null;
};

const kodeTilObjekt = (kode, muligeKoder) => muligeKoder.find((enkeltKode) => objektTilKode(enkeltKode) === kode);

const finnEnkeltKodeFraListe = (kodeSomSkalFinnes, kodeverkListe) =>
  kodeverkListe.find((enkelt) => enkelt.kode === kodeSomSkalFinnes) || undefined;

const erKodeIListe = (kodeSomSkalFinnes, kodeverkListe) =>
  finnEnkeltKodeFraListe(kodeSomSkalFinnes, kodeverkListe) !== undefined;

const kodeTilTerm = (kode, muligeValg) => {
  const valgtKodeverkObjekt = muligeValg.find((item) => objektTilKode(item) === kode);
  return valgtKodeverkObjekt && objektTilTerm(valgtKodeverkObjekt);
};

const termTilKode = (verdi, muligeValg) => {
  const valgtKodeverkObjekt = muligeValg.find((item) => objektTilTerm(item) === verdi);
  return valgtKodeverkObjekt && objektTilKode(valgtKodeverkObjekt);
};

function finnTermFraListe(kodetermListe, kode) {
  for (let i = 0, j = kodetermListe.length; i < j; i += 1) {
    if (kodetermListe[i].kode === kode) {
      return kodetermListe[i].term;
    }
  }
  return null;
}

function termFraNestedKTObject(nestedKTObject, kode) {
  const kodetermListe = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const kodeterm in nestedKTObject) {
    if (Object.prototype.hasOwnProperty.call(nestedKTObject, kodeterm)) {
      kodetermListe.push(...nestedKTObject[kodeterm]);
    }
  }
  return finnTermFraListe(kodetermListe, kode);
}

export {
  AvsenderTyper,
  Koder,
  Form,
  Menypunkter,
  Feilmeldinger,
  Utils,
  objektTilTerm,
  objektTilTermUtenFeilmelding,
  objektTilKode,
  objektTilKodeUtenFeilmelding,
  finnEnkeltKodeFraListe,
  erKodeIListe,
  kodeTilTerm,
  kodeTilObjekt,
  termTilKode,
  finnTermFraListe,
  termFraNestedKTObject,
};
