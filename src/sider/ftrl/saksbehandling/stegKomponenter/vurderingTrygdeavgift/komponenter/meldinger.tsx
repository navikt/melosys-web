import { Inntektskilde, Skatteforhold } from "./types";
import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";
import MKV from "../../../../../../melosyskodeverk";

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

const SkattepliktigOgPensjonUforetrygdMedKildeskatt = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Inntekstypen &quot;pensjon/uføretrygd det betales kildeskatt av&quot; kan ikke velges for perioder bruker er
    skattepliktig til Norge
  </Nav.AlertStripeFeil>
);

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

const erSkattepliktigOgPensjonUforeMedKildeskatt = (
  skatteforholdsperioder: Skatteforhold[],
  kildetyper: Inntektskilde[]
) => {
  return skatteforholdsperioder.some((skatteforholdsperiode) =>
    kildetyper.some(
      (kildetype) =>
        kildetype.kildetype === MKV.Koder.inntektskildetype.PENSJON_UFØRETRYGD_KILDESKATT &&
        skatteforholdsperiode.skatteplikttype === MKV.Koder.skatteplikttype.SKATTEPLIKTIG &&
        Utils.dato.perioderOverlapper(
          kildetype.fomDato,
          kildetype.tomDato,
          skatteforholdsperiode.fomDato,
          skatteforholdsperiode.tomDato
        )
    )
  );
};

enum TypeMelding {
  INNTEKTSKILDE_UTENFOR_MEDLEMSKAPSPERIODE = "INNTEKTSKILDE UTENFOR MEDLEMSKAPSPERIODE",
  SKATTEFORHOLD_UTENFOR_MEDLEMSKAPSPERIODE = "SKATTEFORHOLD UTENFOR MEDLEMSKAPSPERIODE",
  BRUTTOINNTEKT_OVER_250K = "BRUTTOINNTEKT_OVER_250K",
  SKATTEPLIKTIG_OG_PENSJON_UFORETRYGD_MED_KILDESKATT = "SKATTEPLIKTIG_OG_PENSJON_UFORETRYGD_MED_KILDESKATT",
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
  if (finnesInntektskildeMedBruttoInntektOver250k(inntektskilder)) {
    return TypeMelding.BRUTTOINNTEKT_OVER_250K;
  }
  if (erSkattepliktigOgPensjonUforeMedKildeskatt(skatteforholdsperioder, inntektskilder)) {
    return TypeMelding.SKATTEPLIKTIG_OG_PENSJON_UFORETRYGD_MED_KILDESKATT;
  }

  return undefined;
};

export function feilMeldingBlokkerer(type?: string): boolean {
  switch (type) {
    case TypeMelding.INNTEKTSKILDE_UTENFOR_MEDLEMSKAPSPERIODE:
    case TypeMelding.SKATTEFORHOLD_UTENFOR_MEDLEMSKAPSPERIODE:
    case TypeMelding.SKATTEPLIKTIG_OG_PENSJON_UFORETRYGD_MED_KILDESKATT:
      return true;
    case TypeMelding.BRUTTOINNTEKT_OVER_250K:
    default:
      return false;
  }
}

export const Feilmelding = ({ type }: { type?: string }) => {
  switch (type) {
    case TypeMelding.INNTEKTSKILDE_UTENFOR_MEDLEMSKAPSPERIODE:
      return InntektskildeUtenforMedlemskapsperiode;
    case TypeMelding.SKATTEFORHOLD_UTENFOR_MEDLEMSKAPSPERIODE:
      return SkatteforholdUtenforMedlemskapsperiode;
    case TypeMelding.BRUTTOINNTEKT_OVER_250K:
      return HoyManedinntekt;
    case TypeMelding.SKATTEPLIKTIG_OG_PENSJON_UFORETRYGD_MED_KILDESKATT:
      return SkattepliktigOgPensjonUforetrygdMedKildeskatt;
    default:
      return null;
  }
};
