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
            let valueToSet;
            if (typeof e.message === "object" && e.message !== null && typeof e.message.melding === "string") {
              // Custom message object with panel, undertittel, melding - preserve it
              valueToSet = e.message;
            } else if (typeof e.message === "object" && e.message !== null && typeof e.message._error === "string") {
              // Object like { _error: "message" } - preserve it (consistent with above)
              valueToSet = e.message;
            } else if (typeof e.message === "string") {
              // Already a string message
              valueToSet = e.message;
            } else {
              // Fallback for other types or unexpected objects
              console.warn("Unexpected e.message type in lagYupToReduxformErrorMapper, falling back:", e.message);
              valueToSet = "Valideringsfeil";
            }
            Utils._set(formErrors, e.path, valueToSet);
          } else {
            // Log if an inner error doesn't have the expected structure
            console.error("Unexpected inner error structure in lagYupToReduxformErrorMapper:", e);
            // Utils._set(formErrors, '_general', 'En uventet valideringsfeil oppstod.');
          }
        });
      } else if (error && typeof error.path !== "undefined" && typeof error.message !== "undefined") {
        // Handle cases where it's a single validation error without 'inner'
        let valueToSet;
        if (typeof error.message === "object" && error.message !== null && typeof error.message.melding === "string") {
          valueToSet = error.message;
        } else if (
          typeof error.message === "object" &&
          error.message !== null &&
          typeof error.message._error === "string"
        ) {
          valueToSet = error.message;
        } else if (typeof error.message === "string") {
          valueToSet = error.message;
        } else {
          console.warn(
            "Unexpected error.message type in lagYupToReduxformErrorMapper (single error), falling back:",
            error.message,
          );
          valueToSet = "Valideringsfeil";
        }
        Utils._set(formErrors, error.path, valueToSet);
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
