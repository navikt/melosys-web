import { mixed, addMethod, object, array, string, date, bool, lazy, number } from 'yup';

import * as Utils from './';
import * as Person from '../felleskomponenter/skjema/validering/generisk/person';
import * as Organisasjon from '../felleskomponenter/skjema/validering/generisk/organisasjon';

/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

addMethod(object, 'uniqueProperty', function (propertyName, message) {
  return this.test('unique', message, function (value) {
    if (!value || !value[propertyName]) {
      return true;
    }

    const { path } = this;
    const options = [...this.parent];
    const currentIndex = options.indexOf(value);

    const subOptions = options.slice(0, currentIndex);

    if (subOptions.some(option => option[propertyName] === value[propertyName])) {
      throw this.createError({
        path: `${path}.${propertyName}`,
        message,
      });
    }

    return true;
  });
});

addMethod(string, 'erGyldigDato', function(message) {
  return this.test('er gyldig dato', message, function(value) {
    return Boolean(Utils.dato.vaskInputDato(value));
  });
});

addMethod(string, 'periodeErGyldig', function (message) {
  return this.test('periode er gyldig', message, function(value) {
    const { lovvalgsperiode } = this.options.context;

    if (!lovvalgsperiode) return false;

    return Utils.dato.erIPeriode(lovvalgsperiode.fomDato, lovvalgsperiode.tomDato, Utils.dato.formatterDatoTilISO(value));
  });
});

addMethod(string, 'erEtterDatofelt', function(felt, message) {
  return this.test('erEtterFraDato', message, function(value) {
    const { [felt]: fomDato } = this.parent;
    const tomDato = value;

    return Utils.dato.erGyldigPeriode(fomDato, tomDato);
  });
});

addMethod(string, 'erIkkeBlank', function(message) {
  return this.test('er ikke blank', message, function(value) {
    const { path } = this;

    if (value === '') {
      throw this.createError({
        path,
        message,
      });
    }

    return true;
  });
});

addMethod(string, 'erNummer', function(message) {
  return this.test('er et nummer', message, function(value) {
    const { path } = this;

    if (new RegExp(/^\d+$/).test(value)) return true;

    throw this.createError({
      path,
      message,
    });
  });
});

addMethod(string, 'erFnrEllerDnr', function(message) {
  return this.test('er et Fnr eller Dnr', message, function(value) {
    return Person.erGyldigFnr(value) || Person.erGyldigDnr(value);
  });
});

addMethod(string, 'erFnrEllerDnrEllerOrgnr', function(message) {
  return this.test('er et Fnr, Dnr eller Orgnr', message, function(value) {
    return Person.erGyldigFnr(value) || Person.erGyldigDnr(value) || Organisasjon.erOrgnrLengde(value);
  });
});

addMethod(string, 'erOrgnr', function(message) {
  return this.test('er orgnr', message, function(value) {
    return Organisasjon.erOrgnrGyldig(value);
  });
});

addMethod(string, 'harIkkeOrgnrLengde', function(message) {
  return this.test('er orgnrlengde', message, function(value) {
    const { path, createError } = this;

    if (Organisasjon.erOrgnrLengde(value)) {
      throw createError({
        path,
        message,
      });
    }

    return true;
  });
});

addMethod(string, 'harIkkeFnrEllerDnrLengde', function(message) {
  return this.test('er fnr eller dnr lengde', message, function(value) {
    const { path, createError } = this;

    if (Person.erFnrLengde(value) || Person.erDnrLengde(value)) {
      throw createError({
        path,
        message,
      });
    }

    return true;
  });
});


export {
  mixed,
  object,
  array,
  string,
  date,
  bool,
  lazy,
  number,
};
