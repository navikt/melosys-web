import * as Nav from "../../../../navFrontend";
import { Inntektskilde, Skatteforhold } from "../../../../felleskomponenter/trygdeavgift/komponenter/types";
import * as Utils from "../../../../utils";
import { Avgiftspliktigperiode } from "../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { BOOLSK_STRING } from "../../../../constants";
import { MedlemskapTomFomDatoer } from "./aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlag";

const HoyManedinntekt = (
  <Nav.Alert variant="warning" className="alertstripe_feilmelding">
    Høy månedsinntekt!
  </Nav.Alert>
);

const InntektskildeUtenforMedlemskapsperiode = (
  <Nav.Alert variant="error" className="alertstripe_feilmelding">
    Inntektskildeperioden(e) kan ikke starte før eller slutte etter medlemskapsperioden(e).
  </Nav.Alert>
);

const SkatteforholdUtenforMedlemskapsperiode = (
  <Nav.Alert variant="error" className="alertstripe_feilmelding">
    Skatteforholdsperioden(e) kan ikke starte før eller slutte etter medlemskapsperioden(e).
  </Nav.Alert>
);

enum TypeMelding {
  INNTEKTSKILDE_UTENFOR_MEDLEMSKAPSPERIODE = "INNTEKTSKILDE UTENFOR MEDLEMSKAPSPERIODE",
  SKATTEFORHOLD_UTENFOR_MEDLEMSKAPSPERIODE = "SKATTEFORHOLD UTENFOR MEDLEMSKAPSPERIODE",
  BRUTTOINNTEKT_OVER_250K = "BRUTTOINNTEKT_OVER_250K",
}

const finnesSkatteforholdPeriodeUtenforMedlemskapsperiode = (
  skatteforholdsperioder: Skatteforhold[],
  innvilgetMedlemskapsperiode: MedlemskapTomFomDatoer,
) => {
  if (Utils._isEmpty(skatteforholdsperioder)) return false;
  const sorterteSkatteforhold = [...skatteforholdsperioder]
    .map((p) => ({
      fomDato: Utils.dato.formatterDatoTilISO(p.fomDato),
      tomDato: Utils.dato.formatterDatoTilISO(p.tomDato),
    }))
    .sort(Utils.dato.sorterEtterISOFomDato);

  return (
    Utils.dato.erFør(sorterteSkatteforhold[0].fomDato, innvilgetMedlemskapsperiode.fom) ||
    Utils.dato.erEtter(sorterteSkatteforhold[sorterteSkatteforhold.length - 1].tomDato, innvilgetMedlemskapsperiode.tom)
  );
};

const finnesInntektskildeperiodeUtenforMedlemskapsperiode = (
  inntektskilder: Inntektskilde[],
  innvilgetMedlemskapsperiode: MedlemskapTomFomDatoer,
) => {
  if (Utils._isEmpty(inntektskilder)) return false;
  const sorterteInntektskilder = [...inntektskilder]
    .map((p) => ({
      fomDato: Utils.dato.formatterDatoTilISO(p.fomDato),
      tomDato: Utils.dato.formatterDatoTilISO(p.tomDato),
    }))
    .sort(Utils.dato.sorterEtterISOFomDato);

  return (
    Utils.dato.erFør(sorterteInntektskilder[0].fomDato, innvilgetMedlemskapsperiode.fom) ||
    Utils.dato.erEtter(
      sorterteInntektskilder[sorterteInntektskilder.length - 1].tomDato,
      innvilgetMedlemskapsperiode.tom,
    )
  );
};

const finnesInntektskildeMedBruttoInntektOver250k = (inntektskilder: Inntektskilde[]) =>
  inntektskilder.some((periode) => periode.bruttoInntekt! > 250000 && periode.erMaanedsbelop === BOOLSK_STRING.SANN);

export const finnAktivFeilmelding = (
  inntektskilder: Inntektskilde[],
  skatteforholdsperioder: Skatteforhold[],
  medlemskapsperioder: Avgiftspliktigperiode[] | undefined,
  innvilgetMedlemskapsperiode?: MedlemskapTomFomDatoer,
): string | undefined => {
  if (!medlemskapsperioder || !innvilgetMedlemskapsperiode || innvilgetMedlemskapsperiode.tom == null) return undefined;

  // Feil
  if (finnesSkatteforholdPeriodeUtenforMedlemskapsperiode(skatteforholdsperioder, innvilgetMedlemskapsperiode)) {
    return TypeMelding.SKATTEFORHOLD_UTENFOR_MEDLEMSKAPSPERIODE;
  }
  if (finnesInntektskildeperiodeUtenforMedlemskapsperiode(inntektskilder, innvilgetMedlemskapsperiode)) {
    return TypeMelding.INNTEKTSKILDE_UTENFOR_MEDLEMSKAPSPERIODE;
  }

  // Advarsler
  if (finnesInntektskildeMedBruttoInntektOver250k(inntektskilder)) {
    return TypeMelding.BRUTTOINNTEKT_OVER_250K;
  }

  return undefined;
};

export function feilMeldingBlokkerer(type?: string): boolean {
  switch (type) {
    case TypeMelding.INNTEKTSKILDE_UTENFOR_MEDLEMSKAPSPERIODE:
    case TypeMelding.SKATTEFORHOLD_UTENFOR_MEDLEMSKAPSPERIODE:
      return true;
    case TypeMelding.BRUTTOINNTEKT_OVER_250K:
    default:
      return false;
  }
}

export function Feilmelding({ type }: { type?: string }) {
  switch (type) {
    case TypeMelding.INNTEKTSKILDE_UTENFOR_MEDLEMSKAPSPERIODE:
      return InntektskildeUtenforMedlemskapsperiode;
    case TypeMelding.SKATTEFORHOLD_UTENFOR_MEDLEMSKAPSPERIODE:
      return SkatteforholdUtenforMedlemskapsperiode;
    case TypeMelding.BRUTTOINNTEKT_OVER_250K:
      return HoyManedinntekt;
    default:
      return null;
  }
}
