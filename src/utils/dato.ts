import moment from "moment";
import momentTZ from "moment-timezone";

type Inclusivity = "()" | "[]" | "[)" | "(]";

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
 * 14:19 er derfor kl 15:19 i norsk tid.
 */
const FLYT_PRODUKSJON_DATO_EØS_11_3_B = moment("2026-03-10T14:19:00Z");

/** Gjør et beste forsøk på å vaske inputdato. Dersom vask ikke er mulig (feks ved helt feil datoformat eller
 * ugyldig dato, returner false.
 * @param dato
 * @returns {String | Boolean } Datoen
 */
const vaskInputDato = (dato: string | null | undefined): string | false => {
  if (dato === null || dato === undefined) return false;

  // Godta type number, men gjør den om til string først.
  const stringDato = Number.isInteger(dato) ? String(dato) : dato;

  // Fjern alle skille-tegn med mål om en ren tallrekke i datoen.
  const newDate = dato.replace(/[-./]/g, "");

  // Hvis datoen er noe annet enn 6 eller 8 tegn, returner ''.
  // Formatene vi støtter er 2 siffer for dag og måned, og 2 eller 4 siffer for år.
  if (!(newDate.length === 6 || newDate.length === 8)) {
    return false;
  }

  // const dateArray = newDate.match(/(..?)/g);
  const dateArray: [string, number, number] = [
    newDate.substr(0, 2),
    parseInt(newDate.substr(2, 2), 10),
    parseInt(newDate.substr(4), 10),
  ];

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
const normaliserInputDato = (verdi: string, forrigeVerdi: string): string => {
  const vasketDato = vaskInputDato(verdi) || verdi;
  return verdi === forrigeVerdi ? vasketDato : verdi;
};

/** Gjør en vurdering av innkomne datoformat og formatter til korrekt DD.MM.YYY, med eller uten tidspunkt.
 * Moment kunne ha vært benyttet direkte i hver komponent, men denne funksjonen tillater begge datoformater i tillegg
 * til å enklere åpne opp for dato med eller uten tidspunkt.
 *
 */
function formatterDatoTilNorsk(dato: moment.MomentInput, visTidspunkt = false, defaultValue = ""): string {
  const inputFormat = ["YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss", "DD-MM-YYYY", "DD-MM-YYYY HH:mm"];
  const momentFormat = visTidspunkt ? "DD.MM.YYYY HH:mm" : "DD.MM.YYYY";
  const momentDato = moment.utc(dato, inputFormat);
  return momentDato.isValid() ? momentTZ(momentDato).tz("Europe/Oslo").format(momentFormat) : defaultValue;
}

function vaskOgFormatterDatoTilNorsk(dato: string | null | undefined, defaultValue = ""): string {
  if (dato?.length === 6 || dato?.length === 8) {
    const vasketDato = vaskInputDato(dato);
    if (!vasketDato) return defaultValue;
    return formatterDatoTilNorsk(vasketDato, false, defaultValue);
  }
  return formatterDatoTilNorsk(dato, false, defaultValue);
}

/**
 * Vasker og formaterer dato-array til ISO format. Må være en array av objekter med fomDato og tomDato.
 *
 * @param {Array} perioder - Array av objekter med fomDato og tomDato.
 * @param {string} [defaultValue] - Standardverdi hvis dato er ugyldig.
 * @returns {Array}
 */
const vaskOgFormaterDatoerTilIso = <T extends { fomDato?: string | null; tomDato?: string | null }>(
  perioder: T[],
  defaultValue: string | undefined = undefined,
): T[] => {
  if (!Array.isArray(perioder)) {
    return [];
  }
  return perioder.map(
    (periode) =>
      ({
        ...periode,
        fomDato: periode.fomDato ? vaskOgFormatterTilISO(periode.fomDato, defaultValue) : defaultValue,
        tomDato: periode.tomDato ? vaskOgFormatterTilISO(periode.tomDato, defaultValue) : defaultValue,
      }) as T,
  );
};

/** Forutsatt at datoen er validert korrekt norsk (DD.MM.YYYY HH:mm), formatter den til det maskinlesbare
 * formatet "YYYY-MM-DD
 *
 * @param {string|undefined} dato
 * @param {string|null} [defaultValue]
 * @returns {string|null}
 */
function formatterDatoTilISO(dato: moment.MomentInput, defaultValue: string | null = "Invalid date"): string | null {
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
function vaskOgFormatterTilISO(dato: string | null | undefined, defaultValue: string | null = null): string | null {
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
function formatterKortDatoTilNorsk(kortDato: string): string {
  const dato = moment(kortDato, "YYYY-MM");
  return `${dato.format("MMM")} - ${dato.format("YYYY")}`;
}

function erGyldigPeriode(fom: moment.MomentInput, tom: moment.MomentInput): boolean {
  const inputFormats = ["DD.MM.YYYY", "YYYY-MM-DD"];
  return moment(fom, inputFormats).isSameOrBefore(moment(tom, inputFormats));
}

function erIPeriode(
  fom: moment.MomentInput,
  tom: moment.MomentInput,
  dato: moment.MomentInput,
  inclusivity?: Inclusivity,
): boolean {
  return moment(dato).isBetween(fom, tom, undefined, inclusivity);
}

function datoDiff(
  fom: moment.MomentInput,
  tom: moment.MomentInput,
  enhet: moment.unitOfTime.Diff = "months",
  presis = true,
): number | false {
  if (!moment(fom, "YYYY-MM-DD").isValid() || !moment(tom, "YYYY-MM-DD").isValid()) return false;
  const momentTom = moment(tom).add(1, "day");
  return moment(momentTom).diff(fom, enhet, presis);
}

function datoDiffNorskFormat(
  fom: moment.MomentInput,
  tom: moment.MomentInput,
  enhet: moment.unitOfTime.Diff = "months",
  presis = true,
): number | false {
  if (!moment(fom, "DD.MM.YYYY").isValid() || !moment(tom, "DD.MM.YYYY").isValid()) return false;
  const momentFom = moment(fom, "DD.MM.YYYY");
  const momentTom = moment(tom, "DD.MM.YYYY").add(1, "day");
  return moment(momentTom).diff(momentFom, enhet, presis);
}

function datoDiffPure(
  fom: moment.MomentInput,
  tom: moment.MomentInput,
  enhet: moment.unitOfTime.Diff = "months",
  presis = true,
): number | false {
  if (!moment(fom, "YYYY-MM-DD").isValid() || !moment(tom, "YYYY-MM-DD").isValid()) return false;
  return moment(fom).diff(tom, enhet, presis);
}

function datoDiffMenneskelig(fom: moment.MomentInput, tom: moment.MomentInput): string | false {
  if (!moment(fom, "YYYY-MM-DD").isValid() || !moment(tom, "YYYY-MM-DD").isValid()) return false;

  const forskjellManeder = Math.floor(Number(datoDiff(fom, tom, "months")));

  const resterendeFOM = moment(fom).add(forskjellManeder, "months");

  const forskjellDager = Number(datoDiff(resterendeFOM, tom, "days"));

  const manedBenevnelse = forskjellManeder === 1 ? "måned" : "måneder";
  const dagBenevnelse = forskjellDager === 1 ? "dag" : "dager";

  return forskjellDager > 0
    ? `${forskjellManeder} ${manedBenevnelse} og ${forskjellDager} ${dagBenevnelse}`
    : `${forskjellManeder} ${manedBenevnelse}`;
}

function beregnAlder(foedselsdato: moment.MomentInput): number {
  return moment().diff(foedselsdato, "years");
}

function erLike(datoEn: moment.MomentInput, datoTo: moment.MomentInput): boolean {
  return moment(datoEn).isSame(datoTo);
}

function erLikeDatoer(datoEn: string | undefined, datoTo: string | undefined): boolean {
  if (datoEn === datoTo) return true;
  return erLike(formatterDatoTilISO(datoEn, datoEn), formatterDatoTilISO(datoTo, datoTo));
}

function plussEnDag(dato: string): string {
  return moment(dato, "DD.MM.YYYY").add(1, "days").format("DD.MM.YYYY");
}

// Oversetter en string på norsk datoformat til et date-objekt
function norskStringTilDate(datostring: string | null | undefined): Date | undefined {
  const vasketDato = vaskInputDato(datostring);
  if (!vasketDato) return undefined;
  const date = vasketDato.split(".");
  const now = new Date();
  return new Date(
    Number(date[2]) || now.getFullYear(),
    date[1] ? Number(date[1]) - 1 : now.getMonth(),
    Number(date[0]) || now.getDate(),
  );
}

// Oversetter en string på iso datoformat (YYYY-MM-DD) til et date-objekt
function isoStringTilDate(datoString: string | undefined): Date | undefined {
  return norskStringTilDate(formatterDatoTilNorsk(datoString));
}

// Oversetter et date-objekt til en string på norsk datoformat
function dateTilNorskString(dato: Date | string | null | undefined): string | undefined {
  if (!dato || !(dato instanceof Date)) return undefined;
  const dag = `0${dato.getDate()}`.slice(-2);
  const maned = `0${dato.getMonth() + 1}`.slice(-2);
  return `${dag}.${maned}.${dato.getFullYear()}`;
}

// Oversetter et date-objekt til en string på iso datoformat
function dateTilIsoString(dato: Date | string | null | undefined): string | undefined {
  if (!dato || !(dato instanceof Date)) return undefined;
  const dag = `0${dato.getDate()}`.slice(-2);
  const maned = `0${dato.getMonth() + 1}`.slice(-2);
  return `${dato.getFullYear()}-${maned}-${dag}`;
}

function perioderOverlapper(
  periode1Fom: string | undefined,
  periode1Tom: string | undefined,
  periode2Fom: string | undefined,
  periode2Tom: string | undefined,
): boolean {
  if (!erGyldigPeriode(periode1Fom, periode1Tom)) return false;
  if (!erGyldigPeriode(periode2Fom, periode2Tom)) return false;

  const periode1FomDate = norskStringTilDate(periode1Fom);
  const periode1TomDate = norskStringTilDate(periode1Tom);
  const periode2FomDate = norskStringTilDate(periode2Fom);
  const periode2TomDate = norskStringTilDate(periode2Tom);

  if (!periode1FomDate || !periode1TomDate || !periode2FomDate || !periode2TomDate) return false;

  return periode1FomDate <= periode2TomDate && periode1TomDate >= periode2FomDate;
}

function erFør(dato1: moment.MomentInput, dato2: moment.MomentInput): boolean {
  const inputFormat = ["YYYY-MM-DD"];
  return moment(dato1, inputFormat).isBefore(moment(dato2, inputFormat));
}

function erEtter(dato1: moment.MomentInput, dato2: moment.MomentInput): boolean {
  const inputFormat = ["YYYY-MM-DD"];
  return moment(dato1, inputFormat).isAfter(moment(dato2, inputFormat));
}

function sorterEtterNorskFomDato(periode1: { fomDato?: string | null }, periode2: { fomDato?: string | null }): number {
  return (
    (norskStringTilDate(periode1.fomDato)?.getTime() ?? 0) - (norskStringTilDate(periode2.fomDato)?.getTime() ?? 0)
  );
}

type ISOSorterbarPeriode = {
  fomDato?: string | null;
  tomDato?: string | null;
  fom?: string | null;
  tom?: string | null;
};

function sorterEtterISOFomDato(periode1: ISOSorterbarPeriode, periode2: ISOSorterbarPeriode): number {
  const fom1 = periode1.fomDato ?? periode1.fom;
  const fom2 = periode2.fomDato ?? periode2.fom;
  const tom1 = periode1.tomDato ?? periode1.tom;
  const tom2 = periode2.tomDato ?? periode2.tom;

  const fomDiff = (new Date(fom1 ?? 0)?.getTime() ?? 0) - (new Date(fom2 ?? 0)?.getTime() ?? 0);
  if (fomDiff !== 0) return fomDiff;

  const tom1Time = tom1 ? new Date(tom1).getTime() : null;
  const tom2Time = tom2 ? new Date(tom2).getTime() : null;
  if (tom1Time === null && tom2Time === null) return 0;
  if (tom1Time === null) return 1; // Perioder uten tom-dato sorteres etter perioder med tom-dato
  if (tom2Time === null) return -1;
  return tom1Time - tom2Time;
}

function justerDatoHvisTidligereÅr(dato: string | null | undefined): string | null | undefined {
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
