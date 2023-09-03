import { Inntektskilde } from "./types";
import * as Nav from "../../../../../../navFrontend";
import { Medlemskapsperiode } from "../../../../../../services/modules/medlemskapsperioder";
import * as Utils from "../../../../../../utils";

const HoyManedinntekt = (
  <Nav.AlertStripeAdvarsel className="alertstripe_feilmelding">Høy månedsinntekt!</Nav.AlertStripeAdvarsel>
);

const InntektskildeUtenforMedlemskapsperiode = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Inntektskildeperioden(e) kan ikke starte før eller slutte etter medlemskapsperioden(e)
  </Nav.AlertStripeFeil>
);

enum TypeFeilmelding {
  INNTEKTSKILDE_UTENFOR_MELDEMSKAPSPERIODE = "INNTEKTSKILDE UTENFOR MELDEMSKAPSPERIODE",
  INNTEKTSKILDE_DEKKER_IKKE_MEDLPERIODE = "INNTEKTSKILDE_DEKKER_IKKE_MEDLPERIODE",
  BRUTTOINNTEKT_OVER_250K = "BRUTTOINNTEKT_OVER_250K",
}

export function finnAktivFeilmelding(
  inntektskilder: Inntektskilde[],
  medlemskapsperioder: Medlemskapsperiode[]
): string | undefined {
  if (finnesInntektskildeMedBruttoInntektOver250k(inntektskilder)) {
    return TypeFeilmelding.BRUTTOINNTEKT_OVER_250K;
  }
  if (finnesInntektskildeperiodeUtenforMedlemskapsperiode(inntektskilder, medlemskapsperioder)) {
    return TypeFeilmelding.INNTEKTSKILDE_UTENFOR_MELDEMSKAPSPERIODE;
  }

  return undefined;
}

const finnesInntektskildeMedBruttoInntektOver250k = (inntektskilder: Inntektskilde[]) =>
  inntektskilder.some((periode) => periode.bruttoInntekt! > 250000);

const finnesInntektskildeperiodeUtenforMedlemskapsperiode = (
  inntektskilder: Inntektskilde[],
  medlemskapsperioder: Medlemskapsperiode[]
) => {
  if (inntektskilder.length === 0) return false;
  const sortertInntekstkilder = inntektskilder.sort(
    (a, b) => new Date(a.fomDato!).getTime() - new Date(b.fomDato!).getTime()
  );
  const sortertMedlemskapsperioder = medlemskapsperioder.sort(
    (a, b) => new Date(a.fomDato!).getTime() - new Date(b.fomDato!).getTime()
  );
  return (
    Utils.dato.erFør(sortertInntekstkilder[0].fomDato, sortertMedlemskapsperioder[0].fomDato) ||
    Utils.dato.erEtter(
      sortertInntekstkilder[sortertInntekstkilder.length - 1].tomDato,
      sortertMedlemskapsperioder[sortertMedlemskapsperioder.length - 1].tomDato
    )
  );
};

export const Feilmelding = ({ type }: { type?: string }) => {
  switch (type) {
    case TypeFeilmelding.BRUTTOINNTEKT_OVER_250K:
      return HoyManedinntekt;
    case TypeFeilmelding.INNTEKTSKILDE_UTENFOR_MELDEMSKAPSPERIODE:
      return InntektskildeUtenforMedlemskapsperiode;
    default:
      return null;
  }
};
