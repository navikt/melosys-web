import { Inntektskilde, Skatteforhold } from "./types";
import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";

const HoyManedinntekt = (
  <Nav.AlertStripeAdvarsel className="alertstripe_feilmelding">Høy månedsinntekt!</Nav.AlertStripeAdvarsel>
);

const InntektskildeUtenforMedlemskapsperiode = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Inntektskildeperioden(e) kan ikke starte før eller slutte etter medlemskapsperioden(e)
  </Nav.AlertStripeFeil>
);

const SkatteforholdUtenforMedlemskapsperiode = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Skatteforholdsperioden(e) kan ikke starte før eller slutte etter medlemskapsperioden(e)
  </Nav.AlertStripeFeil>
);

enum TypeMelding {
  INNTEKTSKILDE_UTENFOR_MEDLEMSKAPSPERIODE = "INNTEKTSKILDE UTENFOR MEDLEMSKAPSPERIODE",
  SKATTEFORHOLD_UTENFOR_MEDLEMSKAPSPERIODE = "SKATTEFORHOLD UTENFOR MEDLEMSKAPSPERIODE",
  BRUTTOINNTEKT_OVER_250K = "BRUTTOINNTEKT_OVER_250K",
}

export const finnAktivFeilmelding = (
  inntektskilder: Inntektskilde[],
  skatteforholdsperioder: Skatteforhold[],
  innvilgetMedlemskapsperiode?: { fom: string; tom: string }
): string | undefined => {
  if (!innvilgetMedlemskapsperiode) return undefined;

  if (finnesSkatteforholdPeriodeUtenforMedlemskapsperiode(skatteforholdsperioder, innvilgetMedlemskapsperiode)) {
    return TypeMelding.SKATTEFORHOLD_UTENFOR_MEDLEMSKAPSPERIODE;
  }
  if (finnesInntektskildeperiodeUtenforMedlemskapsperiode(inntektskilder, innvilgetMedlemskapsperiode)) {
    return TypeMelding.INNTEKTSKILDE_UTENFOR_MEDLEMSKAPSPERIODE;
  }

  return undefined;
};

export const finnAktivAdvarselmelding = (inntektskilder: Inntektskilde[]): string | undefined => {
  if (finnesInntektskildeMedBruttoInntektOver250k(inntektskilder)) {
    return TypeMelding.BRUTTOINNTEKT_OVER_250K;
  }
  return undefined;
};

const finnesInntektskildeMedBruttoInntektOver250k = (inntektskilder: Inntektskilde[]) =>
  inntektskilder.some((periode) => periode.bruttoInntekt! > 250000);

const finnesInntektskildeperiodeUtenforMedlemskapsperiode = (
  inntektskilder: Inntektskilde[],
  innvilgetMedlemskapsperiode: { fom: string; tom: string }
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
      innvilgetMedlemskapsperiode.tom
    )
  );
};

const finnesSkatteforholdPeriodeUtenforMedlemskapsperiode = (
  skatteforholdsperioder: Skatteforhold[],
  innvilgetMedlemskapsperiode: { fom: string; tom: string }
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

export const Feilmelding = ({ type }: { type?: string }) => {
  switch (type) {
    case TypeMelding.INNTEKTSKILDE_UTENFOR_MEDLEMSKAPSPERIODE:
      return InntektskildeUtenforMedlemskapsperiode;
    case TypeMelding.SKATTEFORHOLD_UTENFOR_MEDLEMSKAPSPERIODE:
      return SkatteforholdUtenforMedlemskapsperiode;
    default:
      return null;
  }
};

export const AdvarselMelding = ({ type }: { type?: string }) => {
  switch (type) {
    case TypeMelding.BRUTTOINNTEKT_OVER_250K:
      return HoyManedinntekt;
    default:
      return null;
  }
};
