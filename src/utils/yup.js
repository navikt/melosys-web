import { addMethod, object, array, string, date, bool } from 'yup';

import * as Utils from './';

/* eslint-disable */
addMethod(object, 'uniqueProperty', function (propertyName, message) {
  return this.test('unique', message, function (value) {
    if (!value || !value[propertyName]) {
      return true;
    }

    const { path } = this;
    const options = [...this.parent];
    const currentIndex = options.indexOf(value);

    const subOptions = options.slice(0, currentIndex);

    if (subOptions.some((option) => option[propertyName] === value[propertyName])) {
      throw this.createError({
        path: `${path}.${propertyName}`,
        message,
      });
    }

    return true;
  });
});

addMethod(string, 'validDate', function (message) {
  return this.test('valid', message, function(value) {
    const { path } = this;

    if (!Utils.dato.vaskInputDato(value)) {
      throw this.createError({
        path,
        message,
      });
    }

    return true;
  });
});
/* eslint-enable */


export {
  object,
  array,
  string,
  date,
  bool,
};
