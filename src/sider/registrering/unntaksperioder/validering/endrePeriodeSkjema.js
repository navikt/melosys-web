import * as Yup from 'yup';
import * as Utils from '../../../../utils';

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

export const endrePeriodeSkjema = Yup.object().shape({
  fom: Yup.string()
    .test(gyldigPeriodeTest)
    .test(gyldigDatoTest('startdato'))
    .required({ feilmelding: 'Startdato er påkrevd' }),
  tom: Yup.string()
    .test(gyldigPeriodeTest)
    .test(gyldigDatoTest('sluttdato'))
    .required({ feilmelding: 'Sluttdato er påkrevd' }),
  fritekst: Yup.string()
    .when('$fritekstPakrevd', {
      is: true,
      then: Yup.string().required({ feilmelding: 'Begrunnelse for endring av periode er påkrevd' }),
    }),
  begrunnelse: Yup.string()
    .when('$begrunnelsePakrevd', {
      is: true,
      then: Yup.string().required({ feilmelding: 'Begrunnelse for endret periode er påkrevd' }),
    }),
});
