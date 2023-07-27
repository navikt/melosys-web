import { string, object, array } from "yup";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const VELG_OVERGANGSREGEL_MINST_1 = "Du må velge en overgangsregel";
const VELG_OVERGANGSREGEL_MAKS_1 = "Du kan kun velge en overgangsregel";

const harOvergangsregler = (lovvalgsbestemmelse) => {
  const grunnlag87 = [
    MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART87_8,
    MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART87A,
  ];

  return grunnlag87.includes(lovvalgsbestemmelse);
};

const vurder_utpeking = object().shape({
  fom: string().erGyldigDato().required(MAA_FYLLES_UT),
  tom: string().erGyldigDato().erEtterDatofelt("fom").required(MAA_FYLLES_UT),
  overgangsregelbestemmelser: array().when("lovvalgsbestemmelse", {
    is: (lovvalgsbestemmelse) => harOvergangsregler(lovvalgsbestemmelse),
    then: array().min(1, { _error: VELG_OVERGANGSREGEL_MINST_1 }).max(1, { _error: VELG_OVERGANGSREGEL_MAKS_1 }),
  }),
});

export default vurder_utpeking;
