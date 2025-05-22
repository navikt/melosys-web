import * as Utils from "../utils";

const lagYupToReduxformErrorMapper = (schema, settings) => {
  if (!schema) throw new Error("Schema kan ikke være falsy");

  return (values) => {
    const formErrors = {};

    try {
      schema.validateSync(values, { abortEarly: false, ...settings });
    } catch (error) {
      // Ensure it's a Yup-like validation error with an 'inner' array
      if (error && Array.isArray(error.inner) && error.inner.length > 0) {
        error.inner.forEach((e) => {
          // It's good practice to ensure 'e' is an object and has 'path' and 'message'
          if (e && typeof e.path !== "undefined" && typeof e.message !== "undefined") {
            let messageStr = e.message;
            if (typeof e.message === "object" && e.message !== null) {
              if (typeof e.message.melding === "string") {
                messageStr = e.message.melding;
              } else if (typeof e.message._error === "string") {
                messageStr = e.message._error;
              } else {
                messageStr = "Valideringsfeil"; // Fallback
              }
            }
            Utils._set(formErrors, e.path, messageStr);
          } else {
            // Log if an inner error doesn't have the expected structure
            console.error("Unexpected inner error structure in lagYupToReduxformErrorMapper:", e);
            // Utils._set(formErrors, '_general', 'En uventet valideringsfeil oppstod.');
          }
        });
      } else if (error && typeof error.path !== "undefined" && typeof error.message !== "undefined") {
        // Handle cases where it's a single validation error without 'inner'
        let messageStr = error.message;
        if (typeof error.message === "object" && error.message !== null) {
          if (typeof error.message.melding === "string") {
            messageStr = error.message.melding;
          } else if (typeof error.message._error === "string") {
            messageStr = error.message._error;
          } else {
            messageStr = "Valideringsfeil";
          }
        }
        Utils._set(formErrors, error.path, messageStr);
      } else {
        // Log the caught error if it doesn't fit Yup's ValidationError structure
        console.error(
          "Caught non-Yup error or Yup error without inner details in lagYupToReduxformErrorMapper:",
          error,
        );
        // formErrors._error = "En uventet feil oppstod under validering.";
        throw error; // Re-throw if we don't know how to handle it
      }
    }

    return formErrors;
  };
};

export { lagYupToReduxformErrorMapper };
