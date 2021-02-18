import { object, string, bool } from "yup";
import * as Utils from "../../utils";

const NOE_SKJEDDE = { melding: "Noe skjedde" };

function manglerObligatoriskeFelt(representantnummer, selvbetalende, organisasjonsnummer) {
  if (!representantnummer) return true;
  if (!/^\d+$/.test(representantnummer)) return true;
  if (!selvbetalende) {
    return !Utils.organisasjon.erOrgnrGyldig(organisasjonsnummer);
  }
  return false;
}

const vurdering_representant = object().shape({
  representantnummer: string(),
  selvbetalende: bool(),
  organisasjonsnummer: string().nullable(),
  kontaktperson: string().nullable(),
  alleObligatoriskeFeltFyltUt: string().when(["representantnummer", "selvbetalende", "organisasjonsnummer"], {
    is: manglerObligatoriskeFelt,
    then: string().required(NOE_SKJEDDE),
  }),
});

export { vurdering_representant };
