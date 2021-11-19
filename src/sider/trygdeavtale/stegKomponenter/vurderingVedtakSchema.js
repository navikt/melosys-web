import { object, string, bool } from "yup";
import * as KV from "../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;

const vurdering_vedtak = object().shape({
  lovvalgsperiodeFom: string().erGyldigDato().required(MAA_FYLLES_UT),
  lovvalgsperiodeTom: string().erGyldigDato().erEtterDatofelt("lovvalgsperiodeFom").required(MAA_FYLLES_UT),
  fritekstInnledning: string().nullable(),
  fritekstBegrunnelse: string().nullable(),
  kopiTilArbeidsgiver: bool().nullable(),
});

export default vurdering_vedtak;
