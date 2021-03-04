import { object, array } from "yup";

const VIRKSOMHET_KREVES = { melding: "Du må velge minst én virksomhet" };

const vurdering_virksomhet = object().shape({
  valgteVirksomheter: array().min(1).required(VIRKSOMHET_KREVES),
});

export { vurdering_virksomhet };
