import { object, string } from "yup";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const LAND_FELT = { melding: "Du må velge land" };

const vurdering_start = (sakstype) =>
  object().shape({
    fom: string().erGyldigDato().required(MAA_FYLLES_UT),
    tom: string().erGyldigDato().erEtterDatofelt("fom").nullable(),
    land: string()
      .required(LAND_FELT)
      .test("landValidering", "Ikke gyldig land", (value) => {
        return !(
          sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE &&
          (value === MKV.Koder.landkoder.FR || value === MKV.Koder.landkoder.IT)
        );
      }),
  });

export default vurdering_start;
