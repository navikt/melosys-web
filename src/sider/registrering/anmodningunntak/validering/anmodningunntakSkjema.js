import * as Yup from 'yup';
import * as Utils from '../../../../utils';

const FRITEKST_PAKREVD = { feilmelding: 'Begrunnelse for endring av periode er påkrevd' };
const STARTDATO_PAKREVD = { feilmelding: 'Startdato er påkrevd' };
const SLUTTDATO_PAKREVD = { feilmelding: 'Sluttdato er påkrevd' };

const gyldigPeriodeTest = {
  name: 'Gyldig periode',
  message: { feilmelding: 'Periode må være gyldig' },
  test() {
    const { fom, tom } = this.parent;
    return Utils.dato.erGyldigPeriode(fom, tom);
  },
};

const gyldigDatoTest = navn => ({
  name: `Gyldig ${navn}`,
  message: { feilmelding: `Gyldig ${navn} er påkrevd` },
  test: dato => Utils.dato.vaskInputDato(dato),
});

export const delvisInnvilgelseSkjema = Yup.object().shape({
  fom: Yup.string()
    .test(gyldigPeriodeTest)
    .test(gyldigDatoTest('startdato'))
    .required(STARTDATO_PAKREVD),
  tom: Yup.string()
    .test(gyldigPeriodeTest)
    .test(gyldigDatoTest('sluttdato'))
    .required(SLUTTDATO_PAKREVD),
  fritekst: Yup.string()
    .required(FRITEKST_PAKREVD),
});

export const avslagSkjema = Yup.object().shape({
  fritekst: Yup.string()
    .required(FRITEKST_PAKREVD),
});
