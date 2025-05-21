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
          let messageStr = e.message;
          if (typeof e.message === "object" && e.message !== null) {
            if (typeof e.message.melding === "string") {
              messageStr = e.message.melding;
            } else if (typeof e.message._error === "string") {
              messageStr = e.message._error;
            } else {
              // Fallback for unexpected object structures
              messageStr = "Valideringsfeil";
            }
          }
          Utils._set(formErrors, e.path, messageStr);
        });
      } else {
        throw error;
      }
    }

    return formErrors;
  };
};

export { lagYupToReduxformErrorMapper };
