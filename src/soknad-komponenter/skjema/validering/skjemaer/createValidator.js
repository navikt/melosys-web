/* eslint-disable */
const createValidator = (schema, config = {}) => values => {
  config.abortEarly = config.abortEarly || false;

  try {
    schema.validateSync(values, config);
    return {};
  } catch (e) {
    return e.inner.reduce((errors, err) => ({
      ...errors,
      [err.path]: err.message,
    }), {});
  }
};
/* eslint-enable */

export { createValidator };
