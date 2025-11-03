import { addMethod, object, string } from "yup";

import * as Utils from "./utils";

import MKV from "./melosyskodeverk";
import * as KV from "./kodeverk";
import * as StringUtils from "./utils/streng";

const { TIDLIGERE_ENN_FOM, SKRIV_INN_GYLDIG_DATO, UTENFOR_SOKNADSPERIODEN } = KV.Feilmeldinger;

const erGyldigOgKunTall = (datoString) => {
  const datoUtenSkilletegn = datoString.replace(/[-./]/g, "");
  if (!/^\d+$/.test(datoUtenSkilletegn)) {
    return false;
  }
  return Boolean(Utils.dato.vaskInputDato(datoString));
};

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
    return erGyldigOgKunTall(value);
  });
});

addMethod(string, "erInnenforSoknadsperioden", function (message = UTENFOR_SOKNADSPERIODEN) {
  return this.test("dato er innenfor soknadsperioden", message, function (value) {
    const { soknadsperiode } = this.options.context;

    if (Utils._isEmpty(value) || !Utils.dato.vaskInputDato(value)) return true;

    if (Utils._isEmpty(soknadsperiode.tom)) {
      return Utils.dato.erGyldigPeriode(Utils.dato.formatterDatoTilNorsk(soknadsperiode.fom), value);
    }

    return Utils.dato.erIPeriode(soknadsperiode.fom, soknadsperiode.tom, Utils.dato.formatterDatoTilISO(value), "[]");
  });
});

addMethod(string, "erInnenforPeriode", function (periodeNavn, message) {
  return this.test("dato er innenfor periode", message, function (value) {
    const periode = this.options.context[periodeNavn];

    if (Utils._isEmpty(value) || !Utils.dato.vaskInputDato(value)) return true;
    if (!periode.tom) return true;

    return Utils.dato.erIPeriode(periode.fom, periode.tom, Utils.dato.formatterDatoTilISO(value), "[]");
  });
});

addMethod(string, "erEtterDatofelt", function (felt = "fomDato", message = TIDLIGERE_ENN_FOM) {
  return this.test("er etter dato", message, function (value) {
    const { [felt]: fomDato } = this.parent;
    const tomDato = value;
    if (!Utils.dato.vaskInputDato(tomDato)) return true;

    return Utils.dato.erGyldigPeriode(fomDato, tomDato);
  });
});

addMethod(string, "erIkkeBlank", function (message) {
  return this.test("er ikke blank", message, function (value) {
    const { path } = this;

    if (value === "") {
      throw this.createError({
        path,
        message,
      });
    }

    return true;
  });
});

addMethod(string, "erIkkeBlankHtml", function (message) {
  return this.test("er ikke blank html", message, function (value) {
    if (Utils._isEmpty(value)) return false;
    return StringUtils.harStrengInnhold(value);
  });
});

addMethod(string, "erNummer", function (message) {
  return this.test("er et nummer", message, function (value) {
    if (!value) return true;

    const { path } = this;

    if (/^\d+$/.test(value)) return true;

    throw this.createError({
      path,
      message,
    });
  });
});

addMethod(string, "erNummerTolerererEttMellomrom", function (message) {
  return this.test("er et nummer", message, function (value) {
    const { path } = this;

    if (/^\d+$/.test(value?.replace(" ", ""))) return true;

    throw this.createError({
      path,
      message,
    });
  });
});

addMethod(string, "erFnrEllerDnrEllerFødselsdato", function (message) {
  return this.test("er et Fnr eller Dnr eller en fødselsdato", message, function (value) {
    if (Utils._isEmpty(value)) return true;
    return Boolean(
      Utils.person.erGyldigFnr(value) || Utils.person.erGyldigDnr(value) || Utils.dato.vaskInputDato(value),
    );
  });
});

addMethod(string, "erFnrEllerDnr", function (message) {
  return this.test("er et Fnr eller Dnr", message, function (value) {
    return Utils.person.erGyldigFnr(value) || Utils.person.erGyldigDnr(value);
  });
});

addMethod(string, "erOrgnr", function (message) {
  return this.test("er orgnr", message, function (value) {
    if (!value) return true;
    return Utils.organisasjon.erOrgnrGyldig(value);
  });
});

addMethod(string, "erFnrEllerDnrEllerOrgnrTolererEttMellomrom", function (message) {
  return this.test("er et Fnr, Dnr eller Orgnr", message, function (value) {
    if (!value) return true;
    return (
      Utils.person.erGyldigFnr(value?.replace(" ", "")) ||
      Utils.person.erGyldigDnr(value?.replace(" ", "")) ||
      Utils.organisasjon.erOrgnrGyldig(value)
    );
  });
});

addMethod(string, "harIkkeOrgnrLengde", function (message) {
  return this.test("er orgnrlengde", message, function (value) {
    const { path, createError } = this;

    if (Utils.organisasjon.erOrgnrLengde(value)) {
      throw createError({
        path,
        message,
      });
    }

    return true;
  });
});

addMethod(string, "harIkkeFnrEllerDnrLengde", function (message) {
  return this.test("er fnr eller dnr lengde", message, function (value) {
    const { path, createError } = this;

    if (Utils.person.erFnrLengde(value) || Utils.person.erDnrLengde(value)) {
      throw createError({
        path,
        message,
      });
    }

    return true;
  });
});

addMethod(string, "harIkkeOrgnrFnrEllerDnrLengdeTolerererEttMellomrom", function (message) {
  return this.test("er orgnr, fnr eller dnr lengde", message, function (value) {
    const { path, createError } = this;
    const valueMinusMellomrom = value?.replace(" ", "");

    if (
      Utils.organisasjon.erOrgnrLengde(value) ||
      Utils.person.erFnrLengde(valueMinusMellomrom) ||
      Utils.person.erDnrLengde(valueMinusMellomrom)
    ) {
      throw createError({
        path,
        message,
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

    if (Utils._isFunction(predicate)) {
      if (!predicate(siblingValue)) {
        throw createError({
          path,
          message,
        });
      }
    } else if (siblingValue !== predicate) {
      throw createError({
        path,
        message,
      });
    }

    return true;
  });
});

addMethod(string, "erLandKode", function (message) {
  return this.test("erLandKode", message, function (value) {
    const { createError, path } = this;

    if (!Utils._has(MKV.Koder.landkoder, value)) {
      throw createError({
        path,
        message,
      });
    }

    return true;
  });
});
