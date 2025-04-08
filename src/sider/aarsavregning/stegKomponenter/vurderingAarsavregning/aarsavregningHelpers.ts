import * as Utils from "../../../../utils";
import { sorterEtterISOFomDato } from "../../../../utils/dato";
import MKV from "../../../../melosyskodeverk";

const { IKKE_SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;

export const hentMedlemskapsFomTomDato = (medlemskapsperioder?: any[]) => {
  if (medlemskapsperioder && !Utils._isEmpty(medlemskapsperioder)) {
    const sorted = [...medlemskapsperioder].sort(sorterEtterISOFomDato);
    return { fom: sorted[0].fomDato, tom: sorted[sorted.length - 1].tomDato };
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
