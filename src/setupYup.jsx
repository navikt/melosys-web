import { addMethod, object, string } from "yup";

import * as Utils from "./utils";

import MKV from "./melosyskodeverk";
import * as KV from "./kodeverk";
import * as StringUtils from "./utils/streng";

const { TIDLIGERE_ENN_FOM, SKRIV_INN_GYLDIG_DATO, UTENFOR_SOKNADSPERIODEN } = KV.Feilmeldinger;

/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

addMethod(object, "uniqueProperty", function (propertyName, message) {
  return this.test("unique", message, function (value) {
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

addMethod(string, "erGyldigDato", function (message = SKRIV_INN_GYLDIG_DATO) {
  return this.test("er gyldig dato", message, function (value) {
    if (Utils._isEmpty(value)) return true;
    return Boolean(Utils.dato.vaskInputDato(value));
  });
});

addMethod(string, "erInnenforSoknadsperioden", function (message = UTENFOR_SOKNADSPERIODEN) {
  return this.test("dato er innenfor soknadsperioden", message, function (value) {
    const { soknadsperiode } = this.options.context;
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;

    const vasketValue = Utils.dato.vaskInputDato(value);
    if (Utils._isEmpty(value) || !vasketValue) return true;

    if (!soknadsperiode || !soknadsperiode.fom) {
      throw this.createError({
        path: this.path,
        message: actualMessage,
      });
    }

    const vasketSoknadsperiodeFom = Utils.dato.vaskInputDato(soknadsperiode.fom);

    if (!vasketSoknadsperiodeFom) {
      throw this.createError({
        path: this.path,
        message: actualMessage,
      });
    }

    if (Utils._isEmpty(soknadsperiode.tom)) {
      if (!Utils.dato.erGyldigPeriode(vasketSoknadsperiodeFom, vasketValue)) {
        throw this.createError({
          path: this.path,
          message: actualMessage,
        });
      }
      return true;
    }
    const vasketSoknadsperiodeTom = Utils.dato.vaskInputDato(soknadsperiode.tom);
    if (!vasketSoknadsperiodeTom) {
      throw this.createError({
        path: this.path,
        message: actualMessage,
      });
    }

    const isoValue = Utils.dato.formatterDatoTilISO(vasketValue);
    const isoFom = Utils.dato.formatterDatoTilISO(vasketSoknadsperiodeFom);
    const isoTom = Utils.dato.formatterDatoTilISO(vasketSoknadsperiodeTom);

    if (!Utils.dato.erIPeriode(isoFom, isoTom, isoValue, "[]")) {
      throw this.createError({
        path: this.path,
        message: actualMessage,
      });
    }
    return true;
  });
});

addMethod(string, "erInnenforPeriode", function (periodeNavn, message) {
  return this.test("dato er innenfor periode", message, function (value) {
    const periode = this.options.context[periodeNavn];
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;

    if (Utils._isEmpty(value) || !Utils.dato.vaskInputDato(value)) return true;
    if (!periode.tom) return true;

    if (!Utils.dato.erIPeriode(periode.fom, periode.tom, Utils.dato.formatterDatoTilISO(value), "[]")) {
      throw this.createError({
        path: this.path,
        message: actualMessage,
      });
    }
    return true;
  });
});

addMethod(string, "erEtterDatofelt", function (felt = "fomDato", messageParam = TIDLIGERE_ENN_FOM) {
  const actualMessage =
    typeof messageParam === "string" || messageParam instanceof String ? messageParam : messageParam?.melding;
  return this.test("er etter dato", actualMessage, function (value) {
    const { [felt]: fomDatoOriginal } = this.parent;

    const tomDatoVasket = Utils.dato.vaskInputDato(value);
    const fomDatoVasket = Utils.dato.vaskInputDato(fomDatoOriginal);

    if (Utils._isEmpty(value) || Utils._isEmpty(fomDatoOriginal)) {
      return true;
    }

    if (!Utils.dato.erGyldigPeriode(fomDatoVasket, tomDatoVasket)) {
      return false;
    }
    return true;
  });
});

addMethod(string, "erIkkeBlank", function (message) {
  return this.test("er ikke blank", message, function (value) {
    const { path } = this;
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;

    if (value === "") {
      throw this.createError({
        path,
        message: actualMessage,
      });
    }

    return true;
  });
});

addMethod(string, "erIkkeBlankHtml", function (message) {
  return this.test("er ikke blank html", message, function (value) {
    if (Utils._isEmpty(value)) return false;
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;
    if (!StringUtils.harStrengInnhold(value)) {
      throw this.createError({
        path: this.path,
        message: actualMessage,
      });
    }
    return StringUtils.harStrengInnhold(value);
  });
});

addMethod(string, "erNummer", function (message) {
  return this.test("er et nummer", message, function (value) {
    if (!value) return true;
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;

    const { path } = this;

    if (/^\d+$/.test(value)) return true;

    throw this.createError({
      path,
      message: actualMessage,
    });
  });
});

addMethod(string, "erNummerTolerererEttMellomrom", function (message) {
  return this.test("er et nummer", message, function (value) {
    const { path } = this;
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;

    if (/^\d+$/.test(value?.replace(" ", ""))) return true;

    throw this.createError({
      path,
      message: actualMessage,
    });
  });
});

addMethod(string, "erFnrEllerDnrEllerFødselsdato", function (message) {
  return this.test("er et Fnr eller Dnr eller en fødselsdato", message, function (value) {
    if (Utils._isEmpty(value)) return true;
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;
    const isValid = Boolean(
      Utils.person.erGyldigFnr(value) || Utils.person.erGyldigDnr(value) || Utils.dato.vaskInputDato(value),
    );
    if (!isValid) {
      throw this.createError({ path: this.path, message: actualMessage });
    }
    return isValid;
  });
});

addMethod(string, "erFnrEllerDnr", function (message) {
  return this.test("er et Fnr eller Dnr", message, function (value) {
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;
    const isValid = Utils.person.erGyldigFnr(value) || Utils.person.erGyldigDnr(value);
    if (!isValid && !Utils._isEmpty(value)) {
      throw this.createError({ path: this.path, message: actualMessage });
    }
    return isValid || Utils._isEmpty(value);
  });
});

addMethod(string, "erOrgnr", function (message) {
  return this.test("er orgnr", message, function (value) {
    if (!value) return true;
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;
    const isValid = Utils.organisasjon.erOrgnrGyldig(value);
    if (!isValid) {
      throw this.createError({ path: this.path, message: actualMessage });
    }
    return isValid;
  });
});

addMethod(string, "erFnrEllerDnrEllerOrgnrTolererEttMellomrom", function (message) {
  return this.test("er et Fnr, Dnr eller Orgnr", message, function (value) {
    if (!value) return true;
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;
    const isValid =
      Utils.person.erGyldigFnr(value?.replace(" ", "")) ||
      Utils.person.erGyldigDnr(value?.replace(" ", "")) ||
      Utils.organisasjon.erOrgnrGyldig(value);
    if (!isValid) {
      throw this.createError({ path: this.path, message: actualMessage });
    }
    return isValid;
  });
});

addMethod(string, "harIkkeOrgnrLengde", function (message) {
  return this.test("er orgnrlengde", message, function (value) {
    const { path, createError } = this;
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;

    if (Utils.organisasjon.erOrgnrLengde(value)) {
      throw createError({
        path,
        message: actualMessage,
      });
    }

    return true;
  });
});

addMethod(string, "harIkkeFnrEllerDnrLengde", function (message) {
  return this.test("er fnr eller dnr lengde", message, function (value) {
    const { path, createError } = this;
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;

    if (Utils.person.erFnrLengde(value) || Utils.person.erDnrLengde(value)) {
      throw createError({
        path,
        message: actualMessage,
      });
    }

    return true;
  });
});

addMethod(string, "harIkkeOrgnrFnrEllerDnrLengdeTolerererEttMellomrom", function (message) {
  return this.test("er orgnr, fnr eller dnr lengde", message, function (value) {
    const { path, createError } = this;
    const valueMinusMellomrom = value?.replace(" ", "");
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;

    if (
      Utils.organisasjon.erOrgnrLengde(value) ||
      Utils.person.erFnrLengde(valueMinusMellomrom) ||
      Utils.person.erDnrLengde(valueMinusMellomrom)
    ) {
      throw createError({
        path,
        message: actualMessage,
      });
    }

    return true;
  });
});

addMethod(string, "siblingIs", function (sibling, predicate, message) {
  return this.test("siblingIs", message, function () {
    const {
      options: { parent },
      createError,
      path,
    } = this;
    const siblingValue = parent[sibling];
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;

    if (Utils._isFunction(predicate)) {
      if (!predicate(siblingValue)) {
        throw createError({
          path,
          message: actualMessage,
        });
      }
    } else if (siblingValue !== predicate) {
      throw createError({
        path,
        message: actualMessage,
      });
    }

    return true;
  });
});

addMethod(string, "erLandKode", function (message) {
  return this.test("erLandKode", message, function (value) {
    const { createError, path } = this;
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;

    if (!Utils._has(MKV.Koder.landkoder, value)) {
      throw createError({
        path,
        message: actualMessage,
      });
    }

    return true;
  });
});

addMethod(string, "erValutaKode", function (message) {
  return this.test("erValutaKode", message, function (value) {
    const { createError, path } = this;
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;

    if (!Utils._has(MKV.Koder.valutakoder, value)) {
      throw createError({
        path,
        message: actualMessage,
      });
    }

    return true;
  });
});

addMethod(string, "erEØSStatsborger", function (message) {
  return this.test("erEØSStatsborger", message, function (value) {
    const { path, createError } = this;
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;

    if (value && !MKV.Koder.EØSStatsborgerskap[value]) {
      throw createError({
        path,
        message: actualMessage,
      });
    }
    return true;
  });
});

addMethod(string, "erGyldigPostnummer", function (message) {
  return this.test("erGyldigPostnummer", message, function (value) {
    const { path, createError } = this;
    const actualMessage = typeof message === "string" || message instanceof String ? message : message?.melding;
    if (value && !/^\d{4}$/.test(value)) {
      throw createError({
        path,
        message: actualMessage,
      });
    }
    return true;
  });
});
