// import * as Konstanter from '../../../constants';
// import * as Mikrovalidering from './mikrovalidering';

const brevbestillingGenerellValidering = _verdier => {
  // const { dokumenttypeKode } = verdier;
  /*
  const brukerID = (
    Mikrovalidering.idErBlank(verdier.brukerID) ||
    Mikrovalidering.idErIkkeNummer(verdier.brukerID) ||
    Mikrovalidering.idErIkkeFnrEllerDnr(verdier.brukerID) ||
    Mikrovalidering.idFinnesIkke(verdier.brukerNavn, verdier.brukerID) ||
    false
  );
  return brukerID;
  */
};
const brevbestillingSituasjonsbetingetValidering = _verdier => {
  // const { dokumenttypeKode } = verdier;
  /*
  const { journalforingHensikt } = verdier;

  switch (journalforingHensikt) {
    case Konstanter.JOURNALFORING_HENSIKT.OPPRETT:
      return journalforingOpprettSakValidering(verdier);
    case Konstanter.JOURNALFORING_HENSIKT.KNYTT:
      return journalforingTilknyttSakValidering(verdier);
    default: return {};
  }
  */
};

export const brevbestillingValidering = verdier => ({
  ...brevbestillingGenerellValidering(verdier),
  ...brevbestillingSituasjonsbetingetValidering(verdier),
});
