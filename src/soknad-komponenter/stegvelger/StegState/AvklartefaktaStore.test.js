import AvklartefaktaStore from './AvklartefaktaStore';
import { konverterTilStegData, lagAvklartefaktaBegrunnelse, lagAvklartfakta, slettAvklartfakta } from '../../../regler/avklartefakta';
import * as KV from '../../../kodeverk';

const fakta =
{
  subjektID: 'Seven Kestrel',
  fakta: ['GB'],
  referanse: KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND,
  avklartefaktaKode: 'ARBEIDSLAND',
  begrunnelseKoder: [],
  begrunnelseFritekst: null,
};

describe('AvklartefaktaStore oppdatering av eksisterende data med subjektID', () => {
  let store;
  beforeEach(() => {
    store = new AvklartefaktaStore();

    const af = konverterTilStegData(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, fakta);
    store.oppdaterStegData('TESTSTEG-1', af);
  });

  it('Legg til annet avklartfakta på samme steg', () => {
    const af = lagAvklartfakta(KV.Koder.avklartefaktaKoder.VIRKSOMHET, 'VY Opplevelsesreiser');
    store.oppdaterStegData('TESTSTEG-1', af);

    const avklartefaktaListe = store.hent();
    expect(avklartefaktaListe.INSTALLASJON_ARBEIDSLAND).toHaveLength(1);
    expect(avklartefaktaListe.VIRKSOMHET).toHaveLength(1);
  });

  it('Legg til nytt subjekt på samme steg', () => {
    const af = lagAvklartfakta(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, 'Olympic Bibby', 'NO');
    store.oppdaterStegData('TESTSTEG-1', af);

    const avklartefaktaListe = store.hent();
    expect(avklartefaktaListe.INSTALLASJON_ARBEIDSLAND)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ subjektID: 'Seven Kestrel', fakta: ['GB'] }),
        expect.objectContaining({ subjektID: 'Olympic Bibby', fakta: ['NO'] }),
      ]));
  });

  it('Legg til begrunnelse på ny avklartfakta', () => {
    const af = lagAvklartefaktaBegrunnelse(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, 'Olympic Bibby', 'Flagglandet er Norge');
    store.oppdaterStegData('TESTSTEG-1', af);

    const avklartefaktaListe = store.hent();
    expect(avklartefaktaListe.INSTALLASJON_ARBEIDSLAND)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({
          subjektID: 'Olympic Bibby',
          fakta: null,
          begrunnelseKoder: ['Flagglandet er Norge'],
        }),
        expect.objectContaining({
          subjektID: 'Seven Kestrel',
          fakta: ['GB'],
          begrunnelseKoder: [],
        }),
      ]));
  });
});

describe('AvklartefaktaStore sletting av avklartefakta', () => {
  let store;
  beforeEach(() => {
    store = new AvklartefaktaStore();

    const af1 = lagAvklartfakta(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, 'Seven Kestrel', 'GB');
    store.oppdaterStegData('TESTSTEG-1', af1);

    const af2 = lagAvklartfakta(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, 'Olympic Bibby', 'NO');
    store.oppdaterStegData('TESTSTEG-1', af2);
  });

  it('Slett avklartfakta basert på felt-type', () => {
    store.slettStegData('TESTSTEG-1', slettAvklartfakta(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND));
    expect(store.hent()).toEqual({});
  });

  it('Sletter kun oppgitt felt-type', () => {
    store.slettStegData('TESTSTEG-1', slettAvklartfakta(KV.Koder.avklartefaktaKoder.VIRKSOMHET));

    const avklartefaktaListe = store.hent();
    expect(avklartefaktaListe.INSTALLASJON_ARBEIDSLAND)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ fakta: ['GB'] }),
        expect.objectContaining({ fakta: ['NO'] }),
      ]));
  });

  it('Sletter kun avklartefakta som matcher subjektID', () => {
    store.slettStegData('TESTSTEG-1', slettAvklartfakta(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, 'Olympic Bibby'));

    const avklartefaktaListe = store.hent();
    expect(avklartefaktaListe.INSTALLASJON_ARBEIDSLAND)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ fakta: ['GB'] }),
      ]));
    expect(avklartefaktaListe.INSTALLASJON_ARBEIDSLAND)
      .not.toEqual(expect.arrayContaining([
        expect.objectContaining({ fakta: ['NO'] }),
      ]));
  });

  it('Slett alle avklartfakta tilhørende steg', () => {
    store.slettStegData('TESTSTEG-1');
    expect(store.hent()).toEqual({});
  });

  it('Sletter kun data for steget', () => {
    const af = lagAvklartfakta(KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND, 'Stena Don', 'SE');
    store.oppdaterStegData('TESTSTEG-2', af);

    store.slettStegData('TESTSTEG-1');
    const avklartefaktaListe = store.hent();
    expect(avklartefaktaListe.INSTALLASJON_ARBEIDSLAND)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ fakta: ['SE'] }),
      ]));
  });
});
