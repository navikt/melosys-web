import { object, string } from "yup";
import * as KV from "../../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurdering_vedtak = object().shape({
  fom: string().erGyldigDato().erInnenforSoknadsperioden().required(MAA_FYLLES_UT),
  tom: string().erGyldigDato().erInnenforSoknadsperioden().erEtterDatofelt("fom").required(MAA_FYLLES_UT),
});

export default vurdering_vedtak;
