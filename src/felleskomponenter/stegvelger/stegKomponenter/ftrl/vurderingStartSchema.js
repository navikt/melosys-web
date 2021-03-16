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

function erPeriodeGyldig(tom) {
  const fom = this.options.parent.fom;
  if (!erDatoGyldig(fom) || !erDatoGyldig(tom)) return true;
  return !fom || !tom || Utils.dato.erGyldigPeriode(fom, tom);
}

const gyldigPeriodeTest = {
  name: "Gyldig periode",
  message: "Tidligere enn f.o.m.-dato",
  test: erPeriodeGyldig,
};

const vurdering_start = object().shape({
  fom: string().test(gyldigDatoTest).required(FOM_FELT_KREVES),
  tom: string().test(gyldigDatoTest).test(gyldigPeriodeTest).nullable(),
  land: string().required(ARBEIDSLAND_FELT_KREVES),
  trygdedekning: string().required(TRYGDEDEKNING_FELT_KREVES),
});

export default vurdering_start;
