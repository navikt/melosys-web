import { boolean, object, string } from "yup";
import * as KV from "../../../../../kodeverk";

const { MAA_FYLLES_UT } = KV.Feilmeldinger;
const ARBEIDSLAND_FELT_KREVES = { melding: "Du må velge arbeidsland" };
const TRYGDEDEKNING_FELT_KREVES = { melding: "Du må velge trygdedekning" };

const vurdering_inngang = object().shape({
  fom: string().erGyldigDato().required(MAA_FYLLES_UT),
  tom: string().erGyldigDato().erEtterDatofelt("fom").nullable(),
  land: string().required(ARBEIDSLAND_FELT_KREVES),
  trygdedekning: string().required(TRYGDEDEKNING_FELT_KREVES).nullable(),
  inkluderSiste5Aar: boolean().nullable(),
});

export default vurdering_inngang;
