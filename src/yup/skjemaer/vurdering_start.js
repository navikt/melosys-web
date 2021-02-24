import { object, string } from "yup";
import * as Utils from "../../utils";

const FOM_FELT_KREVES = { melding: "Du må fylle inn dato" };
const ARBEIDSLAND_FELT_KREVES = { melding: "Du må velge arbeidsland" };
const TRYGDEDEKNING_FELT_KREVES = { melding: "Du må velge trygdedekning" };

const gyldigDatoTest = {
  name: "Gyldig dato",
  message: "Skriv inn en gyldig dato",
  test: (dato) => (Utils._isEmpty(dato) ? true : Utils.dato.vaskInputDato(dato)),
};
const vurdering_start = object().shape({
  fom: string().test(gyldigDatoTest).required(FOM_FELT_KREVES),
  tom: string().test(gyldigDatoTest).nullable(),
  land: string().required(ARBEIDSLAND_FELT_KREVES),
  trygdedekning: string().required(TRYGDEDEKNING_FELT_KREVES),
});

export { vurdering_start };
