import moment from 'moment';

/**
 * Saksbehandlere har forskjellig måte å taste inn datoer på. Denne funksjonen forsøker å
 * vaske / tolke datoene og returnere en korrekt formattert dato.
 *
 * Eksempel på mulige datoinput: '260479', '26041979', '26-04-79', '26-04-1979', '26/04/79', '26.04.1979' etc.
 * Datoer må være tastet inn i rekkefølgen DD MM ÅÅ(ÅÅ)
 * @param dato String Datoen som sakebehandleren har tastet inn.
 * @returns String Datoen som er vasket og stringified.
 */
const MAX_AR_FREM_I_TID = 10;

/** Gjør et beste forsøk på å vaske inputdato. Dersom vask ikke er mulig (feks ved helt feil datoformat eller
 * ugyldig dato, returner false.
 * @param dato
 * @returns {String | Boolean } Datoen
 */
const vaskInputDato = dato => {
  if (dato === null || dato === undefined) return false;

  // Godta type number, men gjør den om til string først.
  const stringDato = Number.isInteger(dato) ? String.toString(dato) : dato;

  // Fjern alle skille-tegn med mål om en ren tallrekke i datoen.
  const newDate = stringDato.replace(/[-./]/g, '');

  // Hvis datoen er mindre enn 6 tegn - dvs at dag, måned eller år er tastet med
  // kun 1 siffer ("51217" istedet for "051217"), returner ''.
  if (newDate.length < 6 || newDate.length > 8) {
    return false;
  }

  // const dateArray = newDate.match(/(..?)/g);
  const dateArray = [newDate.substr(0, 2), parseInt(newDate.substr(2, 2), 10), parseInt(newDate.substr(4), 10)];

  // Hvis kun de to siste årstallene er tastet inn, må vi gjøre en gjetning på hvilket århundre det
  // dreier seg om. Det er ikke sannsynlig at datoen gjelder for mer enn 10 år frem tid, så gjett da
  // på at det dreier se om århundre 19.
  if (dateArray[2] < 100) {
    const dagensAr = (new Date()).getFullYear();
    const testAr = parseInt(`${dagensAr.toString().substr(0, 2)}${dateArray[2]}`, 10);
    const gjettAarhundre = (testAr - dagensAr > MAX_AR_FREM_I_TID) ? '19' : '20';
    const toTallsAar = dateArray[2] < 10 ? `0${dateArray[2]}` : dateArray[2];
    dateArray[2] = parseInt(`${gjettAarhundre}${toTallsAar}`, 10);
  }

  const returnDate = moment(dateArray.join(), 'DDMMYYYY').format('DD.MM.YYYY');

  if (!moment(dateArray.join(), 'DDMMYYYY').isValid()) {
    return false;
  }

  return returnDate;
};

/** Normalisering gjennom Redux prop (normaize) sender 2 argumenter. Dersom disse er forskjellige,
 * indikerer det at brukeren ikke har forlatt skjemafeltet. Normalize kalles altså en ekstra gang onBlur.
 * Først dersom begge verdiene er like skal normalisering skje.
 *
 * @param verdi Totalverdien av feltet ETTER siste tastetrykk
 * @param forrigeVerdi Totalverdien av feltet FØR siste tastetrykk
 * @returns {String}
 */
const normaliserInputDato = (verdi, forrigeVerdi) => {
  const vasketDato = vaskInputDato(verdi) ? vaskInputDato(verdi) : verdi;
  return ((verdi === forrigeVerdi) ? vasketDato : verdi);
};

/** Gjør en vurdering av innkomne datoformat og formatter til korrekt DD.MM.YYY, med eller uten tidspunkt.
 * Moment kunne ha vært benyttet direkte i hver komponent, men denne funksjonen tillater begge datoformater i tillegg
 * til å enklere åpne opp for dato med eller uten tidspunkt.
 *
 */
function formatterDatoTilNorsk(dato, visTidspunkt) {
  const inputFormat = ['YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ss', 'DD-MM-YYYY', 'DD-MM-YYYY HH:mm'];
  const momentFormat = visTidspunkt ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY';
  const momentDato = moment.utc(dato, inputFormat);
  return momentDato.isValid() ? momentDato.local().format(momentFormat) : '';
}

/** Forutsatt at datoen er validert korrekt norsk (DD.MM.YYYY HH:mm), formatter den til det maskinlesbare
 * formatet "YYYY-MM-DDTHH:mm:ss"
 *
 */
function formatterDatoTilISO(dato, tid) {
  const inputFormat = ['DD.MM.YYYY HH:mm', 'DD.MM.YYYY'];
  const momentFormat = tid ? 'YYYY-MM-DDTHH:mm:ss' : 'YYYY-MM-DD';
  return moment(dato, inputFormat).format(momentFormat);
}

/** Enkelte data kommer fra backend i form av en "kortdato", feks 2017-01. Denne funksjonen
 * formatterer om datoen til "jan - 2017" for bedre lesbarhet.
 */
function formatterKortDatoTilNorsk(kortDato) {
  const dato = moment(kortDato, 'YYYY-MM');
  return `${dato.format('MMM')} - ${dato.format('YYYY')}`;
}

function erGyldigPeriode(fom, tom) {
  const inputFormat = ['DD.MM.YYYY'];
  return moment(fom, inputFormat).isBefore(moment(tom, inputFormat));
}

function erIPeriode(fom, tom, dato) {
  return moment(dato).isBetween(fom, tom);
}

function datoDiff (fom, tom, enhet = 'months', presis = true) {
  if (!moment(fom, 'YYYY-MM-DD').isValid() || !moment(tom, 'YYYY-MM-DD').isValid()) return false;
  const momentTom = moment(tom).add(1, 'day');
  return moment(momentTom).diff(fom, enhet, presis);
}

function datoDiffMenneskelig (fom, tom) {
  if (!moment(fom, 'YYYY-MM-DD').isValid() || !moment(tom, 'YYYY-MM-DD').isValid()) return false;

  const forskjellManeder = Math.floor(datoDiff(fom, tom, 'months'));

  const resterendeFOM = moment(fom).add(forskjellManeder, 'months');

  const forskjellDager = datoDiff(resterendeFOM, tom, 'days');

  const manedBenevnelse = forskjellManeder === 1 ? 'måned' : 'måneder';
  const dagBenevnelse = forskjellDager === 1 ? 'dag' : 'dager';

  return forskjellDager > 0 ?
    (`${forskjellManeder} ${manedBenevnelse} og ${forskjellDager} ${dagBenevnelse}`)
    :
    (`${forskjellManeder} ${manedBenevnelse}`);
}

function beregnAlder (foedselsdato) {
  return moment().diff(foedselsdato, 'years');
}

export {
  vaskInputDato,
  normaliserInputDato,
  formatterDatoTilNorsk,
  formatterDatoTilISO,
  formatterKortDatoTilNorsk,
  datoDiff,
  datoDiffMenneskelig,
  beregnAlder,
  erGyldigPeriode,
  erIPeriode,
  MAX_AR_FREM_I_TID,
};
