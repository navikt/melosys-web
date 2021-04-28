import React from "react";
import PT from "prop-types";

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
function EnkeltDato(props: EnkeltDatoProps) {
  const { dato, visTidspunkt } = props;
  const lesbarDato = formatterDatoTilNorsk(dato, visTidspunkt);

  return dato ? <time dateTime={dato}>{lesbarDato}</time> : <>-</>;
}

EnkeltDato.propTypes = {
  dato: PT.string,
  visTidspunkt: PT.bool,
};

EnkeltDato.defaultProps = {
  dato: "",
  visTidspunkt: false,
};

export default EnkeltDato;
