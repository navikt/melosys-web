import * as Utils from "../../../../utils";
import { sorterEtterISOFomDato } from "../../../../utils/dato";
import * as Api from "../../../../services/api";
import MKV from "../../../../melosyskodeverk";

const { IKKE_SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;

export const hentMedlemskapsFomTomDato = (medlemskapsperioder?: any[]) => {
  if (medlemskapsperioder && !Utils._isEmpty(medlemskapsperioder)) {
    const sorted = [...medlemskapsperioder].sort(sorterEtterISOFomDato);
    return { fom: sorted[0].fomDato, tom: sorted[sorted.length - 1].tomDato };
  }
  return {};
};

export const mapTilMedlemskapsperiodeFieldProps = (
  medlemskapsperiode: any,
  tidligereGrunnlag?: Api.Aarsavregning.Trygdeavgiftsgrunnlag,
) => {
  const grunnlagsperioder = tidligereGrunnlag?.medlemskapsperioder;
  const medlemskapsperiodeErFraGrunnlag = grunnlagsperioder?.some(
    (periode) => periode.fomDato === medlemskapsperiode.fomDato && periode.tomDato === medlemskapsperiode.tomDato,
  );

  return {
    ...medlemskapsperiode,
    fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato),
    tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato),
    feil: undefined,
    redigerbar: !medlemskapsperiodeErFraGrunnlag,
  };
};

export const mapMedlemskapsperioderFraGrunnlag = (tidligereGrunnlag: Api.Aarsavregning.Trygdeavgiftsgrunnlag) =>
  [...tidligereGrunnlag.medlemskapsperioder]
    .sort((a, b) => Utils.dato.sorterEtterISOFomDato(a, b))
    .map((periode) => mapTilMedlemskapsperiodeFieldProps(periode, tidligereGrunnlag));

export const mapMedlemskapsperioder = (perioder: any[], tidligereGrunnlag?: Api.Aarsavregning.Trygdeavgiftsgrunnlag) =>
  [...perioder]
    .sort((a, b) => Utils.dato.sorterEtterISOFomDato(a, b))
    .map((periode) => mapTilMedlemskapsperiodeFieldProps(periode, tidligereGrunnlag));

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
  if (inntektskilder) {
    return inntektskilder.map((inntektskilde) => ({
      fomDato: Utils.dato.formatterDatoTilNorsk(inntektskilde.fomDato),
      tomDato: Utils.dato.formatterDatoTilNorsk(inntektskilde.tomDato),
      kildetype: inntektskilde.type,
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
        kildetype: undefined,
        arbAvgBetales: Utils.streng.boolTilUppercaseStreng(false),
        bruttoInntekt: undefined,
        erMaanedsbelop: Utils.streng.boolTilUppercaseStreng(false),
      },
    ];
  }
  return [{}];
};
