import { object, string, array } from "yup";
import * as Utils from "../../../../../utils";

const gyldigPeriodeTest = {
  name: "Gyldig periode",
  message: "Periode må være gyldig",
  test() {
    const { fom, tom } = this.parent;
    return Utils.dato.erGyldigPeriode(fom, tom);
  },
};

const gyldigDatoTest = (navn) => ({
  name: `Gyldig ${navn}`,
  message: `Gyldig ${navn} er påkrevd`,
  test: (dato) => Utils.dato.vaskInputDato(dato),
});

export const endrePeriodeSkjema = object().shape({
  fom: string().test(gyldigPeriodeTest).test(gyldigDatoTest("startdato")).required("Startdato er påkrevd"),
  tom: string().test(gyldigPeriodeTest).test(gyldigDatoTest("sluttdato")).required("Sluttdato er påkrevd"),
  fritekst: string().when("$fritekstPakrevd", {
    is: (fritekstPakrevdVal) => fritekstPakrevdVal === true,
    then: (schema) => schema.required("Begrunnelse for endring av periode er påkrevd"),
  }),
  begrunnelse: string().when("$begrunnelsePakrevd", {
    is: (begrunnelsePakrevdVal) => begrunnelsePakrevdVal === true,
    then: (schema) => schema.required("Begrunnelse for endret periode er påkrevd"),
  }),
});

export const ikkeGodkjentBegrunnelseSkjema = object().shape({
  begrunnelseKoder: array().of(string()).min(1, "Begrunnelse for avslag er påkrevd"),
  begrunnelseFritekst: string().when("$fritekstPakrevd", {
    is: (fritekstPakrevdVal) => fritekstPakrevdVal === true,
    then: (schema) => schema.required("Fritekstfelt er påkrevd"),
  }),
});
