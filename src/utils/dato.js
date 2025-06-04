import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import updateLocale from "dayjs/plugin/updateLocale";

// Date format constants
export const ISO_DATE_FORMAT = "YYYY-MM-DD";
export const ISO_DATETIME_FORMAT = "YYYY-MM-DDTHH:mm:ss";
export const ISO_DATETIME_TZ_FORMAT = "YYYY-MM-DDTHH:mm:ssZ";
export const NORSK_DATE_FORMAT = "DD.MM.YYYY";
export const NORSK_DATETIME_FORMAT = "DD.MM.YYYY HH:mm";
export const DASH_DATE_FORMAT = "DD-MM-YYYY";
export const DASH_DATETIME_FORMAT = "DD-MM-YYYY HH:mm";
export const YEAR_FORMAT = "YYYY";
export const YEAR_MONTH_FORMAT = "YYYY-MM";

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(updateLocale);

// dayjs use uppercase month abbreviation (Jan, Feb) so can't be used directly
// Map month numbers to Norwegian abbreviations,
export const norskeMaaneder = {
  1: "jan",
  2: "feb",
  3: "mar",
  4: "apr",
  5: "mai",
  6: "jun",
  7: "jul",
  8: "aug",
  9: "sep",
  10: "okt",
  11: "nov",
  12: "des",
};

// Configure Norwegian locale
dayjs.updateLocale("nb", {
  monthsShort: norskeMaaneder,
});

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
const vaskInputDato = (dato) => {
  if (dato === null || dato === undefined) return false;

  // Godta type number, men gjør den om til string først.
  const stringDato = Number.isInteger(dato) ? String(dato) : dato;

  // Check if the input is a string
  if (typeof stringDato !== "string") return false;

  // Reject ISO format dates (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(stringDato)) return false;

  // Reject non-numeric characters except separators
  if (/[^\d\-./]/.test(stringDato)) return false;

  // Fjern alle skille-tegn med mål om en ren tallrekke i datoen.
  const newDate = stringDato.replace(/[-./]/g, "");

  // Hvis datoen er noe annet enn 6 eller 8 tegn, returner ''.
  // Formatene vi støtter er 2 siffer for dag og måned, og 2 eller 4 siffer for år.
  if (!(newDate.length === 6 || newDate.length === 8)) {
    return false;
  }

  // Extract day, month, and year
  const dag = newDate.slice(0, 2);
  const maned = newDate.slice(2, 4);
  let ar = newDate.slice(4);

  // Validate day and month ranges
  if (parseInt(dag, 10) < 1 || parseInt(dag, 10) > 31) return false;
  if (parseInt(maned, 10) < 1 || parseInt(maned, 10) > 12) return false;

  // Hvis kun de to siste årstallene er tastet inn, må vi gjøre en gjetning på hvilket århundre det
  // dreier seg om. Det er ikke sannsynlig at datoen gjelder for mer enn 10 år frem tid, så gjett da
  // på at det dreier se om århundre 19.
  if (ar.length === 2) {
    const dagensAr = new Date().getFullYear();
    const testAr = parseInt(`${dagensAr.toString().slice(0, 2)}${ar}`, 10);
    const gjettAarhundre = (testAr - dagensAr > MAX_AR_FREM_I_TID ? dagensAr - 100 : dagensAr).toString().slice(0, 2);
    ar = `${gjettAarhundre}${ar}`;
  }

  // Format the date string in a way that dayjs can parse reliably
  const dateString = `${dag}-${maned}-${ar}`;
  const parsedDate = dayjs(dateString, DASH_DATE_FORMAT, true); // Strict parsing

  if (!parsedDate.isValid()) {
    return false;
  }

  return parsedDate.format(NORSK_DATE_FORMAT);
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
 * Dayjs kunne ha vært benyttet direkte i hver komponent, men denne funksjonen tillater begge datoformater i tillegg
 * til å enklere åpne opp for dato med eller uten tidspunkt.
 *
 */
function formatterDatoTilNorsk(dato, visTidspunkt = false, defaultValue = "") {
  const outputFormat = visTidspunkt ? NORSK_DATETIME_FORMAT : NORSK_DATE_FORMAT;

  // Handle specific malformed Norwegian date format: "DD.MM.YYYY HH:mm:sZ"
  if (typeof dato === "string" && /^\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}:\d+Z$/.test(dato)) {
    const match = dato.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):\d+Z$/);
    if (match) {
      const [, day, month, year, hour, minute] = match;
      const isoString = `${year}-${month}-${day}T${hour}:${minute}:00Z`;
      const parsedDate = dayjs.utc(isoString);
      if (parsedDate.isValid()) {
        return parsedDate.tz("Europe/Oslo").format(outputFormat);
      }
    }
  }

  // For other dates with time components (ISO format or with Z timezone indicator)
  if (typeof dato === "string" && (dato.includes("T") || dato.includes("Z"))) {
    const parsedDate = dayjs.utc(dato);
    if (parsedDate.isValid()) {
      return parsedDate.tz("Europe/Oslo").format(outputFormat);
    }
  }

  // For dates without time components, use specified input formats
  const inputFormat = [
    ISO_DATE_FORMAT,
    ISO_DATETIME_FORMAT,
    ISO_DATETIME_TZ_FORMAT,
    DASH_DATE_FORMAT,
    DASH_DATETIME_FORMAT,
  ];

  // Parse as UTC first for date-only formats, then convert to Europe/Oslo
  if (typeof dato === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dato)) {
    // For ISO date format without time, parse as UTC then convert to timezone
    const parsedDate = dayjs.utc(dato);
    if (parsedDate.isValid()) {
      return parsedDate.tz("Europe/Oslo").format(outputFormat);
    }
  }

  // For other formats, use local parsing
  const parsedDate = dayjs(dato, inputFormat);
  return parsedDate.isValid() ? parsedDate.format(outputFormat) : defaultValue;
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
  const inputFormat = [NORSK_DATETIME_FORMAT, NORSK_DATE_FORMAT];
  const parsedDate = dayjs(dato, inputFormat);
  return parsedDate.isValid() ? parsedDate.format(ISO_DATE_FORMAT) : defaultValue;
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
  const dato = dayjs(kortDato, YEAR_MONTH_FORMAT);

  // Get month number (1-12)
  const maanedNummer = dato.month() + 1;

  // Use the Norwegian month abbreviation
  return `${norskeMaaneder[maanedNummer]} - ${dato.format(YEAR_FORMAT)}`;
}

function erGyldigPeriode(fom, tom) {
  const inputFormats = [NORSK_DATE_FORMAT, ISO_DATE_FORMAT];
  const fomDate = dayjs(fom, inputFormats);
  const tomDate = dayjs(tom, inputFormats);
  return fomDate.isValid() && tomDate.isValid() && (fomDate.isSame(tomDate) || fomDate.isBefore(tomDate));
}

function erIPeriode(fom, tom, dato, inclusivity) {
  return dayjs(dato).isBetween(fom, tom, undefined, inclusivity);
}

function datoDiff(fom, tom, enhet = "months", presis = true) {
  const fomDate = dayjs(fom, ISO_DATE_FORMAT);
  const tomDate = dayjs(tom, ISO_DATE_FORMAT);

  if (!fomDate.isValid() || !tomDate.isValid()) return false;

  // Add 1 day to tom to match moment's behavior
  const adjustedTomDate = tomDate.add(1, "day");
  return presis ? adjustedTomDate.diff(fomDate, enhet, true) : adjustedTomDate.diff(fomDate, enhet);
}

function datoDiffNorskFormat(fom, tom, enhet = "months", presis = true) {
  const fomDate = dayjs(fom, NORSK_DATE_FORMAT);
  const tomDate = dayjs(tom, NORSK_DATE_FORMAT);

  if (!fomDate.isValid() || !tomDate.isValid()) return false;

  // Add 1 day to tom to match moment's behavior
  const adjustedTomDate = tomDate.add(1, "day");
  return presis ? adjustedTomDate.diff(fomDate, enhet, true) : adjustedTomDate.diff(fomDate, enhet);
}

function datoDiffPure(fom, tom, enhet = "months", presis = true) {
  // For ISO format dates with time components, don't specify a format
  // This allows dayjs to use its default ISO parser
  const fomDate =
    typeof fom === "string" && (fom.includes("T") || fom.includes("Z")) ? dayjs(fom) : dayjs(fom, ISO_DATE_FORMAT);

  const tomDate =
    typeof tom === "string" && (tom.includes("T") || tom.includes("Z")) ? dayjs(tom) : dayjs(tom, ISO_DATE_FORMAT);

  if (!fomDate.isValid() || !tomDate.isValid()) return false;

  return presis ? tomDate.diff(fomDate, enhet, true) : tomDate.diff(fomDate, enhet);
}

function datoDiffMenneskelig(fom, tom) {
  const fomDate = dayjs(fom, ISO_DATE_FORMAT);
  const tomDate = dayjs(tom, ISO_DATE_FORMAT);

  if (!fomDate.isValid() || !tomDate.isValid()) return false;

  const forskjellManeder = Math.floor(datoDiff(fom, tom, "months"));
  const resterendeFOM = fomDate.add(forskjellManeder, "months");
  const forskjellDager = datoDiff(resterendeFOM.format(ISO_DATE_FORMAT), tom, "days");

  const manedBenevnelse = forskjellManeder === 1 ? "måned" : "måneder";
  const dagBenevnelse = forskjellDager === 1 ? "dag" : "dager";

  return forskjellDager > 0
    ? `${forskjellManeder} ${manedBenevnelse} og ${forskjellDager} ${dagBenevnelse}`
    : `${forskjellManeder} ${manedBenevnelse}`;
}

function beregnAlder(foedselsdato) {
  return dayjs().diff(foedselsdato, "years");
}

function erLike(datoEn, datoTo) {
  return dayjs(datoEn).isSame(datoTo);
}

function erLikeDatoer(datoEn, datoTo) {
  if (datoEn === datoTo) return true;

  // Try to wash numeric formats first before converting to ISO
  let normalizedEn = datoEn;
  let normalizedTo = datoTo;

  // If input looks like numeric format (like "23012022"), wash it first
  if (typeof datoEn === "string" && /^\d{6,8}$/.test(datoEn)) {
    const washedEn = vaskInputDato(datoEn);
    if (washedEn) normalizedEn = washedEn;
  }

  if (typeof datoTo === "string" && /^\d{6,8}$/.test(datoTo)) {
    const washedTo = vaskInputDato(datoTo);
    if (washedTo) normalizedTo = washedTo;
  }

  return erLike(formatterDatoTilISO(normalizedEn, normalizedEn), formatterDatoTilISO(normalizedTo, normalizedTo));
}

function plussEnDag(dato) {
  return dayjs(dato, NORSK_DATE_FORMAT).add(1, "days").format(NORSK_DATE_FORMAT);
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
  const inputFormat = [ISO_DATE_FORMAT];
  return dayjs(dato1, inputFormat).isBefore(dayjs(dato2, inputFormat));
}

function erEtter(dato1, dato2) {
  const inputFormat = [ISO_DATE_FORMAT];
  return dayjs(dato1, inputFormat).isAfter(dayjs(dato2, inputFormat));
}

function sorterEtterNorskFomDato(periode1, periode2) {
  // Parse dates using dayjs directly for more reliable comparison
  const date1 = dayjs(periode1.fomDato, [NORSK_DATE_FORMAT]);
  const date2 = dayjs(periode2.fomDato, [NORSK_DATE_FORMAT]);

  // If both dates are valid, compare them
  if (date1.isValid() && date2.isValid()) {
    if (date1.isBefore(date2)) {
      return -1;
    }
    return date1.isAfter(date2) ? 1 : 0;
  }

  // Fall back to the original implementation if parsing fails
  return (
    (norskStringTilDate(periode1.fomDato)?.getTime() ?? 0) - (norskStringTilDate(periode2.fomDato)?.getTime() ?? 0)
  );
}

function sorterEtterISOFomDato(periode1, periode2) {
  return (new Date(periode1.fomDato)?.getTime() ?? 0) - (new Date(periode2.fomDato)?.getTime() ?? 0);
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
};
