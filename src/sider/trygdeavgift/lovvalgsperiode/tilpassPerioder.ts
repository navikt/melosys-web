import * as Utils from "../../../utils";

export interface Periodegrenser {
  fom: string;
  tom: string;
}

interface Skjemaperiode {
  fomDato?: string;
  tomDato?: string;
}

// Perioder på den gamle grensen følger den nye; øvrige klippes, og perioder helt utenfor fjernes.
export function tilpassPerioderTilNyeGrenser<T extends Skjemaperiode>(
  perioder: T[],
  forrige: Periodegrenser,
  ny: Periodegrenser,
): T[] {
  return perioder.flatMap((periode) => {
    const fom = Utils.dato.formatterDatoTilISO(periode.fomDato, null);
    const tom = Utils.dato.formatterDatoTilISO(periode.tomDato, null);
    if (!fom || !tom) return [periode];

    const nyFom = fom === forrige.fom || fom < ny.fom ? ny.fom : fom;
    const nyTom = tom === forrige.tom || tom > ny.tom ? ny.tom : tom;
    if (nyFom > nyTom) return [];

    return [
      {
        ...periode,
        fomDato: Utils.dato.formatterDatoTilNorsk(nyFom),
        tomDato: Utils.dato.formatterDatoTilNorsk(nyTom),
      },
    ];
  });
}
