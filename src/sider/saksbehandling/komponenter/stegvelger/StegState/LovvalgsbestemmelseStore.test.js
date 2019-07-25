import * as MKV from 'melosys-kodeverk';
import LovvalgsbestemmelseStore from './LovvalgsbestemmelseStore';
import { konverterLovvalgsbestemmelseTilStegData, lagLovvalgsbestemmelse } from '../../../../../regler/lovvalgsbestemmelser';

describe('LovvalgsbestemmelseStore oppdatering av eksisterende data', () => {
  let store;
  beforeEach(() => {
    store = new LovvalgsbestemmelseStore();

    const bestemmelse = konverterLovvalgsbestemmelseTilStegData(MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_1A);
    store.oppdaterStegData('TESTSTEG-1', bestemmelse);
  });

  it('Returnerer lovvalgsbestemmelse ved en lovvalgsbestemmelse', () => {
    expect(store.hent()).toBe(MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_1A);
  });

  it('Returnerer siste verdi ved oppdatering av lovvalgsbestemmelse', () => {
    const bestemmelse = lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_2A);
    store.oppdaterStegData('TESTSTEG-1', bestemmelse);

    expect(store.hent()).toBe(MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_2A);
  });

  it('Returnerer verdien til første steg ved oppdatering av lovvalgsbestemmelse', () => {
    const bestemmelse = lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_2A);
    store.oppdaterStegData('TESTSTEG-2', bestemmelse);

    expect(store.hent()).toBe(MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_1A);
  });
});

describe('LovvalgsbestemmelseStore slettData', () => {
  let store;
  beforeEach(() => {
    store = new LovvalgsbestemmelseStore();

    const bestemmelse = konverterLovvalgsbestemmelseTilStegData(MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_1A);
    store.oppdaterStegData('TESTSTEG-1', bestemmelse);
  });

  it('Sletter lovvalgsbestemmelsen', () => {
    store.slettStegData('TESTSTEG-1');
    expect(store.hent()).toBeFalsy();
  });

  it('Sletter lovvalgsbestemmelse etter oppdatering', () => {
    store.oppdaterStegData('TESTSTEG-1', lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_2A));
    store.slettStegData('TESTSTEG-1');
    expect(store.hent()).toBeFalsy();
  });

  it('Returnerer verdien til andre steg ved sletting av første steg', () => {
    const bestemmelse = konverterLovvalgsbestemmelseTilStegData(MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_2A);
    store.oppdaterStegData('TESTSTEG-2', bestemmelse);
    store.slettStegData('TESTSTEG-1');
    expect(store.hent()).toBe(MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART13_2A);
  });
});
