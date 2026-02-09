import "yup";

declare module "yup" {
  interface StringSchema {
    erGyldigDato(message?: unknown): this;
    erInnenforSoknadsperioden(message?: unknown): this;
    erInnenforPeriode(periodeNavn: string, message?: unknown): this;
    erEtterDatofelt(felt?: string, message?: unknown): this;
    erIkkeBlank(message?: unknown): this;
    erIkkeBlankHtml(message?: unknown): this;
    erNummer(message?: unknown): this;
    erNummerTolerererEttMellomrom(message?: unknown): this;
    erFnrEllerDnrEllerFødselsdato(message?: unknown): this;
    erFnrEllerDnr(message?: unknown): this;
    erOrgnr(message?: unknown): this;
    erFnrEllerDnrEllerOrgnrTolererEttMellomrom(message?: unknown): this;
    harIkkeOrgnrLengde(message?: unknown): this;
    harIkkeFnrEllerDnrLengde(message?: unknown): this;
    harIkkeOrgnrFnrEllerDnrLengdeTolerererEttMellomrom(message?: unknown): this;
    siblingIs(sibling: string, predicate: unknown, message?: unknown): this;
    erLandKode(message?: unknown): this;
  }

  interface ObjectSchema<TIn, TContext, TDefault, TFlags> {
    uniqueProperty(propertyName: string, message?: unknown): this;
  }
}
