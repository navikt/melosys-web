import * as Utils from "../../../../../utils";
import { erBrukerSkattepliktigIHelePerioden } from "../komponenter/utils";
import { Inntektskilde, Skatteforhold } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Nav from "../../../../../navFrontend";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";

export enum TypeFeilmelding {
  SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN = "SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN",
  INNTEKTSKILDER_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN = "INNTEKTSKILDER_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN",
  OVERLAPPENDE_SKATTEFORHOLDSPERIODER = "OVERLAPPENDE_SKATTEFORHOLDSPERIODER",
  OVERLAPPENDE_MEDLEMSKAPSPERIODER = "OVERLAPPENDE_MEDLEMSKAPSPERIODER",
  LIKE_SKATTEPLIKTTYPER = "LIKE_SKATTEPLIKTTYPER",
  HAR_OPPHOLDSPERIODER_MEDLEMSKAPSPERIODER = "HAR_OPPHOLDSPERIODER_MEDLEMSKAPSPERIODER",
}

// Hjelpefunksjon for å sortere perioder etter startdato (ISO-format)
const sorterPerioderEtterStartdato = (perioder: any[]) => {
  return [...perioder].sort((a, b) => {
    const aFom = Utils.dato.formatterDatoTilISO(a.fomDato)!;
    const bFom = Utils.dato.formatterDatoTilISO(b.fomDato)!;
    return aFom.localeCompare(bFom);
  });
};

// Sjekker om det er opphold (gap) mellom periodene i en sortert liste
const harOppholdsperioder = (perioder: any) => {
  if (!perioder || perioder.length <= 1) {
    return false;
  }

  // Bruker sortering basert på norsk datoformat fra Utils, antar den håndterer array-kopiering etc.
  const sortedPerioder = perioder.sort(Utils.dato.sorterEtterNorskFomDato);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < sortedPerioder.length - 1; i++) {
    const currentTom = Utils.dato.formatterDatoTilISO(sortedPerioder[i].tomDato);
    const nextFom = Utils.dato.formatterDatoTilISO(sortedPerioder[i + 1].fomDato);

    // Konverter til Date-objekter for sammenligning
    const currentTomDate = Utils.dato.isoStringTilDate(currentTom);
    const nextFomDate = Utils.dato.isoStringTilDate(nextFom);

    if (currentTomDate && nextFomDate) {
      // Legg til 1 dag på sluttdatoen for å sjekke om neste starter dagen etter
      const tomDateForComparison = new Date(currentTomDate);
      tomDateForComparison.setDate(tomDateForComparison.getDate() + 1);

      // Sjekk om neste periode starter mer enn én dag etter at denne slutter
      if (tomDateForComparison.getTime() < nextFomDate.getTime()) return true;
    }
  }

  return false;
};

// Sjekker om en liste med underperioder (f.eks. skatt/inntekt) dekker hele hovedperioden (medlemskap)
const dekkerHeleMedlemskapsperiode = (perioder: any[], medlemskapsperiode: any): boolean => {
  // Hvis ingen underperioder, antas det at de dekker (eller at valideringen ikke gjelder)
  if (!perioder || perioder.length === 0) return true;

  try {
    const medlemskapsperiodeFom = Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato);
    const medlemskapsperiodeTom = Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato);

    // Sorter underperiodene etter startdato
    const sortedPerioder = sorterPerioderEtterStartdato(perioder);

    // Sjekk startdekning
    const firstFom = Utils.dato.formatterDatoTilISO(sortedPerioder[0].fomDato);
    if (!firstFom || firstFom !== medlemskapsperiodeFom) return false;

    // Sjekk slutdekning
    const lastTom = Utils.dato.formatterDatoTilISO(sortedPerioder[sortedPerioder.length - 1].tomDato);
    if (!lastTom || lastTom !== medlemskapsperiodeTom) return false;

    // Sjekk for interne opphold
    return !harOppholdsperioder(sortedPerioder);
  } catch (error) {
    // Ved feil i datokonvertering e.l., anta at det er gyldig for å unngå falske feil
    console.warn("Feil under validering av periodedekning:", error);
    return true;
  }
};

// Sjekker om det er overlapp mellom perioder i en liste
const ingenOverlappendePerioder = (perioder: any[]): boolean => {
  if (!perioder || perioder.length <= 1) return true;

  try {
    // Sorter etter startdato
    const sortedPerioder = sorterPerioderEtterStartdato(perioder);

    console.log("sortedPerioder (for overlapp sjekk)", sortedPerioder);

    // Sjekk for overlapp
    for (let i = 0; i < sortedPerioder.length - 1; i++) {
      const currentTom = Utils.dato.formatterDatoTilISO(sortedPerioder[i].tomDato);
      const nextFom = Utils.dato.formatterDatoTilISO(sortedPerioder[i + 1].fomDato);

      // Konverter til Date objekter
      const currentTomDate = Utils.dato.isoStringTilDate(currentTom);
      const nextFomDate = Utils.dato.isoStringTilDate(nextFom);

      if (currentTomDate && nextFomDate) {
        // Overlapp hvis sluttdatoen er lik eller etter neste startdato
        if (currentTomDate.getTime() >= nextFomDate.getTime()) return false;
      }
    }

    return true;
  } catch (error) {
    // Ved feil i datokonvertering e.l., anta at det er gyldig
    console.warn("Feil under sjekk av overlappende perioder:", error);
    return true;
  }
};

// Sjekker om alle perioder i en liste har samme skatteplikttype
// Returnerer true hvis de IKKE alle er like (dvs. det er variasjon, som er gyldig)
const ikkeAlleSammeSkatteforholdstyper = (perioder: any[]): boolean => {
  if (!perioder || perioder.length <= 1) return true; // Ikke relevant med 0 eller 1 periode

  try {
    const skatteplikttyper = perioder.map((periode) => periode.skatteplikttype);
    // Sjekker om alle elementer er lik det første elementet
    const perioderHarSammeType = skatteplikttyper.every((type) => type === skatteplikttyper[0]);

    // Returnerer true hvis de IKKE er like (det er variasjon)
    return !perioderHarSammeType;
  } catch (error) {
    // Ved feil, anta gyldig
    console.warn("Feil under sjekk av like skatteplikttyper:", error);
    return true;
  }
};

// Interface for parameterne til hovedvalideringsfunksjonen
interface AarsavregningValidationParams {
  skatteforholdsperioder: Skatteforhold[];
  inntektskilder: Inntektskilde[];
  medlemskapsperiode: { // Hovedperioden som skal dekkes
    fomDato: string;
    tomDato: string;
  };
  medlemskapsperioder: Medlemskapsperiode[]; // Hele listen, for sjekk av gap/overlapp internt
  medlemskapstypeErPliktig: boolean;
}

// Finner aktiv feilmelding kun for medlemskapsperioder (overlapp/gap)
export function finnAktivFeilmeldingForMedlemskapsperioder(medlemskapsperioder: Medlemskapsperiode[]) {
  if (!ingenOverlappendePerioder(medlemskapsperioder)) {
    return TypeFeilmelding.OVERLAPPENDE_MEDLEMSKAPSPERIODER;
  }
  if (harOppholdsperioder(medlemskapsperioder)) {
    return TypeFeilmelding.HAR_OPPHOLDSPERIODER_MEDLEMSKAPSPERIODER;
  }
  return undefined;
}

/**
 * Validerer skjemadata for årsavregningen og returnerer første feilmelding hvis validering feiler.
 * Sjekker dekning og overlapp for skatteforhold og inntektskilder mot medlemskapsperioden.
 */
export function finnAktivFeilmelding({
  skatteforholdsperioder,
  inntektskilder,
  medlemskapsperiode,
  medlemskapstypeErPliktig,
  medlemskapsperioder, // Brukes kun for å sjekke interne gap/overlapp i medlemskap
}: AarsavregningValidationParams): string | undefined {
  // 1. Sjekk interne feil i medlemskapsperiodene selv
  const medlemskapsperioderFeilmelding = finnAktivFeilmeldingForMedlemskapsperioder(medlemskapsperioder);
  if (medlemskapsperioderFeilmelding) {
    return medlemskapsperioderFeilmelding;
  }

  // 2. Sjekk skatteforholdsperioder (hvis de finnes)
  if (skatteforholdsperioder && skatteforholdsperioder.length > 0) {
    // Sjekk om de dekker hele medlemskapsperioden
    if (!dekkerHeleMedlemskapsperiode(skatteforholdsperioder, medlemskapsperiode)) {
      console.log("dekkerHeleMedlemskapsperiode (skatt)", skatteforholdsperioder, medlemskapsperiode);
      return TypeFeilmelding.SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN;
    }
    // Sjekk for internt overlapp i skatteperiodene
    if (!ingenOverlappendePerioder(skatteforholdsperioder)) {
      return TypeFeilmelding.OVERLAPPENDE_SKATTEFORHOLDSPERIODER;
    }
    // Sjekk om alle skatteperiodene har samme type (skal ikke ha det)
    if (!ikkeAlleSammeSkatteforholdstyper(skatteforholdsperioder)) {
      return TypeFeilmelding.LIKE_SKATTEPLIKTTYPER;
    }
  }

  // 3. Sjekk inntektskilder (hvis de finnes OG de er relevante)
  // Relevante kun hvis medlemskap IKKE er pliktig, ELLER hvis bruker IKKE er skattepliktig i hele perioden
  if (
    inntektskilder &&
    inntektskilder.length > 0 &&
    (!medlemskapstypeErPliktig || !erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder))
  ) {
    // Sjekk om inntektskildene dekker hele medlemskapsperioden
    if (!dekkerHeleMedlemskapsperiode(inntektskilder, medlemskapsperiode)) {
      return TypeFeilmelding.INNTEKTSKILDER_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN;
    }
    // Merk: Sjekker ikke for overlapp i inntektskilder, antar det er lov?
  }

  // Ingen feil funnet
  return undefined;
}

// Komponent for å rendre feilmelding basert på type
export function Feilmelding({ type }: { type?: string }) {
  switch (type) {
    case TypeFeilmelding.OVERLAPPENDE_MEDLEMSKAPSPERIODER:
      return (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          Medlemskapsperiodene kan ikke overlappe
        </Nav.Alert>
      );
    case TypeFeilmelding.HAR_OPPHOLDSPERIODER_MEDLEMSKAPSPERIODER:
      return (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          Det er opphold i medlemskapsperiodene.
        </Nav.Alert>
      );
    case TypeFeilmelding.SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN:
      return (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          Skatteforholdsperioden(e) du har lagt inn dekker ikke hele medlemskapsperioden(e)
        </Nav.Alert>
      );
    case TypeFeilmelding.OVERLAPPENDE_SKATTEFORHOLDSPERIODER:
      return (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          Skatteforholdsperiodene kan ikke overlappe
        </Nav.Alert>
      );
    case TypeFeilmelding.LIKE_SKATTEPLIKTTYPER:
      return (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          Alle skatteforholdsperiodene har samme svar på spørsmålet om skatteplikt
        </Nav.Alert>
      );
    case TypeFeilmelding.INNTEKTSKILDER_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN:
      return (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          Inntektsperioden(e) du har lagt inn dekker ikke hele medlemskapsperioden(e)
        </Nav.Alert>
      );
    default:
      return <div />; // Returner ingenting hvis ingen kjent feiltype
  }
}
