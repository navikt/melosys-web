import { FieldValue } from "react-hook-form";
import {
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";
import { AarsavregningResponse } from "../../../../services/modules/aarsavregning/aarsavregning";
import type { BasePeriode } from "../../../../services/modules/types/periodeTyper";
import { InntektskildeDto, SkatteforholdDto } from "../../../../services/modules/trygdeavgift";
import MKV from "../../../../melosyskodeverk";
import aarsavregningUtenEllerDeltGrunnlagSchema from "./aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlagSchema";
import { ValidationError } from "yup";

const { IKKE_SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;

interface ApiError {
  body?: {
    feilkoder?: string[];
    message?: string;
  };
  message?: string;
}

export const mapFeilmelding = (error: unknown): string | string[] => {
  const feilmelding = "Finner ikke trygdeavgiftssats. Melosys har ikke satser for årene før 2014.";

  // Handle string errors directly
  if (typeof error === "string") {
    return error;
  }

  const apiError = error as ApiError;
  const ingenGjeldendeSats = apiError.body?.feilkoder?.some((feilkode: string) =>
    feilkode.startsWith("Ingen gjeldende sats finnes for perioden"),
  );

  if (ingenGjeldendeSats) return feilmelding;

  return apiError.body?.feilkoder || apiError.body?.message || apiError.message || "Ukjent feil";
};

export const erBrukerSkattepliktigIHelePerioden = (skatteforholdsperioder: Skatteforhold[]) => {
  return !skatteforholdsperioder.some((skatteforhold) => skatteforhold.skatteplikttype === IKKE_SKATTEPLIKTIG);
};

/**
 * Finner sammensatt medlemskapsperiode fra en liste av perioder.
 * Returnerer fomDato fra den tidligste perioden og tomDato fra den seneste.
 * Filtrerer bort perioder som mangler fomDato eller tomDato.
 */
export const finnMedlemskapsperiode = (perioder: BasePeriode[]): BasePeriode | undefined => {
  const sorterteGyldigePerioder = perioder
    .filter((periode) => periode.fomDato && periode.tomDato)
    .sort((a, b) => Utils.dato.sorterEtterNorskFomDato(a, b));

  if (sorterteGyldigePerioder.length === 0) {
    return undefined;
  }

  return {
    fomDato: sorterteGyldigePerioder[0].fomDato,
    tomDato: sorterteGyldigePerioder[sorterteGyldigePerioder.length - 1].tomDato,
  };
};

export function beregnTrygdeavgiftsperioder(
  formVerdier: FieldValue<FormValuesProps>,
  options: {
    behandlingID: number;
    medlemskapstypeErPliktig?: boolean;
    erEøsPensjonist?: boolean;
    setFeilmelding: (error: string | string[] | undefined) => void;
    setAarsavregningResponse: (response: AarsavregningResponse) => void;
  },
) {
  const { behandlingID, medlemskapstypeErPliktig, erEøsPensjonist, setFeilmelding, setAarsavregningResponse } = options;

  setFeilmelding(undefined);
  const erBrukerPliktigMedlemOgSkattepliktig =
    medlemskapstypeErPliktig && erBrukerSkattepliktigIHelePerioden(formVerdier.skatteforholdsperioder);

  const trygdeavgiftsgrunnlag = {
    skatteforholdsperioder: formVerdier.skatteforholdsperioder.map((skatteforhold: Skatteforhold) => ({
      fomDato: Utils.dato.formatterDatoTilISO(skatteforhold.fomDato),
      tomDato: Utils.dato.formatterDatoTilISO(skatteforhold.tomDato, null),
      skatteplikttype: skatteforhold.skatteplikttype,
    })),
    inntektskilder: !erBrukerPliktigMedlemOgSkattepliktig
      ? formVerdier.inntektskilder.map((inntektskilde: Inntektskilde) => ({
          type: inntektskilde.kildetype,
          arbeidsgiversavgiftBetales: Utils.streng.uppercaseStrengTilBool(inntektskilde.arbAvgBetales) || false,
          avgiftspliktigInntekt: inntektskilde.bruttoInntekt,
          fomDato: Utils.dato.formatterDatoTilISO(inntektskilde.fomDato),
          tomDato: Utils.dato.formatterDatoTilISO(inntektskilde.tomDato, null),
          erMaanedsbelop: Utils.streng.uppercaseStrengTilBool(inntektskilde.erMaanedsbelop) || false,
        }))
      : [],
  };

  const beregnTrygdeavgiftsperioder = erEøsPensjonist
    ? Api.Trygdeavgift.eøsPensjonistBeregnTrygdeavgiftsperioder
    : Api.Trygdeavgift.beregnTrygdeavgiftsperioder;

  return beregnTrygdeavgiftsperioder(behandlingID, trygdeavgiftsgrunnlag)
    .then(() => {
      setFeilmelding(undefined);
      return Api.Aarsavregning.hentAarsavregning(behandlingID).then((response: AarsavregningResponse) => {
        setAarsavregningResponse(response);
      });
    })
    .catch((error) => setFeilmelding(mapFeilmelding(error)));
}

// Functions moved from aarsavregningHelpers.ts

export const hentMedlemskapsFomTomDato = (medlemskapsperioder?: BasePeriode[]) => {
  if (medlemskapsperioder && !Utils._isEmpty(medlemskapsperioder)) {
    const sorted = [...medlemskapsperioder].sort(Utils.dato.sorterEtterNorskFomDato);
    const fomISO = Utils.dato.formatterDatoTilISO(sorted[0].fomDato);
    const tomISO = Utils.dato.formatterDatoTilISO(sorted[sorted.length - 1].tomDato);
    return { fom: fomISO, tom: tomISO };
  }
  return {};
};

export const mapTilSkatteforholdProps = (
  skatteforholdsperioder?: SkatteforholdDto[],
  medlemskapsperioder?: BasePeriode[],
): Skatteforhold[] => {
  if (skatteforholdsperioder && !Utils._isEmpty(skatteforholdsperioder)) {
    return skatteforholdsperioder.map((skatteForhold) => ({
      fomDato: Utils.dato.formatterDatoTilNorsk(skatteForhold.fomDato),
      tomDato: Utils.dato.formatterDatoTilNorsk(skatteForhold.tomDato),
      skatteplikttype: skatteForhold.skatteplikttype,
    }));
  }
  const { fom, tom } = hentMedlemskapsFomTomDato(medlemskapsperioder);
  if (fom && tom) {
    return [
      {
        fomDato: Utils.dato.formatterDatoTilNorsk(fom),
        tomDato: Utils.dato.formatterDatoTilNorsk(tom),
        skatteplikttype: undefined,
      },
    ];
  }
  return [{}] as Skatteforhold[];
};

export const mapTilInntektskilderProps = (
  inntektskilder?: InntektskildeDto[],
  medlemskapsperioder?: BasePeriode[],
): Inntektskilde[] => {
  if (inntektskilder && !Utils._isEmpty(inntektskilder)) {
    return inntektskilder.map((inntektskilde) => ({
      fomDato: Utils.dato.formatterDatoTilNorsk(inntektskilde.fomDato),
      tomDato: Utils.dato.formatterDatoTilNorsk(inntektskilde.tomDato),
      kildetype: inntektskilde.type, // Backend sends "type" instead of "kildetype"
      arbAvgBetales: Utils.streng.boolTilUppercaseStreng(inntektskilde.arbeidsgiversavgiftBetales),
      bruttoInntekt: inntektskilde.avgiftspliktigInntekt,
      erMaanedsbelop: Utils.streng.boolTilUppercaseStreng(inntektskilde.erMaanedsbelop),
    }));
  }
  const { fom, tom } = hentMedlemskapsFomTomDato(medlemskapsperioder);
  if (fom && tom) {
    return [
      {
        fomDato: Utils.dato.formatterDatoTilNorsk(fom),
        tomDato: Utils.dato.formatterDatoTilNorsk(tom),
        arbAvgBetales: Utils.streng.boolTilUppercaseStreng(false),
        bruttoInntekt: undefined,
        kildetype: "",
        erMaanedsbelop: Utils.streng.boolTilUppercaseStreng(true),
      },
    ];
  }
  return [{ erMaanedsbelop: Utils.streng.boolTilUppercaseStreng(true) }] as Inntektskilde[];
};

export const beregnSumTilFakturaEllerRefusjon = (
  nyTrygdeavgift?: number,
  tidligereTrygdeavgift?: number,
  tidligereTrygdeavgiftAvgiftssystem?: number,
  tidligereAarsavregningTrygdeavgiftFraAvgiftssystem?: number,
): number => {
  return (
    (nyTrygdeavgift ?? 0) -
    (tidligereTrygdeavgift ?? 0) -
    (tidligereTrygdeavgiftAvgiftssystem ?? 0) +
    (tidligereAarsavregningTrygdeavgiftFraAvgiftssystem ?? 0)
  );
};

/**
 * Sjekker om datoer fra medlemskapsperiode er gyldige og kan brukes til å auto-fylle skatteforhold/inntektskilder.
 * Validerer at:
 * 1. Datoene kan formateres til ISO (er gyldige datoer)
 * 2. Datoene er innenfor valgt år for årsavregningen
 *
 * @param fomDato - Fra og med dato i norsk format (dd.mm.yyyy)
 * @param tomDato - Til og med dato i norsk format (dd.mm.yyyy)
 * @param valgtAar - Året som årsavregningen gjelder for
 * @returns true hvis datoene er gyldige og kan brukes, false ellers
 */
export const erGyldigeMedlemskapsperiodeDatoerForAutoUtfylling = (
  fomDato: string,
  tomDato: string,
  valgtAar?: number,
): boolean => {
  if (!fomDato || !tomDato) {
    return false;
  }

  const fomDatoISO = Utils.dato.vaskOgFormatterTilISO(fomDato);
  const tomDatoISO = Utils.dato.vaskOgFormatterTilISO(tomDato);

  if (!fomDatoISO || !tomDatoISO) {
    return false;
  }

  if (valgtAar) {
    const fomDate = new Date(fomDatoISO);
    const tomDate = new Date(tomDatoISO);
    const startAar = new Date(valgtAar, 0, 1);
    const sluttAar = new Date(valgtAar, 11, 31, 23, 59, 59, 999);

    if (fomDate < startAar || fomDate > sluttAar || tomDate < startAar || tomDate > sluttAar) {
      return false;
    }
  }

  return true;
};

/**
 * Modifisert manuell valideringsfunksjon for å unngå å trigge react-hook-form feil for tidlig
 */
export const validateAarsavregningUtenEllerDeltGrunnlag = async (
  values: unknown,
  context: { aar?: number; harTrygdeavgiftFraAvgiftssystemet?: boolean },
  path: string | null = null,
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    const schema = aarsavregningUtenEllerDeltGrunnlagSchema;

    // Valider hele skjemaet
    await schema.validate(values, { abortEarly: false, context });

    // Hvis validering lykkes (ingen exception), returner gyldig
    return { isValid: true, errors: {} };
  } catch (err) {
    const validationErrors: Record<string, string> = {};
    if (err instanceof ValidationError) {
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach((error) => {
          if (path) {
            // Inkluder kun feil for den spesifiserte stien
            if (error.path && error.path.startsWith(path)) {
              validationErrors[error.path] = error.message;
            }
          } else {
            // Inkluder alle feil hvis ingen sti er spesifisert
            if (error.path) {
              validationErrors[error.path] = error.message;
            }
          }
        });
      } else {
        // Håndter enkeltfeil (f.eks. for array-nivå validering)
        if (path && err.path && err.path.startsWith(path)) {
          validationErrors[err.path] = err.message;
        } else if (!path && err.path) {
          validationErrors[err.path] = err.message;
        } else if (!path) {
          validationErrors["form"] = err.message;
        }
      }
    }
    // Returner basert på om vi fant relevante feil
    const hasErrors = Object.keys(validationErrors).length > 0;
    return { isValid: !hasErrors, errors: validationErrors };
  }
};
