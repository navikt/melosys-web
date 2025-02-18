import { FieldValue } from "react-hook-form";
import {
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Api from "../../../../../services/api";
import * as Utils from "../../../../../utils";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { Medlemskapsperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import MKV from "../../../../../melosyskodeverk";
import { sorterEtterISOFomDato } from "../../../../../utils/dato";

const { IKKE_SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;

const mapFeilmelding = (error: any) => {
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

export function harIkkeSkattepliktigInntektskilder(
  skatteforholdsperioder: any,
  inntektsperioder: any,
  medlemskapsTypeErPliktig?: boolean,
) {
  if (skatteforholdsperioder === undefined || inntektsperioder === undefined) return false;
  if (inntektsperioder.length === 0) {
    return false;
  }

  if (medlemskapsTypeErPliktig) {
    return !erBrukerSkattepliktigIHelePerioden(skatteforholdsperioder);
  }

  return true;
}

export function fomTomEralltidFyltUt(
  inntektskildePerioder: Inntektskilde[],
  skatteforholdsPerioder: Skatteforhold[],
): boolean {
  const allPerioder = [...inntektskildePerioder, ...skatteforholdsPerioder];
  return allPerioder.every(({ fomDato, tomDato }) => fomDato !== undefined && tomDato !== undefined);
}

export function beregnTrygdeavgiftsperioder(
  formVerdier: FieldValue<FormValuesProps>,
  options: {
    behandlingID: number;
    medlemskapsTypeErPliktig?: boolean;
    aarsavregningID: number;
    setFeilmelding: (error: any) => void;
    setAarsavregningResponse: (response: AarsavregningResponse) => void;
  },
) {
  const { behandlingID, medlemskapsTypeErPliktig, setFeilmelding, setAarsavregningResponse } = options;

  setFeilmelding(undefined);
  const erBrukerPliktigMedlemOgSkattepliktig =
    medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(formVerdier.skatteforholdsperioder);
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

export function validerMedlemskapsperioder(periods: Medlemskapsperiode[]) {
  if (periods.length === 0) {
    return undefined;
  }

  const sortedPeriods = [...periods].sort((a, b) => new Date(a.fomDato).getTime() - new Date(b.fomDato).getTime());
  const bestemmelseSet = new Set<string>();

  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < sortedPeriods.length; index++) {
    const periode = sortedPeriods[index];
    bestemmelseSet.add(periode.bestemmelse);

    if (index > 0) {
      const forrigePeriode = sortedPeriods[index - 1];
      const forrigeTomDato = new Date(forrigePeriode.tomDato);
      const nyFomDato = new Date(periode.fomDato);

      if (nyFomDato <= forrigeTomDato) {
        return "Medlemskapsperioder overlapper";
      }
      if (nyFomDato.getTime() - forrigeTomDato.getTime() > 86400000) {
        return "Det er opphold mellom medlemskapsperioder";
      }
    }
  }

  if (bestemmelseSet.size !== 1) {
    return "Bestemmelsene må være like";
  }

  return undefined;
}

export const lagInnvilgetMedlemskapsPeriode = (medlemskapsperioder?: Medlemskapsperiode[]) => {
  if (medlemskapsperioder && !Utils._isEmpty(medlemskapsperioder)) {
    const sorterteInnvilgedePerioder = [...medlemskapsperioder]
      .filter((periode) => periode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.INNVILGET)
      .sort(sorterEtterISOFomDato);
    return {
      fom: sorterteInnvilgedePerioder[0].fomDato,
      tom: sorterteInnvilgedePerioder[sorterteInnvilgedePerioder.length - 1].tomDato,
    };
  }
  return {
    tom: undefined,
    fom: undefined,
  };
};
