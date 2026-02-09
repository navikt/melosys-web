import { array, lazy, object } from "yup";
import {
  lagSkatteforholdShape,
  lagInntektskildeShape,
  kreverInntektskilder,
} from "../vurderingTrygdeavgiftSchemaFelles";

const PERIODE_NAVN = "helseutgiftDekkesPeriode";
const FEILMELDING = { melding: "Utenfor helseutgift dekkes periode" };

export default object().shape({
  skatteforholdsperioder: array().min(1).of(lagSkatteforholdShape(PERIODE_NAVN, FEILMELDING)),
  inntektskilder: lazy((_value, options) => {
    if (kreverInntektskilder(true, options)) {
      return array()
        .min(1)
        .of(lagInntektskildeShape(PERIODE_NAVN, FEILMELDING, false));
    }
    return array();
  }),
});
