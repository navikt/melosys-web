import { object, string } from "yup";
import * as KV from "../../../../../kodeverk";

const { MAA_FYLLES_UT, VELG_LAND } = KV.Feilmeldinger;

const soknadsperiode = object().shape({
  fom: string().erGyldigDato().required(MAA_FYLLES_UT),
  tom: string().erGyldigDato().erEtterDatofelt("fom").nullable(),
});

export default soknadsperiode;
