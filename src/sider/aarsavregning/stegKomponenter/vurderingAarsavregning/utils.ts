import { FieldValue } from "react-hook-form";
import {
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { erBrukerSkattepliktigIHelePerioden } from "../../../ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgiftSchema";
import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";
import { AarsavregningResponse } from "../../../../services/modules/aarsavregning/aarsavregning";
import { Medlemskapsperiode } from "../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import MKV from "../../../../melosyskodeverk";
import { sorterEtterISOFomDato } from "../../../../utils/dato";

const mapFeilmelding = (error: any) => {
  const feilmelding = "Finner ikke trygdeavgiftssats. Melosys har ikke satser for årene før 2014.";

  const ingenGjeldendeSats = error.body?.feilkoder?.some((feilkode: string) =>
    feilkode.startsWith("Ingen gjeldende sats finnes for perioden"),
  );

  if (ingenGjeldendeSats) return feilmelding;

  return error.body?.feilkoder || error.body?.message || error;
};

export async function beregnTrygdeavgiftsperioder(
  formVerdier: FieldValue<FormValuesProps>,
  options: {
    behandlingID: number;
    medlemskapsTypeErPliktig?: boolean;
    aarsavregningID: number;
    setBeregningError: (error: any) => void;
    setAarsavregningResponse: (response: AarsavregningResponse) => void;
  },
) {
  const { behandlingID, medlemskapsTypeErPliktig, aarsavregningID, setBeregningError, setAarsavregningResponse } =
    options;

  setBeregningError(undefined);
  const erBrukerPliktigMedlemOgSkattepliktig =
    medlemskapsTypeErPliktig && erBrukerSkattepliktigIHelePerioden(formVerdier.skatteforholdsperioder);
  try {
    await Api.Trygdeavgift.beregnTrygdeavgiftsperioder(behandlingID, {
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
    });
    Api.Aarsavregning.hentAarsavregning(behandlingID).then((response_3: AarsavregningResponse) => {
      setAarsavregningResponse(response_3);
    });
    setBeregningError(undefined);
  } catch (error_3) {
    return setBeregningError(mapFeilmelding(error_3));
  }
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
