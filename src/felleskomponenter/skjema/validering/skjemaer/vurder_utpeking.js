import { string, object } from 'yup';

const TAST_INN_DATO = { melding: 'Tast inn dato' };
const SKRIV_INN_EN_GYLDIG_DATO = { melding: 'Skriv inn en gyldig dato' };

const vurder_utpeking = object().shape({
  fom: string()
    .erGyldigDato(SKRIV_INN_EN_GYLDIG_DATO)
    .required(TAST_INN_DATO),
  tom: string()
    .erGyldigDato(SKRIV_INN_EN_GYLDIG_DATO)
    .required(TAST_INN_DATO),
});

export { vurder_utpeking };
