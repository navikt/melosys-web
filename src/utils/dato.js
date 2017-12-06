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
 * @returns {String | Bool } Datoen
 */
const vaskInputDato = dato => {
  // Fjern alle skille-tegn med mål om en ren tallrekke i datoen.
  const newDate = dato.replace(/[-./]/g, '');

  // Hvis datoen fortsatt ikke er et heltall eller er mindre enn 6 siffer så er noe galt skrevet inn. Returner ''.
  if (newDate.length < 6) {
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
    const guessCentury = (testAr - dagensAr > MAX_AR_FREM_I_TID) ? '19' : '20';
    dateArray[2] = parseInt(`${guessCentury}${dateArray[2]}`, 10);
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

export {
  vaskInputDato,
  normaliserInputDato,
  MAX_AR_FREM_I_TID,
};
