import EnkelDataStore from './EnkelDataStore';
import { konverterEnkelDataTilStegData, lagEnkelData } from '../../../../../regler/enkelData';

const TEST_TYPE = 'testtype';
const testData = {
  FO_883_2004_ART13_1A: 'FO_883_2004_ART13_1A',
  FO_883_2004_ART13_2A: 'FO_883_2004_ART13_2A',
};

describe('EnkelDataStore oppdatering av eksisterende data', () => {
  let store;

  beforeEach(() => {
    store = new EnkelDataStore();

    const data = konverterEnkelDataTilStegData(testData.FO_883_2004_ART13_2A, TEST_TYPE);
    store.oppdaterStegData('TESTSTEG-1', data);
  });

  it('Returnerer data', () => {
    expect(store.hent()).toBe(testData.FO_883_2004_ART13_2A);
  });

  it('Returnerer siste verdi ved oppdatering av data', () => {
    const data = lagEnkelData(testData.FO_883_2004_ART13_2A, TEST_TYPE);
    store.oppdaterStegData('TESTSTEG-1', data);

    expect(store.hent()).toBe(testData.FO_883_2004_ART13_2A);
  });

  it('Returnerer verdien til første steg ved oppdatering av data', () => {
    const data = lagEnkelData(testData.FO_883_2004_ART13_2A, TEST_TYPE);
    store.oppdaterStegData('TESTSTEG-2', data);

    expect(store.hent()).toBe(testData.FO_883_2004_ART13_2A);
  });
});

describe('EnkelDataStore slettData', () => {
  let store;

  beforeEach(() => {
    store = new EnkelDataStore();

    const data = konverterEnkelDataTilStegData(testData.FO_883_2004_ART13_2A, TEST_TYPE);
    store.oppdaterStegData('TESTSTEG-1', data);
  });

  it('Sletter data', () => {
    store.slettStegData('TESTSTEG-1');
    expect(store.hent()).toBeFalsy();
  });

  it('Sletter data etter oppdatering', () => {
    store.oppdaterStegData('TESTSTEG-1', lagEnkelData(testData.FO_883_2004_ART13_2A, TEST_TYPE));
    store.slettStegData('TESTSTEG-1');
    expect(store.hent()).toBeFalsy();
  });

  it('Returnerer verdien til andre steg ved sletting av første steg', () => {
    const data = konverterEnkelDataTilStegData(testData.FO_883_2004_ART13_2A, TEST_TYPE);
    store.oppdaterStegData('TESTSTEG-2', data);
    store.slettStegData('TESTSTEG-1');
    expect(store.hent()).toBe(testData.FO_883_2004_ART13_2A);
  });
});
