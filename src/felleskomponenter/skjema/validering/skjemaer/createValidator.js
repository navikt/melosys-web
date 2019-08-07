import * as Utils from '../../../../utils';

const createValidator = (schema, settings) => values => {
  const formErrors = {};

  try {
    schema.validateSync(values, { abortEarly: false, ...settings });
    return {};
  } catch (errors) {
    errors.inner.forEach(error => {
      Utils._set(formErrors, error.path, error.message);
    });
  }

  return formErrors;
};

export { createValidator };
