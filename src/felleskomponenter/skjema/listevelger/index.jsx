import PT from "prop-types";
import { Field, FieldArray } from "redux-form";
import classNames from "classnames";

import * as MPT from "../../../proptypes";

import ListevelgerEnkelt from "./listevelgerEnkelt";
import ListevelgerFlervalg from "./listevelgerFlervalg";

import "./listevelger.less";

/** Listevelgeren tillater både én enkeltliste eller en array hvor
 * brukeren kan legge til flere valg. Hvilken av disse som skal benyttes
 * styres av multiListe-prop som gis til komponenten.
 *
 * Komponenten forventer en array av strings for å vise listevalg. Det betyr at
 * kodeverk-baserte objekter må reduces.
 */
function Listevelger({
  feltNavn,
  className = "",
  gruppe = false,
  muligeValg = [],
  tillatFritekst = false,
  disabled = false,
  onChange,
  ...rest
}) {
  return (
    <div className={classNames("listevelger", className)}>
      {gruppe ? (
        <FieldArray
          name={feltNavn}
          multiListe={gruppe}
          component={ListevelgerFlervalg}
          muligeValg={muligeValg}
          tillatFritekst={tillatFritekst}
          disabled={disabled}
          onChange={onChange}
          {...rest}
        />
      ) : (
        <Field
          name={feltNavn}
          component={ListevelgerEnkelt}
          muligeValg={muligeValg}
          tillatFritekst={tillatFritekst}
          disabled={disabled}
          onChange={onChange}
          {...rest}
        />
      )}
    </div>
  );
}

Listevelger.propTypes = {
  feltNavn: PT.string.isRequired,
  className: PT.string,
  gruppe: PT.bool,
  onChange: PT.func,
  muligeValg: PT.arrayOf(MPT.Kodeverk),
  tillatFritekst: PT.bool,
  disabled: PT.bool,
};

export default Listevelger;
