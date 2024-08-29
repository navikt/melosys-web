import { object, string } from "yup";
import * as KV from "../../../../kodeverk";

const { DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN } = KV.Feilmeldinger;

const vurderingVedtak_11_3_og_13_3a = object().shape({
  begrunnelseFritekst: string().nullable().max(1500, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
});

export default vurderingVedtak_11_3_og_13_3a;
