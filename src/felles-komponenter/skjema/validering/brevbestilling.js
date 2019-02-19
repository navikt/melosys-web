import * as MKV from 'melosys-kodeverk';

const harBlankMelding = (verdi, melding = 'Velg et element i nedtrekkslisten') => ((verdi === '') ? melding : false);
const harTekstMelding = (tekst, melding = 'Tekstfeltet må fylles ut') => ((tekst && tekst.length > 0) ? false : melding);

const brevbestillingGenerellValidering = verdier => {
  const mottaker = (
    harBlankMelding(verdier.mottaker) ||
    false
  );
  const dokumenttypeKode = (
    harBlankMelding(verdier.dokumenttypeKode) ||
    false
  );
  return {
    mottaker,
    dokumenttypeKode,
  };
};
const mangelBrevValidering = verdier => {
  const fritekst = (
    harTekstMelding(verdier.fritekst) ||
    false
  );
  return {
    fritekst,
  };
};
const brevbestillingSituasjonsbetingetValidering = verdier => {
  const { dokumenttypeKode } = verdier;
  switch (dokumenttypeKode) {
    case MKV.Koder.brev.produserbaredokumenter.MELDING_MANGLENDE_OPPLYSNINGER:
      return mangelBrevValidering(verdier);
    default: return {};
  }
};

const brevbestillingValidering = verdier => {
  const validering = {
    ...brevbestillingGenerellValidering(verdier),
    ...brevbestillingSituasjonsbetingetValidering(verdier),
  };
  return validering;
};

const erSkjemaGyldig = (verdier, brevbestillingHensikt) => {
  const verdiKopi = { ...verdier, brevbestillingHensikt };
  const validering = brevbestillingValidering(verdiKopi);
  return Object.values(validering).every(enkeltValidering => enkeltValidering === false);
};
export { brevbestillingValidering, erSkjemaGyldig };
