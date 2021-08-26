import { object, array } from "yup";

const VIRKSOMHET_KREVES = { melding: "Du må velge minst én virksomhet" };

const vurdering_avklar_virksomhet = object().shape({
  virksomheter: array().min(1).required(VIRKSOMHET_KREVES),
});

export default vurdering_avklar_virksomhet;
