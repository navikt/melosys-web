import { object, string, array } from "yup";
import * as KV from "../../../../kodeverk";

const { MAA_FYLLES_UT, SKRIV_INN_GYLDIG_ORGNR_FNR_DNR } = KV.Feilmeldinger;

const fullmektige_schema = object().shape({
  fullmektige: array().of(
    object().shape({
      ident: string()
        .erFnrEllerDnrEllerOrgnrTolererEttMellomrom(SKRIV_INN_GYLDIG_ORGNR_FNR_DNR)
        .required(MAA_FYLLES_UT),
      fullmakter: array().of(string()).min(1, "Du må velge minst én fullmakt"),
      type: string().required(MAA_FYLLES_UT),
      feil: string()
        .test("Kan ikke ha aktiv feil", { message: "Kan ikke ha aktiv feil" }, (feil) => !feil)
        .nullable(),
    })
  ),
});

export default fullmektige_schema;
