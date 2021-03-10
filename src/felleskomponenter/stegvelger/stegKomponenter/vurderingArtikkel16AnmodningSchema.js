import { object, string, bool } from "yup";

const VELG_MOTTAKERINSTITUSJON = { melding: "Velg mottakerinstitusjon" };

const artikkel16_anmodning = object().shape({
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjon: string().when("kreverMottakerinstitusjon", {
    is: true,
    then: string().required(VELG_MOTTAKERINSTITUSJON),
  }),
});

export default artikkel16_anmodning;
