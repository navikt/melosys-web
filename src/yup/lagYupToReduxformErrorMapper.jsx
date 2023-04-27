import * as Utils from "../utils";

const lagYupToReduxformErrorMapper = (schema, settings) => {
  if (!schema) throw new Error("Schema kan ikke være falsy");

  return (values) => {
    const formErrors = {};

    try {
      schema.validateSync(values, { abortEarly: false, ...settings });
    } catch (error) {
      if (error.inner) {
        error.inner.forEach((e) => {
          Utils._set(formErrors, e.path, e.message);
        });
      } else {
        throw error;
      }
    }

    return formErrors;
  };
};

export { lagYupToReduxformErrorMapper };
