import DomeneRegel from '../domeneRegel';

import { strengTilBool } from '../../utils/streng';
import { datoDiff, formatterDatoTilISO } from '../../utils/dato';

class Opphold extends DomeneRegel {
  inntilTolvManeder = () => {
    const { skjema } = this;
    const { oppholdUtlandFom, oppholdUtlandTom } = skjema;
    const isoFom = formatterDatoTilISO(oppholdUtlandFom);
    const isoTom = formatterDatoTilISO(oppholdUtlandTom);

    const diff = datoDiff(isoFom, isoTom, 'months');
    if (diff === false) return undefined;

    return diff < 12;
  }

  erINorgeSeksManederEllerMerPerKalenderAr = () => {
    const { skjema } = this;
    const antallMaanederINorge = parseInt(skjema.antallMaanederINorge, 10);
    return antallMaanederINorge >= 6;
  }

  oppholderSegIUtlandet = () => {
    const { skjema } = this;
    const { faktaavklaringOppholdsLand = [] } = skjema;

    if (!faktaavklaringOppholdsLand || faktaavklaringOppholdsLand.length === 0) return undefined;

    return !faktaavklaringOppholdsLand.includes('NO');
  }

  harSammeAdresseSomArbeidsgiver = () => {
    const { skjema } = this;
    const { sammeAdresseSomArbeidsgiver } = skjema;

    if (!sammeAdresseSomArbeidsgiver) return undefined;

    return strengTilBool(sammeAdresseSomArbeidsgiver);
  }

  harEktefelleEllerBarnINorge = () => {
    const { skjema } = this;
    const { ektefelleEllerBarnINorge } = skjema;

    if (!ektefelleEllerBarnINorge) return undefined;

    return strengTilBool(ektefelleEllerBarnINorge);
  }

  harForutgaendeBostedINorge = () => {
    const { skjema } = this;
    const { forutgaendeBostedINorge } = skjema;

    if (!forutgaendeBostedINorge) return undefined;

    return strengTilBool(forutgaendeBostedINorge);
  }

  familieBorINorge = () => {
    const { skjema } = this;
    const { familiesBosted } = skjema;

    if (!familiesBosted || familiesBosted.length === 0) return undefined;

    return familiesBosted.includes('NO');
  }

  harAdresseIUtlandet = () => {
    const { skjema } = this;
    const { adresseIUtlandet } = skjema;

    if (!adresseIUtlandet) return undefined;

    return strengTilBool(adresseIUtlandet);
  }

  harIntensjonOmReturTilNorge = () => {
    const { skjema } = this;
    const { intensjonOmRetur } = skjema;
    if (!intensjonOmRetur) { return undefined; }
    return strengTilBool(intensjonOmRetur);
  }
}

export default Opphold;
