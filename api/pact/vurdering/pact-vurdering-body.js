const { Matchers } = require('@pact-foundation/pact');

const { integer, like, eachLike } = Matchers;
const betingelse =
  {
    argument: like('Arbeidsgiver har virksomhet i landet arbeidstakeren sendes fra'),
    krav: like('er sann'),
    resultat: like('OPPFYLT'),
  };
const lovvalgsbestemmelse = {
  artikkel: like('12.1'),
  betingelser: eachLike(betingelse),
};

const feilmelding = {
  kategori: like({
    alvorlighetsgrad: like('FEIL'),
    beskrivelse: like('Det er implementert delvis maskinell stotte for denne foresporselen.'),
  }),
  melding: like('Sokeren kan ikke arbeide på både skip og sokkel.'),
};
const vurdering = {
  lovvalgsbestemmelser: eachLike(lovvalgsbestemmelse),
  feilmeldinger: eachLike(feilmelding),
};

const vurderingen = {
  behandlingID: integer(3),
  vurdering,
};

export default vurderingen;
