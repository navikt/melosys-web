// selector(s)
import { createSelector, createStructuredSelector } from 'reselect';
import moment from 'moment/moment';
import * as KV from '../../kodeverk';

import { soknadSelectors } from '../soknad/';
import { datoDiff } from '../../utils/dato';

export const PersonSelector = createSelector(
  state => (state.fagsaker.data.behandling ? state.fagsaker.data.behandling.saksopplysninger.person : state.fagsaker.data),
  person => person
);

export const OrganisasjonerSelector = createSelector(
  state => (state.fagsaker.data.behandling ? state.fagsaker.data.behandling.saksopplysninger.organisasjoner : []),
  organisasjoner => organisasjoner || []
);

export const SakOgBehandlingSelector = createSelector(
  state => (state.fagsaker.data.behandling ? state.fagsaker.data.behandling.saksopplysninger.sakOgBehandling : {}),
  sakOgBehandling => sakOgBehandling || {}
);

export const RedigerbartSelector = createSelector(
  state => (state.fagsaker.data.behandling ? state.fagsaker.data.behandling.redigerbart : false),
  redigerbart => redigerbart
);

export const FagsakStatusSelector = createSelector(
  state => (state.fagsaker.data.saksstatus ? state.fagsaker.data.saksstatus.kode : ''),
  fagsakStatus => fagsakStatus
);

export const SaksopplysningerSelector = createSelector(
  state => (state.fagsaker.data.behandling ? state.fagsaker.data.behandling.saksopplysninger : {}),
  saksopplysninger => saksopplysninger || {}
);

/**
 * INNTEKT
 * ---------------------------------------------------------------------------------------
 * Denne seksjonen inneholder selectorer og delfunksjoner for å håndtere, omstrukturere og
 * vise inntekt. Inntekt i en fagsak kommer inn som ett objekt med nøstede arrays hvor flere
 * typer inntekt kommer inn fra en eller flere opplysningspliktige.
 *
 */

/**
 * Inntekt er nøstet inn i måned og deretter en blanding av flere inntektstyper fra enten samme
 * opplysningspliktigID eller forskjellige opplysningspliktigID. I tillegg er det mye data
 * som vi ikke har behov for. For å kunne gjøre fremtidige filtreringer ønsker vi å omforme
 * den opprinnelige modellen til en flatere modell:
 *
 * [{ opplysningspliktigID: '123456789', beloep: 100000, aarMaaned: '2017-18' }]
 *
 * @param arbeidsInntektMaanedListe Det opprinnelige objektet for inntekten.
 */
const lagFlatInntektListe = arbeidsInntektMaanedListe => (
  arbeidsInntektMaanedListe.reduce((samling, enkeltMaaned) => {
    const { arbeidsInntektInformasjon, aarMaaned } = enkeltMaaned;
    if (!arbeidsInntektInformasjon) return [];
    const { inntektListe } = arbeidsInntektInformasjon;
    if (!inntektListe) return [];

    const inntekterForEnkeltMaaned = inntektListe.reduce((samlingAvInntekterDenneMaaneden, enkelInntekt) => {
      const { opplysningspliktigID, beloep } = enkelInntekt;
      return [...samlingAvInntekterDenneMaaneden, { opplysningspliktigID, beloep, aarMaaned }];
    }, []);

    return [...samling, ...inntekterForEnkeltMaaned];
  }, [])
);

/**
 * Inntekter fra samme opplysningspliktigID kan ha flere typer og dermed komme inn som
 * separate objekter. Type inntekt kan være 'lønnsinntekt', 'bonusinntekt', 'feriepenger' etc.
 * Navn på typene er ikke viktige, men vi ønsker bare å vise én inntektssum fra samme opplysningspliktigID
 * i en enkelt måned.
 *
 * Funksjonen nedenfor traverserer alle intekter og summerer de som kommer fra samme opplysningspliktigID.
 * @param flatInntektListe Den flate inntektslisten som inneholder alle del-inntekter.
 */
const summerInntektsTyperFraSammeOpplysningspliktig = flatInntektListe => (
  flatInntektListe.reduce((samling, enkeltInntekt) => {
    const eksisterendeInntektFunnetVedIndeks = samling
      .findIndex(element => (element.opplysningspliktigID === enkeltInntekt.opplysningspliktigID) && element.aarMaaned === enkeltInntekt.aarMaaned);

    const nyEnkeltInntekt = eksisterendeInntektFunnetVedIndeks > -1 ? samling[eksisterendeInntektFunnetVedIndeks] : enkeltInntekt;
    nyEnkeltInntekt.beloep = eksisterendeInntektFunnetVedIndeks > -1 ? nyEnkeltInntekt.beloep + enkeltInntekt.beloep : nyEnkeltInntekt.beloep;
    nyEnkeltInntekt.beloep = Math.max(nyEnkeltInntekt.beloep, 0);

    // Dersom ingen eksisterende inntekt på opplysningspliktigID ble funnet vil eksisterendeInntektFunnetVedIndeks være 0
    // og samlingen vil dermed ikke påvirkes av filteret nedenfor
    const nySamling = samling.filter((enkelt, indeks) => indeks !== eksisterendeInntektFunnetVedIndeks);

    return [...nySamling, nyEnkeltInntekt];
  }, [])
);

/** Denne funksjonen filtrerer inntekten som finnes innenfor den relevante perioden (søknadsdato minus 6 måneder)
 * Dersom det ikke finnes inntekt, vil den sette inntekten til 0 slik at denne måneden fortsatt kommer med
 * i den grafiske fremstillingen.
 *
 * @param relevantPeriode Den relevante perioden som det skal vises inntekt på.
 * @param orgnr Organisasjonsnummmeret som det filtreres på.
 * @param inntekter Listen over ufiltrerte inntekter.
 * @returns {any[]}
 */
const filtrerOgSpreInntekt = (relevantPeriode, orgnr, inntekter) => {
  const filtrerteInntekterFraOpplysningspliktig = inntekter.filter(inntekt => inntekt.opplysningspliktigID === orgnr);
  if (filtrerteInntekterFraOpplysningspliktig.length === 0) { return []; }

  const startDato = relevantPeriode.fom;
  const antallMaaneder = parseInt(datoDiff(relevantPeriode.fom, relevantPeriode.tom, 'months'), 10) + 1;

  if (relevantPeriode.fom === 'Invalid date' || relevantPeriode.tom === 'Invalid date') { return ([]); }

  return Array(antallMaaneder).fill({}).map((verdi, index) => {
    const aarMaaned = moment(startDato).add(index, 'months').format('YYYY-MM');

    const eksisterendeInntektFunnetVedIndeks = filtrerteInntekterFraOpplysningspliktig.findIndex(enkeltInntekt => enkeltInntekt.aarMaaned === aarMaaned);

    return eksisterendeInntektFunnetVedIndeks > -1
      ?
      filtrerteInntekterFraOpplysningspliktig[eksisterendeInntektFunnetVedIndeks]
      :
      { aarMaaned, beloep: 0, opplysningspliktigID: orgnr };
  });
};

export const InntektSelector = createSelector(
  state => (state.fagsaker.data.behandling ? state.fagsaker.data.behandling.saksopplysninger.inntekt : {}),
  inntekt => {
    if (!inntekt) return [];
    const { arbeidsInntektMaanedListe } = inntekt;
    if (!arbeidsInntektMaanedListe) return [];

    const flatInntektsListe = lagFlatInntektListe(arbeidsInntektMaanedListe);
    return summerInntektsTyperFraSammeOpplysningspliktig(flatInntektsListe);
  }
);

export const SoknadenSelector = createSelector(
  state => (state.fagsaker.data.behandling ? state.fagsaker.data.behandling.saksopplysninger.soknaden : state.fagsaker.data),
  soknaden => soknaden
);

export const InntektSoknadenSelector = createStructuredSelector({
  inntekt: InntektSelector,
  soknaden: SoknadenSelector,
});

export const BekreftelserSelector = createSelector(
  state => (state.fagsaker.data.behandling ? {} : {}),
  bekreftelser => bekreftelser
);

export const MedlemskapSelector = createSelector(
  state => (state.fagsaker.data.behandling ? state.fagsaker.data.behandling.saksopplysninger.medlemskap : {}),
  medlemskap => {
    // Medlemskapskoder fra kodeverk
    const PERIODE_MED_MEDLEMSKAP = 'PMMEDSKP';
    const PERIODE_UTEN_MEDLEMSKAP = 'PUMEDSKP';
    const GYLDIG_MEDLEMSKAP = 'GYLD';
    const UAVKLART_MEDLEMSKAP = 'UAVK';
    const AVVIST_MEDLEMSKAP = 'AVST';

    const { medlemsperiode } = medlemskap;
    if (!medlemsperiode) return null;

    return {
      perioderMed: medlemsperiode.filter(periode => KV.objektTilKode(periode.periodetype) === PERIODE_MED_MEDLEMSKAP && KV.objektTilKode(periode.status) === GYLDIG_MEDLEMSKAP),
      perioderUten: medlemsperiode.filter(periode => KV.objektTilKode(periode.periodetype) === PERIODE_UTEN_MEDLEMSKAP && KV.objektTilKode(periode.status) !== AVVIST_MEDLEMSKAP),
      perioderUavklart: medlemsperiode.filter(periode => KV.objektTilKode(periode.status) === UAVKLART_MEDLEMSKAP),
    };
  }
);

/**
 * Arbeidsforhold refererer til organisasjon med arbeidsforholdID. For at komponenten skal kunne vise
 * navn på arbeidsgiver og evt adresse etc må dette flettes inn i arbeidsforhold. Selectoren gjør en map p
 * alle arbeidsforhold og finner relevant organisasjon etter orgnr og setter hele dette objektet inn
 * i arbeidsforholdet dersom det finnes.
 */
export const ArbeidsforholdeneSelector = createSelector(
  state => (state.fagsaker.data.behandling ? state.fagsaker.data.behandling.saksopplysninger.arbeidsforhold : []),
  state => OrganisasjonerSelector(state),
  state => InntektSelector(state),
  (arbeidsforhold, organisasjoner, inntekt) => (arbeidsforhold.map(item => {
    if (!arbeidsforhold || !organisasjoner || !inntekt) return [];
    const arbeid = { ...item };
    arbeid.arbeidsgiver = organisasjoner.find(org => org.orgnr === arbeid.arbeidsgiverID) || {};
    arbeid.inntekt = inntekt.filter(linje => linje.opplysningspliktigID === arbeid.arbeidsgiverID) || [];
    return arbeid;
  }))
);

/** Finner alle organisasjonsnummer som er listet i arbeidsforhold.
 * Det er range i arbeidsforhold som avgjør hvilke organisasjoner som selectoren
 * regner som relevante å vise.
 */
export const OrganisasjonSelector = createSelector(
  state => OrganisasjonerSelector(state),
  state => ArbeidsforholdeneSelector(state),
  (organisasjoner, arbeidsforholdene) => {
    // Lag en array med orgnummer (arbeidsgiverID)
    const alleRelevanteOrgnummer = arbeidsforholdene.reduce((samling, element) => [...samling, element.arbeidsgiverID], []);
    // Filter organisasjoner hvis orgnr er inkludert i arrayen alleRelevanteOrgnummer.
    return organisasjoner.filter(item => alleRelevanteOrgnummer.includes(item.orgnr));
  }
);

/** Hjelpefunksjon for ArbeidsgivereNorgeSelector. Funksjonen bygger en ny gruppe av et arbeidsforhold
 * med arbeidsforholdene (array), inntekter (array) og organisasjonen (objekt)
 * @param arbeidsforholdet
 * @param organisasjoner
 * @param inntekter
 * @param relevantPeriode
 * @returns {{arbeidsforholdene: *[], organisasjon: *, inntekter: any[]}}
 */
const byggNyArbeidsforholdGruppe = (arbeidsforholdet, organisasjoner, inntekter, relevantPeriode) => (
  {
    arbeidsforholdene: [arbeidsforholdet],
    organisasjon: organisasjoner.find(org => org.orgnr === arbeidsforholdet.opplysningspliktigID) || {},
    inntektListe: filtrerOgSpreInntekt(relevantPeriode, arbeidsforholdet.opplysningspliktigID, inntekter),
  }
);

/** Denne funksjonen gjør følgende:
 * 1. Itererer alle arbeidsforhold og grupperer de inn etter opplysningspliktigID (dvs juridisk arbeidsgiver)
 * 2. Dersom en gruppe av opplysningspliktigID ikke eksisterer fra før, lages den via byggNyArbeidsforholdGruppe
 *
 * Etterpå returneres hele arrayen med sub-arrays som hver inneholder grupperinger av
 *  - organisasjon (juridisk arbeidsgiver)
 *  - arbeidsforholdene (virksomhetene)
 *  - inntekt
 */
export const ArbeidsgivereNorgeSelector = createSelector(
  state => OrganisasjonerSelector(state),
  state => ArbeidsforholdeneSelector(state),
  state => InntektSelector(state),
  state => soknadSelectors.SoknadsperiodeSelector(state),
  (organisasjoner, arbeidsforholdene, inntekter, oppholdsPeriode) => {
    // Inntekten skal vises 6 måneder forut for startdato. Dersom søknaden gjelder en periode
    // tilbake i tid, skal også inntekt i selve perioden vises.

    const { fom: soknadPeriodeStart, tom: soknadPeriodeSlutt } = oppholdsPeriode;
    if (!soknadPeriodeStart && !soknadPeriodeSlutt) { return []; }

    const relevantPeriodeStart = moment(soknadPeriodeStart, 'YYYY-MM-DD')
      .subtract(6, 'months')
      .format('YYYY-MM-DD');

    const relevantPeriodeSlutt = moment(soknadPeriodeSlutt, 'YYYY-MM-DD') < moment() ? soknadPeriodeSlutt : moment().format('YYYY-MM-DD');

    const relevantPeriode = {
      fom: relevantPeriodeStart,
      tom: relevantPeriodeSlutt,
    };

    return arbeidsforholdene.reduce((samling, arbeidsforholdet) => {
      const tmpSamling = [...samling];

      // Sjekk om det allerede er laget en gruppe for den aktuelle opplysningspliktigID.
      const arbeidsforholdEksistererVedIndeks = samling
        .findIndex(enkelt =>
          enkelt.arbeidsforholdene.some(enkeltforhold =>
            enkeltforhold.opplysningspliktigID === arbeidsforholdet.opplysningspliktigID));

      if (arbeidsforholdEksistererVedIndeks > -1) {
        tmpSamling[arbeidsforholdEksistererVedIndeks].arbeidsforholdene.push(arbeidsforholdet);
      } else {
        tmpSamling.push(byggNyArbeidsforholdGruppe(arbeidsforholdet, organisasjoner, inntekter, relevantPeriode));
      }
      return tmpSamling;
    }, []);
  }
);

export const OppsummeringSelector = createSelector(
  state => (state.fagsaker.data ? state.fagsaker.data : {}),
  state => (state.fagsaker.data.behandling ? state.fagsaker.data.behandling.oppsummering : []),
  (saksdata, oppsummering) => ({
    saksnummer: saksdata.saksnummer,
    sakstype: saksdata.sakstype,
    saksstatus: saksdata.saksstatus,
    behandlingsstatus: oppsummering.behandlingsstatus,
    registrertDato: oppsummering.registrertDato,
    sisteOpplysningerHentetDato: oppsummering.sisteOpplysningerHentetDato,
    behandlingstype: oppsummering.behandlingstype,
  })
);
