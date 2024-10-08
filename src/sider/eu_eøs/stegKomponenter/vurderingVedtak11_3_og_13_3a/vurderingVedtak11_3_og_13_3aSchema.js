import { object, string } from "yup";
import * as KV from "../../../../kodeverk";
import { MAA_FYLLES_UT } from "../../../../kodeverk/feilmeldinger";

const { DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN } = KV.Feilmeldinger;

const vurderingVedtak_11_3_og_13_3aSchema = object().shape({
  begrunnelseFritekst: string().nullable().max(4000, DU_KAN_IKKE_SKRIVE_MER_ENN_4000_TEGN),
  fom: string().when("korterePeriodeChecked", {
    is: true,
    then: string().erInnenforSoknadsperioden().erGyldigDato().required(MAA_FYLLES_UT),
  }),
  tom: string().when("korterePeriodeChecked", {
    is: true,
    then: string().erInnenforSoknadsperioden().erEtterDatofelt("fom").erGyldigDato().required(MAA_FYLLES_UT),
  }),
});

export default vurderingVedtak_11_3_og_13_3aSchema;
