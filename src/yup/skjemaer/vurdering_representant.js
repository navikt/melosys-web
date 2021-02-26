import { object, string, bool } from "yup";

const REPRESENTANT_FELT_MANGLER = { melding: "Fyll ut representantnummer" };
const ORGNUMMER_FELT_MANGLER = { melding: "Fyll ut organisasjonsnummer" };
const ORGNUMMER_UGYLDIG = { melding: "Ugyldig organisasjonsnummer" };

const gyldigRepresentantnummerTest = {
  name: "Gyldig representantnummer",
  message: "Ugyldig representantnummer",
  test: (repnr) => /^\d+$/.test(repnr),
};

const vurdering_representant = object().shape({
  representantnummer: string().test(gyldigRepresentantnummerTest).required(REPRESENTANT_FELT_MANGLER),
  selvbetalende: bool().required(),
  organisasjonsnummer: string()
    .erOrgnr(ORGNUMMER_UGYLDIG)
    .when("selvbetalende", {
      is: (selvbetalende) => !selvbetalende,
      then: string().required(ORGNUMMER_FELT_MANGLER),
    }),
  kontaktperson: string().nullable(),
});

export { vurdering_representant };
