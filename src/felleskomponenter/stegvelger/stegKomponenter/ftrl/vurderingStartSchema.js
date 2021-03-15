import { object, string } from "yup";
import * as Utils from "../../../../utils";

const FOM_FELT_KREVES = { melding: "Må fylles ut" };
const ARBEIDSLAND_FELT_KREVES = { melding: "Du må velge arbeidsland" };
const TRYGDEDEKNING_FELT_KREVES = { melding: "Du må velge trygdedekning" };

const erDatoGyldig = (dato) => (Utils._isEmpty(dato) ? true : Utils.dato.vaskInputDato(dato));

const gyldigDatoTest = {
  name: "Gyldig dato",
  message: "Skriv inn en gyldig dato",
  test: erDatoGyldig,
};

const erPeriodeGyldig = (fom, tom) => {
  if (!erDatoGyldig(fom) || !erDatoGyldig(tom)) return true;
  return !fom || !tom || Utils.dato.erGyldigPeriode(fom, tom);
};

const vurdering_start = object().shape({
  fom: string().test(gyldigDatoTest).required(FOM_FELT_KREVES),
  tom: string()
    .test(gyldigDatoTest)
    .when("fom", (fom, schema) => {
      return schema.test({
        test: (tom) => erPeriodeGyldig(fom, tom),
        message: "Tidligere enn f.o.m.-dato",
      });
    })
    .nullable(),
  land: string().required(ARBEIDSLAND_FELT_KREVES),
  trygdedekning: string().required(TRYGDEDEKNING_FELT_KREVES),
});

export default vurdering_start;
