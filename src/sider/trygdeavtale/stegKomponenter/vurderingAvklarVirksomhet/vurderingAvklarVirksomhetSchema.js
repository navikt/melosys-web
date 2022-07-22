import { object, string } from "yup";

const VIRKSOMHET_KREVES = { melding: "Du må velge én virksomhet" };

const vurdering_avklar_virksomhet = object().shape({
  virksomhet: string().required(VIRKSOMHET_KREVES),
});

export default vurdering_avklar_virksomhet;
