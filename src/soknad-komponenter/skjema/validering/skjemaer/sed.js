import * as Yup from 'yup';

const sed = Yup.object().shape({
  buc: Yup.string().required('BUC kreves'),
  land: Yup.string().required('Land kreves'),
  mottakerinstitusjon: Yup.string().required('Mottaker institusjon kreves'),
});

export { sed };
