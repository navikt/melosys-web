import { object, string, bool } from "yup";

const VELG_MOTTAKERINSTITUSJON = { melding: "Velg mottakerinstitusjon" };
const VELG_A008_FORMAAL = { melding: "Velg formål med A008" };

export const vurdering_videresend = object().shape({
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjon: string().when("kreverMottakerinstitusjon", {
    is: true,
    then: (schema) => schema.required(VELG_MOTTAKERINSTITUSJON),
  }),
  a008Formaal: string().required(VELG_A008_FORMAAL),
  ytterligereInformasjonSed: string().nullable(),
});

export default vurdering_videresend;
