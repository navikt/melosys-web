import { object, string, bool } from "yup";
import {
  DU_KAN_IKKE_SKRIVE_MER_ENN_462_TEGN,
  DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN,
} from "../../../../kodeverk/feilmeldinger";
import MKV from "../../../../melosyskodeverk";

const { KONV_EFTA_STORBRITANNIA_ART18_1 } = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia;
const VELG_MOTTAKERINSTITUSJON = { melding: "Velg mottakerinstitusjon" };

const artikkel16_anmodning = object().shape({
  kreverMottakerinstitusjon: bool().required(),
  mottakerinstitusjon: string().when("kreverMottakerinstitusjon", {
    is: true,
    then: string().required(VELG_MOTTAKERINSTITUSJON),
  }),
  fritekstSed: string().when("$bestemmelse", {
    is: KONV_EFTA_STORBRITANNIA_ART18_1,
    then: string().nullable().max(462, DU_KAN_IKKE_SKRIVE_MER_ENN_462_TEGN),
    otherwise: string().nullable().max(500, DU_KAN_IKKE_SKRIVE_MER_ENN_500_TEGN),
  }),
});

export default artikkel16_anmodning;
