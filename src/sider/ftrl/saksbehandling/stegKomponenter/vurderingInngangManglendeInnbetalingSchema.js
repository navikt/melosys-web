import { object, string } from "yup";
import * as KV from "../../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurdering_inngang_manglende_innbetaling = object().shape({
  fullstendigManglendeInnbetaling: string().required(MAA_FYLLES_UT),
});

export default vurdering_inngang_manglende_innbetaling;
