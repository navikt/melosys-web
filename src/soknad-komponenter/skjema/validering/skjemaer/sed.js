import * as Yup from 'yup';

const sed = Yup.object().shape({
  buc: Yup.string().required({ feilmelding: 'BUC kreves' }),
  land: Yup.string().required({ feilmelding: 'Land kreves' }),
  mottakerinstitusjon: Yup.string().required({ feilmelding: 'Mottaker institusjon kreves' }),
});

export { sed };
