import { object, string } from "yup";
import * as KV from "../../../../kodeverk";
import { MAA_FYLLES_UT } from "../../../../kodeverk/feilmeldinger";

const { DU_KAN_IKKE_SKRIVE_MER_ENN_10000_TEGN } = KV.Feilmeldinger;

const vurderingVedtak_11_3_og_13_3aSchema = object().shape({
  lovvalgsbestemmelse: string().required(),
  begrunnelseFritekst: string().max(10000, DU_KAN_IKKE_SKRIVE_MER_ENN_10000_TEGN),
  fom: string().when("korterePeriodeChecked", {
    is: true,
    then: (schema) => schema.erInnenforSoknadsperioden().erGyldigDato().required(MAA_FYLLES_UT),
  }),
  tom: string().when("korterePeriodeChecked", {
    is: true,
    then: (schema) => schema.erInnenforSoknadsperioden().erEtterDatofelt("fom").erGyldigDato().required(MAA_FYLLES_UT),
  }),
});

export default vurderingVedtak_11_3_og_13_3aSchema;
