import * as Utils from "../../../../utils";
import { sorterEtterISOFomDato } from "../../../../utils/dato";

// Returns the first and last dates from a sorted list of membership periods.
export const hentMedlemskapsFomTomDato = (medlemskapsperioder?: any[]) => {
  if (medlemskapsperioder && !Utils._isEmpty(medlemskapsperioder)) {
    const sorted = [...medlemskapsperioder].sort(sorterEtterISOFomDato);
    return { fom: sorted[0].fomDato, tom: sorted[sorted.length - 1].tomDato };
  }
  return {};
};

// Maps a membership period from the API to local props.
export const mapTilMedlemskapsperiodeProps = (periode: any) => ({
  ...periode,
  fomDato: Utils.dato.formatterDatoTilNorsk(periode.fomDato),
  tomDato: Utils.dato.formatterDatoTilNorsk(periode.tomDato),
  ny: false,
  feil: undefined,
  periodeId: periode.id,
});

// Sorts and maps the membership periods.
export const mapInitialMedlemskapsperioder = (perioder: any[]) =>
  [...perioder].sort((a, b) => Utils.dato.sorterEtterISOFomDato(a, b)).map(mapTilMedlemskapsperiodeProps);

// Maps tax period data.
export const mapTilSkatteforholdProps = (skatteforhold?: any[], medlemskapsperioder?: any[]) => {
  const { fom, tom } = hentMedlemskapsFomTomDato(medlemskapsperioder);
  if (skatteforhold) {
    return skatteforhold.map((f) => ({
      fomDato: Utils.dato.formatterDatoTilNorsk(f.fomDato),
      tomDato: Utils.dato.formatterDatoTilNorsk(f.tomDato),
      skatteplikttype: f.skatteplikttype,
    }));
  }
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

// Maps income period data.
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
