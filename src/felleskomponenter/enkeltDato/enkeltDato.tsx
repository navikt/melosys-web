import React from "react";

import { formatterDatoTilNorsk } from "../../utils/dato";

interface EnkeltDatoProps {
  dato?: string | null;
  visTidspunkt?: boolean;
}

/** EnkeltDato gjør det lettere å følge UU der datoer skal benyttes i tillegg til at
 * en konsekvent "-" vises der dato er ukjent eller ikke relevant.
 *
 * @param { props }  props object
 */
function EnkeltDato({ dato = "", visTidspunkt = false }: EnkeltDatoProps) {
  const lesbarDato = formatterDatoTilNorsk(dato, visTidspunkt);

  return dato ? <time dateTime={dato}>{lesbarDato}</time> : <>-</>;
}

export default EnkeltDato;
