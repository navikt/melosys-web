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
  organisasjonsnummer: string().when("selvbetalende", {
    is: false,
    then: string().erOrgnr(ORGNUMMER_UGYLDIG).required(ORGNUMMER_FELT_MANGLER),
  }),
  kontaktperson: string().nullable(),
});

export default vurdering_representant;
