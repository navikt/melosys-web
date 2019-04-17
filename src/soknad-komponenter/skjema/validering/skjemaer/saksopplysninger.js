import * as Yup from 'yup';

const saksopplysninger = Yup.object().shape({
  oppgittAdresseGatenavn: Yup.string().required('Adresse er required'),
});

export { saksopplysninger };
