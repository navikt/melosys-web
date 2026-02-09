import { array, lazy, object } from "yup";
import {
  lagSkatteforholdShape,
  lagInntektskildeShape,
  kreverInntektskilder,
} from "../vurderingTrygdeavgiftSchemaFelles";

const PERIODE_NAVN = "avgiftspliktigeperiode";
const FEILMELDING = { melding: "Utenfor medlemskaps-/lovvalgsperioden" };

export default object().shape({
  skatteforholdsperioder: array().when(["$erÅpenSluttDato"], {
    is: (erÅpenSluttDato: any) => !erÅpenSluttDato,
    then: (schema) => schema.min(1).of(lagSkatteforholdShape(PERIODE_NAVN, FEILMELDING)),
  }),
  inntektskilder: lazy((_value, options) =>
    array().when(["$medlemskapsTypeErPliktig", "$erÅpenSluttDato"], {
      is: (medlemskapsTypeErPliktig: any, erÅpenSluttDato: any) =>
        !erÅpenSluttDato && kreverInntektskilder(medlemskapsTypeErPliktig, options),
      then: (schema) => schema.min(1).of(lagInntektskildeShape(PERIODE_NAVN, FEILMELDING, true)),
    }),
  ),
});
