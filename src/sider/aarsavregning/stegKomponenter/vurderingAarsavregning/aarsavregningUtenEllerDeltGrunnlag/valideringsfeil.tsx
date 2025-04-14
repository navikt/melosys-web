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

const harOppholdsperioder = (perioder: any) => {
  if (!perioder || perioder.length <= 1) {
    return false;
  }

  const sortedPerioder = perioder.sort(Utils.dato.sorterEtterNorskFomDato);
  console.log("[harOppholdsperioder] sortedPerioder", sortedPerioder);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < sortedPerioder.length - 1; i++) {
    const currentTom = Utils.dato.vaskOgFormatterTilISO(sortedPerioder[i].tomDato);
    const nextFom = Utils.dato.vaskOgFormatterTilISO(sortedPerioder[i + 1].fomDato);

    // Convert to Date objects
    const currentTomDate = Utils.dato.isoStringTilDate(currentTom);
    const nextFomDate = Utils.dato.isoStringTilDate(nextFom);

    if (currentTomDate && nextFomDate) {
      // Add 1 day to the end date
      const tomDateForComparison = new Date(currentTomDate);
      tomDateForComparison.setDate(tomDateForComparison.getDate() + 1);

      // Check if the next period starts more than one day after this period ends
      if (tomDateForComparison.getTime() < nextFomDate.getTime()) return true;
    }
  }

  return false;
};

const dekkerHeleMedlemskapsperiode = (perioder: any[], medlemskapsperiode: any): boolean => {
  if (!perioder || perioder.length === 0) return true;

  try {
    const medlemskapsperiodeFom = Utils.dato.vaskOgFormatterTilISO(medlemskapsperiode.fomDato);
    const medlemskapsperiodeTom = Utils.dato.vaskOgFormatterTilISO(medlemskapsperiode.tomDato);

    // Sort periods by start date
    const sortedPerioder = perioder.sort(Utils.dato.sorterEtterNorskFomDato);
    console.log("[dekkerHeleMedlemskapsperiode] sortedPerioder", sortedPerioder);

    console.log("[dekkerHeleMedlemskapsperiode] medlemskapsperiodeFom", medlemskapsperiodeFom);
    console.log("[dekkerHeleMedlemskapsperiode] medlemskapsperiodeTom", medlemskapsperiodeTom);
    // Dekning
    const firstFom = Utils.dato.vaskOgFormatterTilISO(sortedPerioder[0].fomDato);
    console.log("[dekkerHeleMedlemskapsperiode] firstFom", firstFom);
    if (!firstFom || firstFom !== medlemskapsperiodeFom) return false;

    const lastTom = Utils.dato.vaskOgFormatterTilISO(sortedPerioder[sortedPerioder.length - 1].tomDato);
    console.log("[dekkerHeleMedlemskapsperiode] lastTom", lastTom);
    if (!lastTom || lastTom !== medlemskapsperiodeTom) return false;

    // Opphold
    return !harOppholdsperioder(sortedPerioder);
  } catch (error) {
    return true;
  }
};

const ingenOverlappendePerioder = (perioder: any[]): boolean => {
  if (!perioder || perioder.length <= 1) return true;

  try {
    // Sort periods by start date
    const sortedPerioder = perioder.sort(Utils.dato.sorterEtterNorskFomDato);
    console.log("[ingenOverlappendePerioder] sortedPerioder", sortedPerioder);

    // Check for overlapping periods
    for (let i = 0; i < sortedPerioder.length - 1; i++) {
      const currentTom = Utils.dato.vaskOgFormatterTilISO(sortedPerioder[i].tomDato);
      const nextFom = Utils.dato.vaskOgFormatterTilISO(sortedPerioder[i + 1].fomDato);

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
  medlemskapsperiode: {
    fomDato: string;
    tomDato: string;
  };
  medlemskapsperioder: Medlemskapsperiode[];
  medlemskapstypeErPliktig: boolean;
}

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
 * Validerer skjemadata for årsavregningen og returnerer første feilmelding hvis validering feiler
 */
export function finnAktivFeilmelding({
  skatteforholdsperioder,
  inntektskilder,
  medlemskapsperiode,
  medlemskapstypeErPliktig,
  medlemskapsperioder,
}: AarsavregningValidationParams): string | undefined {
  const medlemskapsperioderFeilmelding = finnAktivFeilmeldingForMedlemskapsperioder(medlemskapsperioder);
  if (medlemskapsperioderFeilmelding) {
    return medlemskapsperioderFeilmelding;
  }

  if (skatteforholdsperioder && skatteforholdsperioder.length > 0) {
    if (!dekkerHeleMedlemskapsperiode(skatteforholdsperioder, medlemskapsperiode)) {
      console.log("[finnAktivFeilmelding] dekkerHeleMedlemskapsperiode", skatteforholdsperioder, medlemskapsperiode);
      return TypeFeilmelding.SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN;
    }

    if (!ingenOverlappendePerioder(skatteforholdsperioder)) {
      console.log("[finnAktivFeilmelding] ingenOverlappendePerioder", skatteforholdsperioder);
      return TypeFeilmelding.OVERLAPPENDE_SKATTEFORHOLDSPERIODER;
    }

    if (!ikkeAlleSammeSkatteforholdstyper(skatteforholdsperioder)) {
      console.log("[finnAktivFeilmelding] ikkeAlleSammeSkatteforholdstyper", skatteforholdsperioder);
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
      return <div />;
  }
}
