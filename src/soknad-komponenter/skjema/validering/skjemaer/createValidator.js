const createValidator = schema => values => {
  try {
    schema.validateSync(values, { abortEarly: false });
    return {};
  } catch (e) {
    return e.inner.reduce((errors, err) => ({
      ...errors,
      [err.path]: err.message,
    }), {});
  }
};

export { createValidator };
