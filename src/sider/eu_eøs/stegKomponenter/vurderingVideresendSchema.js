import { object, string, bool } from "yup";

import {
  DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN,
  DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN,
} from "../../../kodeverk/feilmeldinger";

const VELG_MOTTAKERINSTITUSJON = { melding: "Velg mottakerinstitusjon" };

export const vurdering_videresend = object().shape({
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjon: string().when("kreverMottakerinstitusjon", {
    is: true,
    then: (schema) => schema.required(VELG_MOTTAKERINSTITUSJON),
  }),
  ytterligereInformasjonSed: string().nullable().max(500, DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN),
  orienteringsbrevFritekst: string().nullable().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
});

export default vurdering_videresend;
