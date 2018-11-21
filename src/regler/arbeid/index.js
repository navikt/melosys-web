import DomeneRegel from '../domeneRegel';

import { datoDiff, formatterDatoTilISO } from '../../utils/dato';

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
class Arbeid extends DomeneRegel {
  erArbeidsforholdetRelevantForSoknadsperioden = ansettelsesPeriode => {
    const { skjema } = this;
    const { oppholdUtlandFom, oppholdUtlandTom } = skjema;
    const { fom: ansattStartDato, tom: ansattSluttDato } = ansettelsesPeriode;

    const oppholdStartDato = formatterDatoTilISO(oppholdUtlandFom);
    const oppholdSluttDato = formatterDatoTilISO(oppholdUtlandTom);

    const erAnsattVedPeriodeStart = datoDiff(ansattStartDato, oppholdStartDato, 'days') >= 1;
    const erAnsattVedPeriodeSlutt = datoDiff(ansattSluttDato, oppholdSluttDato, 'days') <= 0;

    const positivTekst = 'Arbeidsforholdet er relevant innenfor søknadsperioden.';
    const negativTekst = 'Arbeidsforholdet er IKKE relevant innenfor søknadsperioden.';

    const erRelevant = (erAnsattVedPeriodeStart && erAnsattVedPeriodeSlutt);
    return this.byggRegelSvar(erRelevant, positivTekst, negativTekst);
  }
}

export default Arbeid;
