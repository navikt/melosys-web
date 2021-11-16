import { object, string, bool } from "yup";

const VELG_MOTTAKERINSTITUSJON = { melding: "Velg mottakerinstitusjon" };
import { DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN } from "../../../kodeverk/feilmeldinger";

const artikkel16_anmodning = object().shape({
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjon: string().when("kreverMottakerinstitusjon", {
    is: true,
    then: string().required(VELG_MOTTAKERINSTITUSJON),
  }),
  fritekstSed: string().nullable().max(500, DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN),
});

export default artikkel16_anmodning;
