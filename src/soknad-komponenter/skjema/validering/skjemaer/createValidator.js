const createValidator = schema => (values, settings) => {
  try {
    schema.validateSync(values, { abortEarly: false, ...settings });
    return {};
  } catch (e) {
    return e.inner.reduce((errors, err) => ({
      ...errors,
      [err.path]: err.message,
    }), {});
  }
};

export { createValidator };
