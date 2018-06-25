import DomeneRegel from '../domeneRegel';

import { strengTilBool } from '../../utils/streng';
import { datoDiff, formatterDatoTilISO } from '../../utils/dato';

class Opphold extends DomeneRegel {
  inntilTolvManeder = () => {
    const { skjema } = this;
    const { oppholdUtlandFom, oppholdUtlandTom } = skjema;
    const isoFom = formatterDatoTilISO(oppholdUtlandFom);
    const isoTom = formatterDatoTilISO(oppholdUtlandTom);

    return datoDiff(isoFom, isoTom, 'months') < 12;
  }

  erINorgeSeksManederEllerMerPerKalenderAr = () => {
    const { skjema } = this;
    const antallMaanederINorge = parseInt(skjema.antallMaanederINorge, 10);
    return antallMaanederINorge >= 6;
  }

  oppholderSegIUtlandet = () => {
    const { skjema } = this;
    const { faktaavklaringOppholdsLand = [] } = skjema;

    if (faktaavklaringOppholdsLand.length === 0) return undefined;

    return !faktaavklaringOppholdsLand.includes('NO');
  }

  harSammeAdresseSomArbeidsgiver = () => {
    const { skjema } = this;
    const { sammeAdresseSomArbeidsgiver = [] } = skjema;

    return strengTilBool(sammeAdresseSomArbeidsgiver);
  }

  ektefelleEllerBarn = () => {
    const { skjema } = this;
    const { ektefelleEllerBarnINorge } = skjema;

    return strengTilBool(ektefelleEllerBarnINorge);
  }

  forutgaendeBostedINorge = () => {
    const { skjema } = this;
    const { forutgaendeBostedINorge } = skjema;

    return strengTilBool(forutgaendeBostedINorge);
  }

  familieBorINorge = () => {
    const { skjema } = this;
    const { familiesBosted } = skjema;

    return familiesBosted.includes('NO');
  }

  harAdresseIUtlandet = () => {
    const { skjema } = this;
    const { adresseIUtlandet } = skjema;

    return strengTilBool(adresseIUtlandet);
  }

  intensjonOmReturTilNorge = () => {
    if (this.skjema.intensjonOmRetur === undefined) { return undefined; }
    return strengTilBool(this.skjema.intensjonOmRetur);
  }
}

export default Opphold;
