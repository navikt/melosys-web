import { object, string } from "yup";
import * as KV from "../../../../../kodeverk";
const { DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN } = KV.Feilmeldinger;

const vurdering_bekreftelse = object().shape({
  begrunnelseFritekst: string().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
});

export default vurdering_bekreftelse;
