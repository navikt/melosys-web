const logInfo = info => {
  window.frontendlogger.info({
    info,
    stack: info.stack,
  });
};


const logWarn = warn => {
  window.frontendlogger.warn({
    warn,
    stack: warn.stack,
  });
};

const logError = error => {
  window.frontendlogger.error({
    error,
    stack: error.stack,
  });
};

export { logError as error, logInfo as info, logWarn as warn };
