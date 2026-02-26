import moment from "moment";
import momentTZ from "moment-timezone";

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

/**
 * Z indikerer at datoen er i UTC tidssone, i vinteren er det 1 time forskjell mellom UTC og norsk tid.
 * 08:00 er derfor kl 09:00 i norsk tid.
 */
const FLYT_PRODUKSJON_DATO_EØS_11_3_B = moment("2026-02-26T08:00:00Z");

/** Gjør et beste forsøk på å vaske inputdato. Dersom vask ikke er mulig (feks ved helt feil datoformat eller
 * ugyldig dato, returner false.
 * @param dato
 * @returns {String | Boolean } Datoen
 */
const vaskInputDato = (dato) => {
  if (dato === null || dato === undefined) return false;

  // Godta type number, men gjør den om til string først.
  const stringDato = Number.isInteger(dato) ? String.toString(dato) : dato;

  // Fjern alle skille-tegn med mål om en ren tallrekke i datoen.
  const newDate = stringDato.replace(/[-./]/g, "");

  // Hvis datoen er noe annet enn 6 eller 8 tegn, returner ''.
  // Formatene vi støtter er 2 siffer for dag og måned, og 2 eller 4 siffer for år.
  if (!(newDate.length === 6 || newDate.length === 8)) {
    return false;
  }

  // const dateArray = newDate.match(/(..?)/g);
  const dateArray = [newDate.substr(0, 2), parseInt(newDate.substr(2, 2), 10), parseInt(newDate.substr(4), 10)];

  // Hvis kun de to siste årstallene er tastet inn, må vi gjøre en gjetning på hvilket århundre det
  // dreier seg om. Det er ikke sannsynlig at datoen gjelder for mer enn 10 år frem tid, så gjett da
  // på at det dreier se om århundre 19.
  if (dateArray[2] < 100) {
    const dagensAr = new Date().getFullYear();
    const testAr = parseInt(`${dagensAr.toString().substr(0, 2)}${dateArray[2]}`, 10);
    const gjettAarhundre = (testAr - dagensAr > MAX_AR_FREM_I_TID ? dagensAr - 100 : dagensAr).toString().substr(0, 2);
    const toTallsAar = dateArray[2] < 10 ? `0${dateArray[2]}` : dateArray[2];
    dateArray[2] = parseInt(`${gjettAarhundre}${toTallsAar}`, 10);
  }

  const returnDate = moment(dateArray.join(), "DDMMYYYY").format("DD.MM.YYYY");

  if (!moment(dateArray.join(), "DDMMYYYY").isValid()) {
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
  return verdi === forrigeVerdi ? vasketDato : verdi;
};

/** Gjør en vurdering av innkomne datoformat og formatter til korrekt DD.MM.YYY, med eller uten tidspunkt.
 * Moment kunne ha vært benyttet direkte i hver komponent, men denne funksjonen tillater begge datoformater i tillegg
 * til å enklere åpne opp for dato med eller uten tidspunkt.
 *
 */
function formatterDatoTilNorsk(dato, visTidspunkt = false, defaultValue = "") {
  const inputFormat = ["YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss", "DD-MM-YYYY", "DD-MM-YYYY HH:mm"];
  const momentFormat = visTidspunkt ? "DD.MM.YYYY HH:mm" : "DD.MM.YYYY";
  const momentDato = moment.utc(dato, inputFormat);
  return momentDato.isValid() ? momentTZ(momentDato).tz("Europe/Oslo").format(momentFormat) : defaultValue;
}

function vaskOgFormatterDatoTilNorsk(dato, defaultValue = "") {
  if (dato?.length === 6 || dato?.length === 8) {
    const vasketDato = vaskInputDato(dato);
    if (!vasketDato) return defaultValue;
    return formatterDatoTilNorsk(vasketDato, defaultValue);
  }
  return formatterDatoTilNorsk(dato, defaultValue);
}

/**
 * Vasker og formaterer dato-array til ISO format. Må være en array av objekter med fomDato og tomDato.
 *
 * @param {Array} perioder - Array av objekter med fomDato og tomDato.
 * @param {string} [defaultValue] - Standardverdi hvis dato er ugyldig.
 * @returns {Array}
 */
const vaskOgFormaterDatoerTilIso = (perioder, defaultValue = undefined) => {
  if (!Array.isArray(perioder)) {
    return [];
  }
  return perioder.map((periode) => ({
    ...periode,
    fomDato: periode.fomDato ? vaskOgFormatterTilISO(periode.fomDato, defaultValue) : defaultValue,
    tomDato: periode.tomDato ? vaskOgFormatterTilISO(periode.tomDato, defaultValue) : defaultValue,
  }));
};

/** Forutsatt at datoen er validert korrekt norsk (DD.MM.YYYY HH:mm), formatter den til det maskinlesbare
 * formatet "YYYY-MM-DD
 *
 * @param {string|undefined} dato
 * @param {string|null} [defaultValue]
 * @returns {string|null}
 */
function formatterDatoTilISO(dato, defaultValue = "Invalid date") {
  const inputFormat = ["DD.MM.YYYY HH:mm", "DD.MM.YYYY"];
  const isoDato = moment(dato, inputFormat).format("YYYY-MM-DD");
  return isoDato === "Invalid date" ? defaultValue : isoDato;
}

/**
 * Kombinerer vasking av datoinput og konvertering til ISO format.
 * Håndterer ulike input-formater som "030323", "03032023" og konverterer til "2023-03-03"
 *
 * @param {string} dato Datoen som skal vaskes og konverteres
 * @param {string} [defaultValue=null] Verdien som returneres hvis datoen er ugyldig
 * @returns {string|null} ISO-formatert dato eller defaultValue hvis ugyldig
 */
function vaskOgFormatterTilISO(dato, defaultValue = null) {
  if (dato?.length === 6 || dato?.length === 8) {
    const vasketDato = vaskInputDato(dato);
    if (!vasketDato) return defaultValue;
    return formatterDatoTilISO(vasketDato, defaultValue);
  }
  return formatterDatoTilISO(dato, defaultValue);
}

/** Enkelte data kommer fra backend i form av en "kortdato", feks 2017-01. Denne funksjonen
 * formatterer om datoen til "jan - 2017" for bedre lesbarhet.
 */
function formatterKortDatoTilNorsk(kortDato) {
  const dato = moment(kortDato, "YYYY-MM");
  return `${dato.format("MMM")} - ${dato.format("YYYY")}`;
}

function erGyldigPeriode(fom, tom) {
  const inputFormats = ["DD.MM.YYYY", "YYYY-MM-DD"];
  return moment(fom, inputFormats).isSameOrBefore(moment(tom, inputFormats));
}

function erIPeriode(fom, tom, dato, inclusivity) {
  return moment(dato).isBetween(fom, tom, undefined, inclusivity);
}

function datoDiff(fom, tom, enhet = "months", presis = true) {
  if (!moment(fom, "YYYY-MM-DD").isValid() || !moment(tom, "YYYY-MM-DD").isValid()) return false;
  const momentTom = moment(tom).add(1, "day");
  return moment(momentTom).diff(fom, enhet, presis);
}

function datoDiffNorskFormat(fom, tom, enhet = "months", presis = true) {
  if (!moment(fom, "DD.MM.YYYY").isValid() || !moment(tom, "DD.MM.YYYY").isValid()) return false;
  const momentFom = moment(fom, "DD.MM.YYYY");
  const momentTom = moment(tom, "DD.MM.YYYY").add(1, "day");
  return moment(momentTom).diff(momentFom, enhet, presis);
}

function datoDiffPure(fom, tom, enhet = "months", presis = true) {
  if (!moment(fom, "YYYY-MM-DD").isValid() || !moment(tom, "YYYY-MM-DD").isValid()) return false;
  return moment(fom).diff(tom, enhet, presis);
}

function datoDiffMenneskelig(fom, tom) {
  if (!moment(fom, "YYYY-MM-DD").isValid() || !moment(tom, "YYYY-MM-DD").isValid()) return false;

  const forskjellManeder = Math.floor(datoDiff(fom, tom, "months"));

  const resterendeFOM = moment(fom).add(forskjellManeder, "months");

  const forskjellDager = datoDiff(resterendeFOM, tom, "days");

  const manedBenevnelse = forskjellManeder === 1 ? "måned" : "måneder";
  const dagBenevnelse = forskjellDager === 1 ? "dag" : "dager";

  return forskjellDager > 0
    ? `${forskjellManeder} ${manedBenevnelse} og ${forskjellDager} ${dagBenevnelse}`
    : `${forskjellManeder} ${manedBenevnelse}`;
}

function beregnAlder(foedselsdato) {
  return moment().diff(foedselsdato, "years");
}

function erLike(datoEn, datoTo) {
  return moment(datoEn).isSame(datoTo);
}

function erLikeDatoer(datoEn, datoTo) {
  if (datoEn === datoTo) return true;
  return erLike(formatterDatoTilISO(datoEn, datoEn), formatterDatoTilISO(datoTo, datoTo));
}

function plussEnDag(dato) {
  return moment(dato, "DD.MM.YYYY").add(1, "days").format("DD.MM.YYYY");
}

// Oversetter en string på norsk datoformat til et date-objekt
function norskStringTilDate(datostring) {
  const vasketDato = vaskInputDato(datostring);
  if (!vasketDato) return undefined;
  const date = vasketDato.split(".");
  const now = new Date();
  return new Date(date[2] || now.getFullYear(), date[1] ? date[1] - 1 : now.getMonth(), date[0] || now.getDate());
}

// Oversetter en string på iso datoformat (YYYY-MM-DD) til et date-objekt
function isoStringTilDate(datoString) {
  return norskStringTilDate(formatterDatoTilNorsk(datoString));
}

// Oversetter et date-objekt til en string på norsk datoformat
function dateTilNorskString(dato) {
  if (!dato || !(dato instanceof Date)) return undefined;
  const dag = `0${dato.getDate()}`.slice(-2);
  const maned = `0${dato.getMonth() + 1}`.slice(-2);
  return `${dag}.${maned}.${dato.getFullYear()}`;
}

// Oversetter et date-objekt til en string på iso datoformat
function dateTilIsoString(dato) {
  if (!dato || !(dato instanceof Date)) return undefined;
  const dag = `0${dato.getDate()}`.slice(-2);
  const maned = `0${dato.getMonth() + 1}`.slice(-2);
  return `${dato.getFullYear()}-${maned}-${dag}`;
}

function perioderOverlapper(periode1Fom, periode1Tom, periode2Fom, periode2Tom) {
  if (!erGyldigPeriode(periode1Fom, periode1Tom)) return false;
  if (!erGyldigPeriode(periode2Fom, periode2Tom)) return false;

  const periode1FomDate = norskStringTilDate(periode1Fom);
  const periode1TomDate = norskStringTilDate(periode1Tom);
  const periode2FomDate = norskStringTilDate(periode2Fom);
  const periode2TomDate = norskStringTilDate(periode2Tom);

  if (!periode1FomDate || !periode1TomDate || !periode2FomDate || !periode2TomDate) return false;

  return periode1FomDate <= periode2TomDate && periode1TomDate >= periode2FomDate;
}

function erFør(dato1, dato2) {
  const inputFormat = ["YYYY-MM-DD"];
  return moment(dato1, inputFormat).isBefore(moment(dato2, inputFormat));
}

function erEtter(dato1, dato2) {
  const inputFormat = ["YYYY-MM-DD"];
  return moment(dato1, inputFormat).isAfter(moment(dato2, inputFormat));
}

function sorterEtterNorskFomDato(periode1, periode2) {
  return (
    (norskStringTilDate(periode1.fomDato)?.getTime() ?? 0) - (norskStringTilDate(periode2.fomDato)?.getTime() ?? 0)
  );
}

function sorterEtterISOFomDato(periode1, periode2) {
  const fom1 = periode1.fomDato ?? periode1.fom;
  const fom2 = periode2.fomDato ?? periode2.fom;
  const tom1 = periode1.tomDato ?? periode1.tom;
  const tom2 = periode2.tomDato ?? periode2.tom;

  const fomDiff = (new Date(fom1)?.getTime() ?? 0) - (new Date(fom2)?.getTime() ?? 0);
  if (fomDiff !== 0) return fomDiff;

  const tom1Time = tom1 ? new Date(tom1).getTime() : null;
  const tom2Time = tom2 ? new Date(tom2).getTime() : null;
  if (tom1Time === null && tom2Time === null) return 0;
  if (tom1Time === null) return 1; // Perioder uten tom-dato sorteres etter perioder med tom-dato
  if (tom2Time === null) return -1;
  return tom1Time - tom2Time;
}

function justerDatoHvisTidligereÅr(dato) {
  if (!dato) return dato;

  return moment(dato).year() < moment().year() ? `${moment().year()}-01-01` : dato;
}

export {
  beregnAlder,
  dateTilIsoString,
  dateTilNorskString,
  datoDiff,
  datoDiffMenneskelig,
  datoDiffNorskFormat,
  datoDiffPure,
  erEtter,
  erFør,
  erGyldigPeriode,
  erIPeriode,
  erLike,
  erLikeDatoer,
  formatterDatoTilISO,
  formatterDatoTilNorsk,
  formatterKortDatoTilNorsk,
  isoStringTilDate,
  MAX_AR_FREM_I_TID,
  FLYT_PRODUKSJON_DATO_EØS_11_3_B,
  normaliserInputDato,
  norskStringTilDate,
  perioderOverlapper,
  plussEnDag,
  sorterEtterISOFomDato,
  sorterEtterNorskFomDato,
  vaskInputDato,
  vaskOgFormatterDatoTilNorsk,
  vaskOgFormatterTilISO,
  vaskOgFormaterDatoerTilIso,
  justerDatoHvisTidligereÅr,
};
