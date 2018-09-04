import DomeneRegel from '../domeneRegel';

import { datoDiff, formatterDatoTilISO } from '../../utils/dato';

class Opphold extends DomeneRegel {
  inntilTolvMaaneder = () => {
    const { skjema } = this;
    const { oppholdUtlandFom, oppholdUtlandTom } = skjema;
    const isoFom = formatterDatoTilISO(oppholdUtlandFom);
    const isoTom = formatterDatoTilISO(oppholdUtlandTom);

    const diff = datoDiff(isoFom, isoTom, 'months');

    const oppholdErIntilTolvMaaneder = diff <= 12;

    const manglerInfoTekst = 'Sjekk om oppholdet er inntil tolv måneder!';
    const positivTekst = 'Oppholdet er inntil tolv måneder.';
    const negativTekst = 'Oppholdet er mer enn 12 måneder.';

    if (diff === false) return ({ tekst: manglerInfoTekst, status: undefined });

    return (
      {
        tekst: oppholdErIntilTolvMaaneder ? positivTekst : negativTekst,
        status: oppholdErIntilTolvMaaneder,
      }
    );
  };

  erINorgeSeksManederEllerMerPerKalenderAr = () => {
    const { skjema } = this;
    const antallMaanederINorge = parseInt(skjema.antallMaanederINorge, 10);
    const erINorgeSeksMaanederEllerMer = antallMaanederINorge >= 6;

    const manglerInfoTekst = 'Sjekk om søker er i Norge seks måneder eller mer pr kalenderår!';
    const positivTekst = 'Bruker er i Norge i seks måneder eller mer pr kalenderår.';
    const negativTekst = 'Bruker er IKKE i Norge i seks måneder eller mer pr kalenderår.';

    if (skjema.antallMaanederINorge === null || skjema.antallMaanederINorge === undefined) return ({ tekst: manglerInfoTekst, status: undefined });

    return (
      {
        tekst: erINorgeSeksMaanederEllerMer ? positivTekst : negativTekst,
        status: erINorgeSeksMaanederEllerMer,
      }
    );
  };

  oppholderSegIUtlandet = () => {
    const { skjema } = this;
    const { faktaavklaringOppholdsLand } = skjema;

    const manglerInfoTekst = 'Sjekk om søker oppholder seg i utlandet!';
    const positivTekst = 'Oppholder seg i utlandet.';
    const negativTekst = 'Oppholder seg IKKE i utlandet.';

    if (!faktaavklaringOppholdsLand || faktaavklaringOppholdsLand.length === 0) return ({ tekst: manglerInfoTekst, status: undefined });

    return (
      {
        tekst: !faktaavklaringOppholdsLand.includes('NO') ? positivTekst : negativTekst,
        status: !faktaavklaringOppholdsLand.includes('NO'),
      }
    );
  };

  harSammeAdresseSomArbeidsgiver = () => {
    const { skjema } = this;
    const { sammeAdresseSomArbeidsgiver } = skjema;

    const manglerInfoTekst = 'Sjekk om søker har samme adresse som arbeidsgiver!';
    const positivTekst = 'Har samme adresse som arbeidsgiver.';
    const negativTekst = 'Har IKKE samme adresse som arbeidsgiver.';

    if (sammeAdresseSomArbeidsgiver === null || sammeAdresseSomArbeidsgiver === undefined) return ({ tekst: manglerInfoTekst, status: undefined });

    return (
      {
        tekst: sammeAdresseSomArbeidsgiver ? positivTekst : negativTekst,
        status: sammeAdresseSomArbeidsgiver,
      }
    );
  };

  harEktefelleEllerBarnINorge = () => {
    const { skjema } = this;
    const { ektefelleEllerBarnINorge } = skjema;

    const manglerInfoTekst = 'Sjekk om søker har ektefelle eller barn i Norge!';
    const positivTekst = 'Har ektefelle eller barn i Norge.';
    const negativTekst = 'Har IKKE ektefelle eller barn i Norge.';

    if (ektefelleEllerBarnINorge === null || ektefelleEllerBarnINorge === undefined) return ({ tekst: manglerInfoTekst, status: undefined });

    return (
      {
        tekst: ektefelleEllerBarnINorge ? positivTekst : negativTekst,
        status: ektefelleEllerBarnINorge,
      }
    );
  };

  harForutgaendeBostedINorge = () => {
    const { skjema } = this;
    const { forutgaendeBostedINorge } = skjema;

    const manglerInfoTekst = 'Sjekk søkers forutgående bosted i Norge!';
    const positivTekst = 'Har forutgående bosted i Norge.';
    const negativTekst = 'Har IKKE forutgående bosted i Norge.';

    if (forutgaendeBostedINorge === null || forutgaendeBostedINorge === undefined) {
      return ({ tekst: manglerInfoTekst, status: undefined });
    }

    return (
      {
        tekst: forutgaendeBostedINorge ? positivTekst : negativTekst,
        status: forutgaendeBostedINorge,
      }
    );
  };

  familieBorINorge = () => {
    const { skjema } = this;
    const { familiesBosted } = skjema;

    const erFamilieBorINorge = familiesBosted === 'NO';

    const manglerInfoTekst = 'Sjekk nærmeste families bosted!';
    const positivTekst = 'Nærmeste familie bor i Norge.';
    const negativTekst = 'Nærmeste familie bor IKKE i Norge';

    if (!familiesBosted || familiesBosted === null) return ({ tekst: manglerInfoTekst, status: undefined });

    return (
      {
        tekst: erFamilieBorINorge ? positivTekst : negativTekst,
        status: erFamilieBorINorge,
      }
    );
  };

  harAdresseIUtlandet = () => {
    const { skjema } = this;
    const { adresseIUtlandet } = skjema;

    const manglerInfoTekst = 'Sjekk om søker har adresse i utlandet!';
    const positivTekst = 'Har adresse i utlandet.';
    const negativTekst = 'Har IKKE adresse i utlandet';

    if (adresseIUtlandet === null || adresseIUtlandet === undefined) return ({ tekst: manglerInfoTekst, status: undefined });

    return (
      {
        tekst: adresseIUtlandet ? positivTekst : negativTekst,
        status: adresseIUtlandet,
      }
    );
  };

  harIntensjonOmReturTilNorge = () => {
    const { skjema } = this;
    const { intensjonOmRetur } = skjema;

    const manglerInfoTekst = 'Sjekk om søker har intensjon om retur!';
    const positivTekst = 'Har intensjon om å returnere.';
    const negativTekst = 'Har IKKE intensjon om å returnere.';

    if (intensjonOmRetur === null || intensjonOmRetur === undefined) return ({ tekst: manglerInfoTekst, status: undefined });

    return (
      {
        tekst: intensjonOmRetur ? positivTekst : negativTekst,
        status: intensjonOmRetur,
      }
    );
  }
}

export default Opphold;
