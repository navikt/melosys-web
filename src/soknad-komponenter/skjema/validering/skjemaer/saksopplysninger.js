import * as Yup from 'yup';

const saksopplysninger = Yup.object().shape({
  foretakUtland: Yup.array().of(Yup.object().shape({
    adresse: Yup.object().shape({
      postnummer: Yup.string().required('Postnummer kreves for Arbeidsgiver i Utlandet'),
    }),
  })),
});

export { saksopplysninger };
