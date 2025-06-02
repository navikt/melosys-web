import { FieldValue } from "react-hook-form";
import {
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";
import { AarsavregningResponse } from "../../../../services/modules/aarsavregning/aarsavregning";
import MKV from "../../../../melosyskodeverk";

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
    console.log("[hentMedlemskapsFomTomDato] sorted with Utils.dato.sorterEtterNorskFomDato", sorted);

    const fomISO = Utils.dato.formatterDatoTilISO(sorted[0].fomDato);
    const tomISO = Utils.dato.formatterDatoTilISO(sorted[sorted.length - 1].tomDato);
    return { fom: fomISO, tom: tomISO };
  }
  return {};
};

export const mapTilSkatteforholdProps = (skatteforholdsperioder?: any[], medlemskapsperioder?: any[]) => {
  const { fom, tom } = hentMedlemskapsFomTomDato(medlemskapsperioder);
  if (skatteforholdsperioder) {
    return skatteforholdsperioder.map((skatteForhold) => ({
      fomDato: Utils.dato.formatterDatoTilNorsk(skatteForhold.fomDato),
      tomDato: Utils.dato.formatterDatoTilNorsk(skatteForhold.tomDato),
      skatteplikttype: skatteForhold.skatteplikttype,
    }));
  }
  if (fom && tom) {
    return [
      {
        fomDato: Utils.dato.formatterDatoTilNorsk(fom),
        tomDato: Utils.dato.formatterDatoTilNorsk(tom),
        skatteplikttype: IKKE_SKATTEPLIKTIG,
      },
    ];
  }
  return [{}];
};

export const mapTilInntektskilderProps = (inntektskilder?: any[], medlemskapsperioder?: any[]) => {
  const { fom, tom } = hentMedlemskapsFomTomDato(medlemskapsperioder);
  if (inntektskilder && inntektskilder.length > 0) {
    return inntektskilder.map((inntektskilde) => ({
      fomDato: Utils.dato.formatterDatoTilNorsk(inntektskilde.fomDato),
      tomDato: Utils.dato.formatterDatoTilNorsk(inntektskilde.tomDato),
      kildetype: inntektskilde.type, // Backend sends "type" instead of "kildetype"
      arbAvgBetales: Utils.streng.boolTilUppercaseStreng(inntektskilde.arbeidsgiversavgiftBetales),
      bruttoInntekt: inntektskilde.avgiftspliktigInntekt,
      erMaanedsbelop: Utils.streng.boolTilUppercaseStreng(inntektskilde.erMaanedsbelop),
    }));
  }
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
