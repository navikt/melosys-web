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

export function fomTomErFyltUt(
  inntektskildePerioder: Inntektskilde[],
  skatteforholdsPerioder: Skatteforhold[],
  medlemskapsperioder?: Medlemskapsperiode[],
): boolean {
  let allPerioder = [...inntektskildePerioder, ...skatteforholdsPerioder];
  if (medlemskapsperioder?.length) {
    allPerioder = [...allPerioder, ...medlemskapsperioder];
  }
  return allPerioder.every(
    ({ fomDato, tomDato }) => fomDato !== undefined && fomDato !== "" && tomDato !== undefined && tomDato !== "",
  );
}

export function harInntektsKildeType(
  inntektskildePerioder: Inntektskilde[],
  trygdeAvgiftSkalIkkeBetalesTilNav?: boolean | undefined,
) {
  if (trygdeAvgiftSkalIkkeBetalesTilNav) {
    return true;
  }
  return inntektskildePerioder.every((inntektskilde) => inntektskilde?.kildetype !== undefined);
}

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

export const hentMedlemskapsperiodeBestemmelse = (
  harDeltGrunnlag: boolean,
  medlemskapsperioder?: Medlemskapsperiode[],
) => {
  if (medlemskapsperioder && !Utils._isEmpty(medlemskapsperioder)) {
    const sorterteInnvilgedePerioder = [...medlemskapsperioder]
      .filter((periode) => !harDeltGrunnlag || !periode.redigerbar)
      .filter((periode) => periode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.INNVILGET)
      .sort(sorterEtterISOFomDato);
    return sorterteInnvilgedePerioder?.[0]?.bestemmelse;
  }
  return undefined;
};

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
