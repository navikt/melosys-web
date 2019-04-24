import * as Yup from 'yup';

const saksopplysninger = Yup.object().shape({
  foretakUtland: Yup.array().of(Yup.object().shape({
    adresse: Yup.object().shape({
      postnummer: Yup.string().required('Postnummer kreves for Arbeidsgiver i Utlandet'),
      landkode: Yup.string().required('Land kreves for Arbeidsgiver i Utlandet'),
    }),
  })),
  arbeidUtland: Yup.array().of(Yup.object().shape({
    adresse: Yup.object().shape({
      postnummer: Yup.string().required('Postnummer kreves for Arbeidssted i Utlandet'),
      landkode: Yup.string().required('Land kreves for Arbeidssted i Utlandet'),
    }),
  })),
});

export { saksopplysninger };
