import { KTObject } from '@navikt/melosys-kodeverk';


export function termFraKTObject(kodetermListe: KTObject[], kode: string): string | null {
  for (let i = 0, j = kodetermListe.length; i < j; i += 1) {
    if (kodetermListe[i].kode === kode) {
      return kodetermListe[i].term;
    }
  }
  return null;
}

export function termFraNestedKTObject(nestedKTObject: any, kode: string): string | null {
  const kodetermListe = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const kodeterm in nestedKTObject) {
    if (Object.prototype.hasOwnProperty.call(nestedKTObject, kodeterm)) {
      kodetermListe.push(...nestedKTObject[kodeterm]);
    }
  }
  return termFraKTObject(kodetermListe, kode);
}
