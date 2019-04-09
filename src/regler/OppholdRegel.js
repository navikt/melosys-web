import DomeneRegel from './DomeneRegel';

import { datoDiff, formatterDatoTilISO } from '../utils/dato';

/** Klassen inneholder funksjoner som hver evaluerer konkrete situasjoner basert på
 * opplysninger fra søknaden, avklartefakta og fagsak. Utfallet av hver funksjon
 * kan ende i "sann", "usann" eller mangelfull opplysninger. Tekstene som også
 * returneres som en del av objektet reflekterer også dette.
 *
 * Det er klassen DomeneRegel som extendes, som håndterer selve utformingen av
 * objektene i manglerOpplysninger eller byggRegelSvar.
 *
 * Dersom en regel mangler opplysninger (som typisk er tilfelle i en papirsøknad,
 * vil følgende objekt returneres:
 * {status: undefined, tekst: 'Sjekk at xyz er tilstede'}
 *
 * Dersom regel har har nok informasjon til å evaluere vil  objekt
 * returneres med positiv eller negativ tekst. Nedenfor er eksempel på begge:
 * {status: true, tekst: 'Har forutgående bosted i Norge'}
 * {status: false, tekst: 'Har IKKE forutgående bosted i Norge'}
 */
class OppholdRegel extends DomeneRegel {
  inntilTolvMaaneder = () => {
    const { skjema } = this;
    const { oppholdUtlandFom, oppholdUtlandTom } = skjema;
    const isoFom = formatterDatoTilISO(oppholdUtlandFom);
    const isoTom = formatterDatoTilISO(oppholdUtlandTom);

    const diff = datoDiff(isoFom, isoTom, 'months');

    const erOppholdTolvMaaneder = diff <= 12;

    const manglerInfoTekst = 'Sjekk om oppholdet er inntil tolv måneder!';
    const positivTekst = 'Oppholdet er inntil tolv måneder.';
    const negativTekst = 'Oppholdet er mer enn 12 måneder.';

    if (diff === false) return this.manglerOpplysninger(manglerInfoTekst);
    return this.byggRegelSvar(erOppholdTolvMaaneder, positivTekst, negativTekst);
  };

  erINorgeSeksManederEllerMerPerKalenderAr = () => {
    const { skjema } = this;
    const antallMaanederINorge = parseInt(skjema.antallMaanederINorge, 10);
    const erINorgeSeksMaanederEllerMer = antallMaanederINorge >= 6;

    const manglerInfoTekst = 'Sjekk om søker er i Norge seks måneder eller mer pr kalenderår!';
    const positivTekst = 'Bruker er i Norge i seks måneder eller mer pr kalenderår.';
    const negativTekst = 'Bruker er IKKE i Norge i seks måneder eller mer pr kalenderår.';

    const harMangelfulleOpplysninger = (skjema.antallMaanederINorge === null || skjema.antallMaanederINorge === undefined);
    if (harMangelfulleOpplysninger) { return this.manglerOpplysninger(manglerInfoTekst); }

    return this.byggRegelSvar(erINorgeSeksMaanederEllerMer, positivTekst, negativTekst);
  };

  oppholderSegIUtlandet = () => {
    const { skjema } = this;
    const { avklartefaktaOppholdsLand } = skjema;

    const manglerInfoTekst = 'Sjekk om søker oppholder seg i utlandet!';
    const positivTekst = 'Oppholder seg i utlandet.';
    const negativTekst = 'Oppholder seg IKKE i utlandet.';

    const harMangelfulleOpplysninger = (!avklartefaktaOppholdsLand || avklartefaktaOppholdsLand.length === 0);
    if (harMangelfulleOpplysninger) { return this.manglerOpplysninger(manglerInfoTekst); }

    return this.byggRegelSvar(!avklartefaktaOppholdsLand.includes('NO'), positivTekst, negativTekst);
  };

  harSammeAdresseSomArbeidsgiver = () => {
    const { skjema } = this;
    const { sammeAdresseSomArbeidsgiver } = skjema;

    const manglerInfoTekst = 'Sjekk om søker har samme adresse som arbeidsgiver!';
    const positivTekst = 'Har samme adresse som arbeidsgiver.';
    const negativTekst = 'Har IKKE samme adresse som arbeidsgiver.';

    const harMangelfulleOpplysninger = (sammeAdresseSomArbeidsgiver === null || sammeAdresseSomArbeidsgiver === undefined);
    if (harMangelfulleOpplysninger) { return this.manglerOpplysninger(manglerInfoTekst); }

    return this.byggRegelSvar(sammeAdresseSomArbeidsgiver, positivTekst, negativTekst);
  };

  harEktefelleEllerBarnINorge = () => {
    const { skjema } = this;
    const { ektefelleEllerBarnINorge } = skjema;

    const manglerInfoTekst = 'Sjekk om søker har ektefelle eller barn i Norge!';
    const positivTekst = 'Har ektefelle eller barn i Norge.';
    const negativTekst = 'Har IKKE ektefelle eller barn i Norge.';

    const harMangelfulleOpplysninger = (ektefelleEllerBarnINorge === null || ektefelleEllerBarnINorge === undefined);
    if (harMangelfulleOpplysninger) { return this.manglerOpplysninger(manglerInfoTekst); }

    return this.byggRegelSvar(ektefelleEllerBarnINorge, positivTekst, negativTekst);
  };

  harForutgaendeBostedINorge = () => {
    const { skjema } = this;
    const { forutgaendeBostedINorge } = skjema;

    const manglerInfoTekst = 'Sjekk søkers forutgående bosted i Norge!';
    const positivTekst = 'Har forutgående bosted i Norge.';
    const negativTekst = 'Har IKKE forutgående bosted i Norge.';

    const harMangelfulleOpplysninger = (forutgaendeBostedINorge === null || forutgaendeBostedINorge === undefined);
    if (harMangelfulleOpplysninger) { return this.manglerOpplysninger(manglerInfoTekst); }

    return this.byggRegelSvar(forutgaendeBostedINorge, positivTekst, negativTekst);
  };

  familieBorINorge = () => {
    const { skjema } = this;
    const { familiesBosted } = skjema;

    const erFamilieBorINorge = familiesBosted === 'NO';

    const manglerInfoTekst = 'Sjekk nærmeste families bosted!';
    const positivTekst = 'Nærmeste familie bor i Norge.';
    const negativTekst = 'Nærmeste familie bor IKKE i Norge';

    const harMangelfulleOpplysninger = (!familiesBosted || familiesBosted === null);
    if (harMangelfulleOpplysninger) { return this.manglerOpplysninger(manglerInfoTekst); }

    return this.byggRegelSvar(erFamilieBorINorge, positivTekst, negativTekst);
  };

  harAdresseIUtlandet = () => {
    const { skjema } = this;
    const { adresseIUtlandet } = skjema;

    const manglerInfoTekst = 'Sjekk om søker har adresse i utlandet!';
    const positivTekst = 'Har adresse i utlandet.';
    const negativTekst = 'Har IKKE adresse i utlandet';

    const harMangelfulleOpplysninger = (adresseIUtlandet === null || adresseIUtlandet === undefined);
    if (harMangelfulleOpplysninger) { return this.manglerOpplysninger(manglerInfoTekst); }

    return this.byggRegelSvar(adresseIUtlandet, positivTekst, negativTekst);
  };

  harIntensjonOmReturTilNorge = () => {
    const { skjema } = this;
    const { intensjonOmRetur } = skjema;

    const manglerInfoTekst = 'Sjekk om søker har intensjon om retur!';
    const positivTekst = 'Har intensjon om å returnere.';
    const negativTekst = 'Har IKKE intensjon om å returnere.';

    const harMangelfulleOpplysninger = (intensjonOmRetur === null || intensjonOmRetur === undefined);
    if (harMangelfulleOpplysninger) { return this.manglerOpplysninger(manglerInfoTekst); }

    return this.byggRegelSvar(intensjonOmRetur, positivTekst, negativTekst);
  }
}

export default OppholdRegel;
