import { object, string, array } from "yup";
import * as KV from "../../../../kodeverk";

const { MAA_FYLLES_UT, SKRIV_INN_GYLDIG_ORGNR_FNR_DNR } = KV.Feilmeldinger;
const KAN_IKKE_HA_AKTIV_FEIL = { melding: "Kan ikke ha aktiv feil" };
const UNIKE_IDENTER = { melding: "Org.nr. eller f.nr./d-nr. kan ikke være identiske" };

const unikeIdenter = () => ({
  name: "unikeIdenter",
  message: UNIKE_IDENTER,
  test: (value, { options }) => {
    const alleIdenter = options.from[1]?.value?.fullmektige?.map((f) => f?.ident) ?? [];
    const harDuplikater = new Set(alleIdenter).size !== alleIdenter.length;
    return !harDuplikater;
  },
});

const fullmektige_schema = object().shape({
  fullmektige: array().of(
    object().shape({
      ident: string()
        .erFnrEllerDnrEllerOrgnrTolererEttMellomrom(SKRIV_INN_GYLDIG_ORGNR_FNR_DNR)
        .test(unikeIdenter())
        .required(MAA_FYLLES_UT),
      fullmakter: array().of(string()).min(1, "Du må velge minst én fullmakt"),
      type: string().required(MAA_FYLLES_UT),
      feil: string()
        .test("Kan ikke ha aktiv feil", { message: KAN_IKKE_HA_AKTIV_FEIL }, (feil) => !feil)
        .nullable(),
    })
  ),
});

export default fullmektige_schema;
