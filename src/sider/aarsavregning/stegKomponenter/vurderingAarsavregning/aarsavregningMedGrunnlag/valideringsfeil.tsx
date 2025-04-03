import * as Utils from "../../../../../utils";
import { erBrukerSkattepliktigIHelePerioden } from "../komponenter/utils";
import { Inntektskilde, Skatteforhold } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Nav from "../../../../../navFrontend";

export enum TypeFeilmelding {
  SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN = "SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN",
  INNTEKTSKILDER_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN = "INNTEKTSKILDER_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN",
  OVERLAPPENDE_SKATTEFORHOLDSPERIODER = "OVERLAPPENDE_SKATTEFORHOLDSPERIODER",
  LIKE_SKATTEPLIKTTYPER = "LIKE_SKATTEPLIKTTYPER",
}

// Helper function to sort periods by start date
const sorterPerioderEtterStartdato = (perioder: any[]) => {
  return [...perioder].sort((a, b) => {
    const aFom = Utils.dato.formatterDatoTilISO(a.fomDato)!;
    const bFom = Utils.dato.formatterDatoTilISO(b.fomDato)!;
    return aFom.localeCompare(bFom);
  });
};

const dekkerHeleMedlemskapsperiode = (perioder: any[], medlemskapsperiode: any): boolean => {
  if (!perioder || perioder.length === 0) return true;

  try {
    const medlemskapsperiodeFom = Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato);
    const medlemskapsperiodeTom = Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato);

    // Sort periods by start date
    const sortedPerioder = sorterPerioderEtterStartdato(perioder);

    // Dekning
    const firstFom = Utils.dato.formatterDatoTilISO(sortedPerioder[0].fomDato);
    if (!firstFom || firstFom !== medlemskapsperiodeFom) return false;

    const lastTom = Utils.dato.formatterDatoTilISO(sortedPerioder[sortedPerioder.length - 1].tomDato);
    if (!lastTom || lastTom !== medlemskapsperiodeTom) return false;

    // Opphold
    for (let i = 0; i < sortedPerioder.length - 1; i++) {
      const currentTom = Utils.dato.formatterDatoTilISO(sortedPerioder[i].tomDato);
      const nextFom = Utils.dato.formatterDatoTilISO(sortedPerioder[i + 1].fomDato);

      // Convert to Date objects
      const currentTomDate = Utils.dato.isoStringTilDate(currentTom);
      const nextFomDate = Utils.dato.isoStringTilDate(nextFom);

      if (currentTomDate && nextFomDate) {
        // Add 1 day to the end date
        const tomDateForComparison = new Date(currentTomDate);
        tomDateForComparison.setDate(tomDateForComparison.getDate() + 1);

        // Check if the next period starts more than one day after this period ends
        if (tomDateForComparison.getTime() < nextFomDate.getTime()) return false;
      }
    }

    return true;
  } catch (error) {
    return true;
  }
};

const ingenOverlappendeSkatteforholdsperioder = (perioder: any[]): boolean => {
  if (!perioder || perioder.length <= 1) return true;

  try {
    // Sort periods by start date
    const sortedPerioder = sorterPerioderEtterStartdato(perioder);

    // Check for overlapping periods
    for (let i = 0; i < sortedPerioder.length - 1; i++) {
      const currentTom = Utils.dato.formatterDatoTilISO(sortedPerioder[i].tomDato);
      const nextFom = Utils.dato.formatterDatoTilISO(sortedPerioder[i + 1].fomDato);

      // Convert to Date objects
      const currentTomDate = Utils.dato.isoStringTilDate(currentTom);
      const nextFomDate = Utils.dato.isoStringTilDate(nextFom);

      if (currentTomDate && nextFomDate) {
        if (currentTomDate.getTime() >= nextFomDate.getTime()) return false;
      }
    }

    return true;
  } catch (error) {
    return true;
  }
};

const ikkeAlleSammeSkatteforholdstyper = (perioder: any[]): boolean => {
  if (!perioder || perioder.length <= 1) return true;

  try {
    const skatteplikttyper = perioder.map((periode) => periode.skatteplikttype);
    const perioderHarSammeType = skatteplikttyper.every((type) => type === skatteplikttyper[0]);

    return !perioderHarSammeType;
  } catch (error) {
    return true;
  }
};

interface AarsavregningValidationParams {
  skatteforholdsperioder: Skatteforhold[];
  inntektskilder: Inntektskilde[];
  medlemskapsperiode: any;
  medlemskapstypeErPliktig: boolean;
}

/**
 * Validerer skjemadata for årsavregningen og returnerer første feilmelding hvis validering feiler
 */
export function finnAktivFeilmelding({
  skatteforholdsperioder,
  inntektskilder,
  medlemskapsperiode,
  medlemskapstypeErPliktig,
}: AarsavregningValidationParams): string | undefined {
  if (skatteforholdsperioder && skatteforholdsperioder.length > 0) {
    if (!dekkerHeleMedlemskapsperiode(skatteforholdsperioder, medlemskapsperiode)) {
      return TypeFeilmelding.SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN;
    }

    if (!ingenOverlappendeSkatteforholdsperioder(skatteforholdsperioder)) {
      return TypeFeilmelding.OVERLAPPENDE_SKATTEFORHOLDSPERIODER;
    }

    if (!ikkeAlleSammeSkatteforholdstyper(skatteforholdsperioder)) {
      return TypeFeilmelding.LIKE_SKATTEPLIKTTYPER;
    }
  }

  if (
    inntektskilder &&
    inntektskilder.length > 0 &&
    (!medlemskapstypeErPliktig || !erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder))
  ) {
    if (!dekkerHeleMedlemskapsperiode(inntektskilder, medlemskapsperiode)) {
      return TypeFeilmelding.INNTEKTSKILDER_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN;
    }
  }
  return undefined;
}

export function Feilmelding({ type }: { type?: string }) {
  switch (type) {
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
      return <div />;
  }
}
