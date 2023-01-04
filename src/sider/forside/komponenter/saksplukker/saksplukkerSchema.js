import { object, string } from "yup";
import * as KV from "../../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

export const saksplukker = object().shape({
  sakstype: string().required(MAA_FYLLES_UT).nullable(),
  sakstema: string().required(MAA_FYLLES_UT).nullable(),
  behandlingstema: string().required(MAA_FYLLES_UT).nullable(),
});

export default saksplukker;
