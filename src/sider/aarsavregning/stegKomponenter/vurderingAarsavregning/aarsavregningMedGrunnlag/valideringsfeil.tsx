import * as Utils from "../../../../../utils";
import { erBrukerSkattepliktigIHelePerioden } from "../utils";
import { Inntektskilde, Skatteforhold } from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Nav from "../../../../../navFrontend";
import type { BasePeriode } from "../../../../../services/modules/types/periodeTyper";

export enum TypeFeilmelding {
  SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN = "SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN",
  INNTEKTSKILDER_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN = "INNTEKTSKILDER_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN",
  HAR_OPPHOLDSPERIODER_SKATTEFORHOLD = "HAR_OPPHOLDSPERIODER_SKATTEFORHOLD",
  OVERLAPPENDE_SKATTEFORHOLDSPERIODER = "OVERLAPPENDE_SKATTEFORHOLDSPERIODER",
  LIKE_SKATTEPLIKTTYPER = "LIKE_SKATTEPLIKTTYPER",
}

const dekkerHeleMedlemskapsperiode = (perioder: any[], medlemskapsperiode: any): boolean => {
  if (!perioder || perioder.length === 0) return true;

  const medlemskapsperiodeFom = medlemskapsperiode.fomDato;
  const medlemskapsperiodeTom = medlemskapsperiode.tomDato;

  const minFomDato = perioder
    .map((periode) => {
      const date = Utils.dato.isoStringTilDate(periode.fomDato);
      return date ? date.getTime() : Infinity;
    })
    .reduce((min, current) => Math.min(min, current), Infinity);

  const maxTomDato = perioder
    .map((periode) => {
      const date = Utils.dato.isoStringTilDate(periode.tomDato);
      return date ? date.getTime() : -Infinity;
    })
    .reduce((max, current) => Math.max(max, current), -Infinity);

  /* eslint-disable-next-line no-console */
  console.log("[dekkerHeleMedlemskapsperiode] min max", {
    minFomDato,
    maxTomDato,
    medlemskapsperiodeFom,
    medlemskapsperiodeTom,
  });

  // Dekning
  const medlemskapsperiodeFomDate = Utils.dato.isoStringTilDate(medlemskapsperiodeFom);
  if (!medlemskapsperiodeFomDate || minFomDato === Infinity || minFomDato !== medlemskapsperiodeFomDate.getTime()) {
    return false;
  }

  const medlemskapsperiodeTomDate = Utils.dato.isoStringTilDate(medlemskapsperiodeTom);
  if (!medlemskapsperiodeTomDate || maxTomDato === -Infinity || maxTomDato !== medlemskapsperiodeTomDate.getTime()) {
    return false;
  }

  return true;
};

const harOppholdsperioder = (perioder: any) => {
  if (!perioder || perioder.length <= 1) {
    return false;
  }

  const sortedPerioder = perioder.sort(Utils.dato.sorterEtterISOFomDato);

  for (let i = 0; i < sortedPerioder.length - 1; i++) {
    const currentTom = sortedPerioder[i].tomDato;
    const nextFom = sortedPerioder[i + 1].fomDato;

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

const ingenOverlappendePerioder = (perioder: any[]): boolean => {
  if (!perioder || perioder.length <= 1) return true;

  try {
    const sortedPerioder = perioder.sort(Utils.dato.sorterEtterISOFomDato);

    for (let i = 0; i < sortedPerioder.length - 1; i++) {
      const currentTom = sortedPerioder[i].tomDato;
      const nextFom = sortedPerioder[i + 1].fomDato;

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
  medlemskapsperiodeFomTom: BasePeriode;
  medlemskapstypeErPliktig: boolean;
}

/**
 * Validerer skjemadata for årsavregningen og returnerer første feilmelding hvis validering feiler
 */
export function finnAktivFeilmelding({
  skatteforholdsperioder,
  inntektskilder,
  medlemskapsperiodeFomTom,
  medlemskapstypeErPliktig,
}: AarsavregningValidationParams): string | undefined {
  const vaskedeSkatteforholdsperioder = Utils.dato.vaskOgFormaterDatoerTilIso(skatteforholdsperioder);
  const vaskedeInntektskilder = Utils.dato.vaskOgFormaterDatoerTilIso(inntektskilder);
  const medlemskapsperiodeFomTomIsoFormat = {
    fomDato: Utils.dato.vaskOgFormatterTilISO(medlemskapsperiodeFomTom.fomDato)!,
    tomDato: Utils.dato.vaskOgFormatterTilISO(medlemskapsperiodeFomTom.tomDato)!,
  };

  if (vaskedeSkatteforholdsperioder && vaskedeSkatteforholdsperioder.length > 0) {
    if (!dekkerHeleMedlemskapsperiode(vaskedeSkatteforholdsperioder, medlemskapsperiodeFomTomIsoFormat)) {
      return TypeFeilmelding.SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN;
    }

    if (!ingenOverlappendePerioder(vaskedeSkatteforholdsperioder)) {
      return TypeFeilmelding.OVERLAPPENDE_SKATTEFORHOLDSPERIODER;
    }

    if (harOppholdsperioder(vaskedeSkatteforholdsperioder)) {
      return TypeFeilmelding.HAR_OPPHOLDSPERIODER_SKATTEFORHOLD;
    }

    if (!ikkeAlleSammeSkatteforholdstyper(vaskedeSkatteforholdsperioder)) {
      return TypeFeilmelding.LIKE_SKATTEPLIKTTYPER;
    }
  }

  if (
    vaskedeInntektskilder &&
    vaskedeInntektskilder.length > 0 &&
    (!medlemskapstypeErPliktig || !erBrukerSkattepliktigIHelePerioden(vaskedeSkatteforholdsperioder))
  ) {
    if (!dekkerHeleMedlemskapsperiode(vaskedeInntektskilder, medlemskapsperiodeFomTomIsoFormat)) {
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
    case TypeFeilmelding.HAR_OPPHOLDSPERIODER_SKATTEFORHOLD:
      return (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          Skatteforholdsperiodene har oppholdsperioder
        </Nav.Alert>
      );
    default:
      return <div />;
  }
}
