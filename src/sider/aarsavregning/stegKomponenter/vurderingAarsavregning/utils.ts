import { FieldValue } from "react-hook-form";
import {
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";
import { AarsavregningResponse } from "../../../../services/modules/aarsavregning/aarsavregning";
import { Medlemskapsperiode } from "../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import MKV from "../../../../melosyskodeverk";
import aarsavregningUtenEllerDeltGrunnlagSchema from "./aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlagSchema";

const { IKKE_SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;

export const mapFeilmelding = (error: any) => {
  const feilmelding = "Finner ikke trygdeavgiftssats. Melosys har ikke satser for årene før 2014.";

  const ingenGjeldendeSats = error.body?.feilkoder?.some((feilkode: string) =>
    feilkode.startsWith("Ingen gjeldende sats finnes for perioden"),
  );

  if (ingenGjeldendeSats) return feilmelding;

  return error.body?.feilkoder || error.body?.message || error;
};

export const erBrukerSkattepliktigIHelePerioden = (skatteforholdsperioder: any) => {
  return !skatteforholdsperioder.some((skatteforhold: any) => skatteforhold.skatteplikttype === IKKE_SKATTEPLIKTIG);
};

/**
 * Finner sammensatt medlemskapsperiode fra en liste av perioder.
 * Returnerer fomDato fra den tidligste perioden og tomDato fra den seneste.
 * Filtrerer bort perioder som mangler fomDato eller tomDato.
 */
export const finnMedlemskapsperiode = (
  perioder: Medlemskapsperiode[],
): { fomDato: string; tomDato: string } | undefined => {
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
    setFeilmelding: (error: any) => void;
    setAarsavregningResponse: (response: AarsavregningResponse) => void;
  },
) {
  const { behandlingID, medlemskapstypeErPliktig, setFeilmelding, setAarsavregningResponse } = options;

  setFeilmelding(undefined);
  const erBrukerPliktigMedlemOgSkattepliktig =
    medlemskapstypeErPliktig && erBrukerSkattepliktigIHelePerioden(formVerdier.skatteforholdsperioder);
  return Api.Trygdeavgift.beregnTrygdeavgiftsperioder(behandlingID, {
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
  })
    .then(() => {
      Api.Aarsavregning.hentAarsavregning(behandlingID).then((response: AarsavregningResponse) => {
        setAarsavregningResponse(response);
      });
      setFeilmelding(undefined);
    })
    .catch((error) => setFeilmelding(mapFeilmelding(error)));
}

// Functions moved from aarsavregningHelpers.ts

export const hentMedlemskapsFomTomDato = (medlemskapsperioder?: any[]) => {
  if (medlemskapsperioder && !Utils._isEmpty(medlemskapsperioder)) {
    const sorted = [...medlemskapsperioder].sort(Utils.dato.sorterEtterNorskFomDato);
    /* eslint-disable-next-line no-console */
    console.log("[hentMedlemskapsFomTomDato] sorted with Utils.dato.sorterEtterNorskFomDato", sorted);

    const fomISO = Utils.dato.formatterDatoTilISO(sorted[0].fomDato);
    const tomISO = Utils.dato.formatterDatoTilISO(sorted[sorted.length - 1].tomDato);
    return { fom: fomISO, tom: tomISO };
  }
  return {};
};

export const mapTilSkatteforholdProps = (skatteforholdsperioder?: any[], medlemskapsperioder?: any[]) => {
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
  return [{}];
};

export const mapTilInntektskilderProps = (inntektskilder?: any[], medlemskapsperioder?: any[]) => {
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
        bruttoInntekt: "",
        kildetype: "",
        erMaanedsbelop: Utils.streng.boolTilUppercaseStreng(true),
      },
    ];
  }
  return [{}];
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
 * Modifisert manuell valideringsfunksjon for å unngå å trigge react-hook-form feil for tidlig
 */
export const validateAarsavregningUtenEllerDeltGrunnlag = async (
  values: any,
  context: { aar?: number; harTrygdeavgiftFraAvgiftssystemet?: boolean },
  path: string | null = null,
) => {
  try {
    const schema = aarsavregningUtenEllerDeltGrunnlagSchema;

    // Valider hele skjemaet
    await schema.validate(values, { abortEarly: false, context });

    // Hvis validering lykkes (ingen exception), returner gyldig
    return { isValid: true, errors: {} };
  } catch (err: any) {
    const validationErrors: any = {};

    if (err.inner) {
      err.inner.forEach((error: any) => {
        if (path) {
          // Inkluder kun feil for den spesifiserte stien
          if (error.path && error.path.startsWith(path)) {
            validationErrors[error.path] = error.message;
          }
        } else {
          // Inkluder alle feil hvis ingen sti er spesifisert
          validationErrors[error.path] = error.message;
        }
      });
    } else {
      // Håndter enkeltfeil (f.eks. for array-nivå validering)
      if (path && err.path && err.path.startsWith(path)) {
        validationErrors[err.path] = err.message;
      } else if (!path) {
        validationErrors[err.path || "form"] = err.message;
      }
    }

    // Returner basert på om vi fant relevante feil
    const hasErrors = Object.keys(validationErrors).length > 0;
    return { isValid: !hasErrors, errors: validationErrors };
  }
};
