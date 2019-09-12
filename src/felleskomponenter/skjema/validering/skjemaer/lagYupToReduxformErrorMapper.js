import * as Utils from '../../../../utils';

const lagYupToReduxformErrorMapper = (schema, settings) => {
  if (!schema) throw new Error('Schema kan ikke være falsy');

  return values => {
    const formErrors = {};

    try {
      schema.validateSync(values, { abortEarly: false, ...settings });
    } catch (errors) {
      errors.inner.forEach(error => {
        Utils._set(formErrors, error.path, error.message);
      });
    }

    return formErrors;
  };
};

export { lagYupToReduxformErrorMapper };
