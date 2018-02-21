const { Matchers } = require('@pact-foundation/pact');

const { eachLike } = Matchers;
const betingelse =
  {
    argument: 'Arbeidsgiver har virksomhet i landet arbeidstakeren sendes fra',
    krav: 'er sann',
    resultat: 'OPPFYLT',
  };
const lovvalgsbestemmelse = {
  artikkel: '12.1',
  betingelser: eachLike(betingelse),
};
const kategori = {
  alvorlighetsgrad: 'FEIL',
  beskrivelse: 'Det er implementert delvis maskinell støtte for denne forespørselen.',
};
const feilmelding = {
  kategori,
  melding: 'Søkeren kan ikke arbeide på både skip og sokkel.',
};
const vurdering = {
  lovvalgsbestemmelser: eachLike(lovvalgsbestemmelse),
  feilmeldinger: eachLike(feilmelding),
};

const vurderingen = {
  behandlingID: 3,
  vurdering,
};

export default vurderingen;
