import * as Utils from "../../../../../utils";
import { erBrukerSkattepliktigIHelePerioden } from "../utils";
import { Inntektskilde, Skatteforhold } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Nav from "../../../../../navFrontend";
import { Avgiftspliktigperiode } from "../../../../../services/modules/types/periodeTyper";

export enum TypeFeilmelding {
  SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN = "SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN",
  INNTEKTSKILDER_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN = "INNTEKTSKILDER_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN",
  OVERLAPPENDE_SKATTEFORHOLDSPERIODER = "OVERLAPPENDE_SKATTEFORHOLDSPERIODER",
  OVERLAPPENDE_MEDLEMSKAPSPERIODER = "OVERLAPPENDE_MEDLEMSKAPSPERIODER",
  LIKE_SKATTEPLIKTTYPER = "LIKE_SKATTEPLIKTTYPER",
  HAR_OPPHOLDSPERIODER_MEDLEMSKAPSPERIODER = "HAR_OPPHOLDSPERIODER_MEDLEMSKAPSPERIODER",
}

const harOppholdsperioder = (perioder: any[]) => {
  if (!perioder || perioder.length <= 1) {
    return false;
  }

  const sortedPerioder = perioder.sort(Utils.dato.sorterEtterISOFomDato);
  /* eslint-disable-next-line no-console */
  console.log("[harOppholdsperioder] sortedPerioder", sortedPerioder);

  for (let i = 0; i < sortedPerioder.length - 1; i++) {
    const currentTom = sortedPerioder[i].tomDato;
    const nextFom = sortedPerioder[i + 1].fomDato;

    const currentTomDate = Utils.dato.isoStringTilDate(currentTom);
    const nextFomDate = Utils.dato.isoStringTilDate(nextFom);

    if (currentTomDate && nextFomDate) {
      // Legg til 1 dag til sluttdatoen
      const tomDateForComparison = new Date(currentTomDate);
      tomDateForComparison.setDate(tomDateForComparison.getDate() + 1);

      // Sjekk om neste periode starter mer enn 1 dag etter denne perioden slutter
      if (tomDateForComparison.getTime() < nextFomDate.getTime()) return true;
    }
  }

  return false;
};

const dekkerHeleMedlemskapsperiode = (
  perioder: any[],
  medlemskapsperiodeFomTom: {
    fomDato: string;
    tomDato: string;
  },
  type: "skatteforhold" | "inntektskilde",
): boolean => {
  if (!perioder || perioder.length === 0) return true;

  try {
    const medlemskapsperiodeFom = medlemskapsperiodeFomTom.fomDato;
    const medlemskapsperiodeTom = medlemskapsperiodeFomTom.tomDato;

    const minFomDato = perioder.reduce(
      (min, periode) => {
        if (periode.fomDato != null && (min === null || periode.fomDato < min)) {
          return periode.fomDato;
        }
        return min;
      },
      null as string | null,
    );

    const maxTomDato = perioder.reduce(
      (max, periode) => {
        if (periode.tomDato != null && (max === null || periode.tomDato > max)) {
          return periode.tomDato;
        }
        return max;
      },
      null as string | null,
    );

    if (!minFomDato || minFomDato !== medlemskapsperiodeFom || !maxTomDato || maxTomDato !== medlemskapsperiodeTom) {
      /* eslint-disable-next-line no-console */
      console.log(
        `[dekkerHeleMedlemskapsperiode, ${type}] Datoer dekker ikke. MinFom: ${minFomDato} (Skal være: ${medlemskapsperiodeFom}), MaxTom: ${maxTomDato} (Skal være: ${medlemskapsperiodeTom})`,
      );
      return false;
    }

    return !harOppholdsperioder(perioder);
  } catch (error) {
    return true;
  }
};

const ingenOverlappendePerioder = (perioder: any[]): boolean => {
  if (!perioder || perioder.length <= 1) return true;

  try {
    const sortedPerioder = perioder.sort(Utils.dato.sorterEtterISOFomDato);
    /* eslint-disable-next-line no-console */
    console.log("[ingenOverlappendePerioder] sortedPerioder", sortedPerioder);

    // Check for overlapping periods
    for (let i = 0; i < sortedPerioder.length - 1; i++) {
      const currentTom = sortedPerioder[i].tomDato;
      const nextFom = sortedPerioder[i + 1].fomDato;

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
  medlemskapsperiodeFomTom: {
    fomDato: string;
    tomDato: string;
  };
  medlemskapsperioder: Avgiftspliktigperiode[];
  medlemskapstypeErPliktig: boolean;
}

export function finnAktivFeilmeldingForMedlemskapsperioder(medlemskapsperioder: Avgiftspliktigperiode[]) {
  const vaskedeMedlemskapsperioder = Utils.dato.vaskOgFormaterDatoerTilIso(medlemskapsperioder);

  if (!ingenOverlappendePerioder(vaskedeMedlemskapsperioder)) {
    return TypeFeilmelding.OVERLAPPENDE_MEDLEMSKAPSPERIODER;
  }
  if (harOppholdsperioder(vaskedeMedlemskapsperioder)) {
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
  medlemskapsperiodeFomTom,
  medlemskapstypeErPliktig,
  medlemskapsperioder,
}: AarsavregningValidationParams): string | undefined {
  const medlemskapsperioderFeilmelding = finnAktivFeilmeldingForMedlemskapsperioder(medlemskapsperioder);
  if (medlemskapsperioderFeilmelding) {
    return medlemskapsperioderFeilmelding;
  }

  const vaskedeMedlemskapsperioder = Utils.dato.vaskOgFormaterDatoerTilIso(medlemskapsperioder);
  const vaskedeSkatteforholdsperioder = Utils.dato.vaskOgFormaterDatoerTilIso(skatteforholdsperioder);
  const vaskedeInntektskilder = Utils.dato.vaskOgFormaterDatoerTilIso(inntektskilder);

  const medlemskapsperiodeFomTomIsoFormat = {
    fomDato: Utils.dato.vaskOgFormatterTilISO(medlemskapsperiodeFomTom.fomDato)!,
    tomDato: Utils.dato.vaskOgFormatterTilISO(medlemskapsperiodeFomTom.tomDato)!,
  };

  if (
    !dekkerHeleMedlemskapsperiode(vaskedeSkatteforholdsperioder, medlemskapsperiodeFomTomIsoFormat, "skatteforhold")
  ) {
    /* eslint-disable-next-line no-console */
    console.log(
      "[finnAktivFeilmelding] dekkerHeleMedlemskapsperiode",
      vaskedeSkatteforholdsperioder,
      vaskedeMedlemskapsperioder,
    );
    return TypeFeilmelding.SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN;
  }

  if (!ingenOverlappendePerioder(vaskedeSkatteforholdsperioder)) {
    /* eslint-disable-next-line no-console */
    console.log("[finnAktivFeilmelding] ingenOverlappendePerioder", vaskedeSkatteforholdsperioder);
    return TypeFeilmelding.OVERLAPPENDE_SKATTEFORHOLDSPERIODER;
  }

  if (!ikkeAlleSammeSkatteforholdstyper(vaskedeSkatteforholdsperioder)) {
    /* eslint-disable-next-line no-console */
    console.log("[finnAktivFeilmelding] ikkeAlleSammeSkatteforholdstyper", vaskedeSkatteforholdsperioder);
    return TypeFeilmelding.LIKE_SKATTEPLIKTTYPER;
  }

  if (
    vaskedeInntektskilder &&
    vaskedeInntektskilder.length > 0 &&
    (!medlemskapstypeErPliktig || !erBrukerSkattepliktigIHelePerioden(vaskedeSkatteforholdsperioder))
  ) {
    if (!dekkerHeleMedlemskapsperiode(vaskedeInntektskilder, medlemskapsperiodeFomTomIsoFormat, "inntektskilde")) {
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
