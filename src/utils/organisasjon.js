const erOrgnrLengde = verdi => RegExp(/^\d{9,9}$/).test(verdi);

/** Beregning av orgnr bygger på mod11.
 * @link https://no.wikipedia.org/wiki/MOD11
 * @param verdi
 * @returns {boolean}
 */
const erOrgnrGyldig = verdi => {
  if (!verdi) { return false; }
  const vekt = [2, 3, 4, 5, 6, 7, 2, 3];
  const bakersteOffset = 1; // Siste tall i orgnr er kontrollnr, så begynn på nest siste og regn mot venstre.

  const sumForMod = vekt
    .reduce((samling, vektSiffer, indeks) => {
      const enkeltSiffer = parseInt(verdi.charAt((verdi.length - 1) - bakersteOffset - indeks), 10);
      return samling + (enkeltSiffer * vektSiffer);
    }, 0);

  let Q1 = (11 - (sumForMod % 11));
  if (Q1 === 11) { Q1 = 0; }

  return (parseInt(verdi.charAt(8), 10) === Q1);
};

export {
  erOrgnrLengde,
  erOrgnrGyldig,
};
