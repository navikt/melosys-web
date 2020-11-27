import { KTObject } from '@navikt/melosys-kodeverk';


export function termFraKTObject(kodetermListe: KTObject[], kode: string): string | null {
  for (let kodeterm of kodetermListe) {
    if (kodeterm.kode === kode) {
      return kodeterm.term;
    }
  }
  return null;
}

export function termFraNestedKTObject(nestedKTObject: any, kode: string): string | null {
  const kodetermListe = [];
  for (let kodeterm in nestedKTObject) {
    kodetermListe.push(...nestedKTObject[kodeterm]);
  }
  return termFraKTObject(kodetermListe, kode);
}
