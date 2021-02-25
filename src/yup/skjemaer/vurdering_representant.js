import { object, string, bool } from "yup";
import * as Utils from "../../utils";

const REPRESENTANT_FELT_MANGLER = { melding: "Fyll ut representantnummer" };
const ORGNUMMER_FELT_MANGLER = { melding: "Fyll ut organisasjonsnummer" };

const gyldigRepresentantnummerTest = {
  name: "Gyldig representantnummer",
  message: "Ugyldig representantnummer",
  test: (repnr) => /^\d+$/.test(repnr),
};

const gyldigOrganisasjonsnummerTest = {
  name: "Gyldig organisasjonsnummer",
  message: "Ugyldig organisasjonsnummer",
  test: (orgnr) => Utils.organisasjon.erOrgnrGyldig(orgnr),
};

const vurdering_representant = object().shape({
  representantnummer: string().test(gyldigRepresentantnummerTest).required(REPRESENTANT_FELT_MANGLER),
  selvbetalende: bool().required(),
  organisasjonsnummer: string()
    .test(gyldigOrganisasjonsnummerTest)
    .when("selvbetalende", {
      is: (selvbetalende) => !selvbetalende,
      then: string().required(ORGNUMMER_FELT_MANGLER),
    }),
  kontaktperson: string().nullable(),
});

export { vurdering_representant };
