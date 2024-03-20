import { Inntektskilde, Skatteforhold } from "./types";
import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";
import MKV from "../../../../../../melosyskodeverk";
import { Medlemskapsperiode } from "../../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";

const { PENSJON_UFØRETRYGD, PENSJON_UFØRETRYGD_KILDESKATT } = MKV.Koder.inntektskildetype;
const { INNVILGET } = MKV.Koder.innvilgelsesResultat;
const { FTRL_2_9_FØRSTE_LEDD_B_PENSJON } = MKV.Koder.trygdedekninger;
const { SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;

const HoyManedinntekt = (
  <Nav.AlertStripeAdvarsel className="alertstripe_feilmelding">Høy månedsinntekt!</Nav.AlertStripeAdvarsel>
);

const InntektskildeUtenforMedlemskapsperiode = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Inntektskildeperioden(e) kan ikke starte før eller slutte etter medlemskapsperioden(e).
  </Nav.AlertStripeFeil>
);

const SkatteforholdUtenforMedlemskapsperiode = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Skatteforholdsperioden(e) kan ikke starte før eller slutte etter medlemskapsperioden(e).
  </Nav.AlertStripeFeil>
);

const SkattepliktigOgPensjonUforetrygdMedKildeskatt = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Inntekstypen &quot;Pensjon/uføretrygd det betales kildeskatt av&quot; kan ikke velges for perioder bruker er
    skattepliktig til Norge.
  </Nav.AlertStripeFeil>
);

const PensjonUføretrygdLagtInnForPeriodeMedKunPensjon = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Pensjon/uføretrygd skal bare tas med i beregning i perioder helsedel er innvilget.
  </Nav.AlertStripeFeil>
);

const PliktigMedlemOgInntektKunFraPensjonEllerUføretrygd = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Du må oppgi minst en annen inntekt i tillegg til pensjon/uføretrygd.
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

const erSkattepliktigOgPensjonUføreMedKildeskatt = (
  skatteforholdsperioder: Skatteforhold[],
  inntektskilder: Inntektskilde[]
) => {
  const skattepliktigePerioder = skatteforholdsperioder.filter(
    (skatteforhold) => skatteforhold.skatteplikttype === SKATTEPLIKTIG
  );
  const inntektskilderPensjonUføreMedKildeskatt = inntektskilder.filter(
    (inntektskilde) => inntektskilde.kildetype === PENSJON_UFØRETRYGD_KILDESKATT
  );
  return skattepliktigePerioder.some((skatteforhold) =>
    inntektskilderPensjonUføreMedKildeskatt.some((kilder) =>
      Utils.dato.perioderOverlapper(kilder.fomDato, kilder.tomDato, skatteforhold.fomDato, skatteforhold.tomDato)
    )
  );
};

const erPensjonUføretrygdLagtInnForPeriodeMedKunPensjon = (
  inntektskilder: Inntektskilde[],
  medlemskapsperioder: Medlemskapsperiode[]
) => {
  const pensjonuføretrygdKilder = inntektskilder.filter((inntektskilde) =>
    [PENSJON_UFØRETRYGD, PENSJON_UFØRETRYGD_KILDESKATT].includes(inntektskilde.kildetype)
  );
  const overlappendeMedlemskapsperioder = medlemskapsperioder
    .filter((periode) => periode.innvilgelsesResultat === INNVILGET)
    .filter((periode) =>
      pensjonuføretrygdKilder.some((inntektskilde) =>
        Utils.dato.perioderOverlapper(
          inntektskilde.fomDato,
          inntektskilde.tomDato,
          Utils.dato.formatterDatoTilNorsk(periode.fomDato),
          Utils.dato.formatterDatoTilNorsk(periode.tomDato)
        )
      )
    );
  return (
    !Utils._isEmpty(overlappendeMedlemskapsperioder) &&
    overlappendeMedlemskapsperioder.every((periode) => periode.trygdedekning === FTRL_2_9_FØRSTE_LEDD_B_PENSJON)
  );
};

const erPliktigMedlemOgInntektKunFraPensjonEllerUføretrygd = (
  inntektskilder: Inntektskilde[],
  medlemskapsperioder: Medlemskapsperiode[],
  skatteforholdsperioder: Skatteforhold[]
) => {
  return (
    medlemskapsperioder?.every((periode) => periode.medlemskapstype === MKV.Koder.medlemskapstyper.PLIKTIG) &&
    inntektskilder?.every(
      (kilde) =>
        kilde.kildetype === MKV.Koder.inntektskildetype.UFØRETRYGD ||
        kilde.kildetype === MKV.Koder.inntektskildetype.PENSJON
    ) &&
    skatteforholdsperioder?.some(
      (skatteforhold) => skatteforhold.skatteplikttype === MKV.Koder.skatteplikttype.IKKE_SKATTEPLIKTIG
    )
  );
};

enum TypeMelding {
  INNTEKTSKILDE_UTENFOR_MEDLEMSKAPSPERIODE = "INNTEKTSKILDE UTENFOR MEDLEMSKAPSPERIODE",
  SKATTEFORHOLD_UTENFOR_MEDLEMSKAPSPERIODE = "SKATTEFORHOLD UTENFOR MEDLEMSKAPSPERIODE",
  BRUTTOINNTEKT_OVER_250K = "BRUTTOINNTEKT_OVER_250K",
  SKATTEPLIKTIG_OG_PENSJON_UFORETRYGD_MED_KILDESKATT = "SKATTEPLIKTIG_OG_PENSJON_UFORETRYGD_MED_KILDESKATT",
  PENSJON_UFORETRYGD_LAGT_TIL_FOR_PENSJON_PERIODE = "PENSJON_UFORETRYGD_LAGT_TIL_FOR_PENSJON_PERIODE",
  PLIKTIG_MEDLEM_OG_INNTEKT_KUN_FRA_PENSJON_ELLER_UFØRETRYGD = "PLIKTIG_MEDLEM_OG_INNTEKT_KUN_FRA_PENSJON_ELLER_UFØRETRYGD",
}

export const finnAktivFeilmelding = (
  inntektskilder: Inntektskilde[],
  skatteforholdsperioder: Skatteforhold[],
  medlemskapsperioder: Medlemskapsperiode[],
  innvilgetMedlemskapsperiode?: { fom: string; tom: string }
): string | undefined => {
  if (!innvilgetMedlemskapsperiode) return undefined;

  // Feil
  if (finnesSkatteforholdPeriodeUtenforMedlemskapsperiode(skatteforholdsperioder, innvilgetMedlemskapsperiode)) {
    return TypeMelding.SKATTEFORHOLD_UTENFOR_MEDLEMSKAPSPERIODE;
  }
  if (finnesInntektskildeperiodeUtenforMedlemskapsperiode(inntektskilder, innvilgetMedlemskapsperiode)) {
    return TypeMelding.INNTEKTSKILDE_UTENFOR_MEDLEMSKAPSPERIODE;
  }
  if (erPensjonUføretrygdLagtInnForPeriodeMedKunPensjon(inntektskilder, medlemskapsperioder)) {
    return TypeMelding.PENSJON_UFORETRYGD_LAGT_TIL_FOR_PENSJON_PERIODE;
  }
  if (erSkattepliktigOgPensjonUføreMedKildeskatt(skatteforholdsperioder, inntektskilder)) {
    return TypeMelding.SKATTEPLIKTIG_OG_PENSJON_UFORETRYGD_MED_KILDESKATT;
  }
  if (
    erPliktigMedlemOgInntektKunFraPensjonEllerUføretrygd(inntektskilder, medlemskapsperioder, skatteforholdsperioder)
  ) {
    return TypeMelding.PLIKTIG_MEDLEM_OG_INNTEKT_KUN_FRA_PENSJON_ELLER_UFØRETRYGD;
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
    case TypeMelding.SKATTEPLIKTIG_OG_PENSJON_UFORETRYGD_MED_KILDESKATT:
    case TypeMelding.PENSJON_UFORETRYGD_LAGT_TIL_FOR_PENSJON_PERIODE:
    case TypeMelding.PLIKTIG_MEDLEM_OG_INNTEKT_KUN_FRA_PENSJON_ELLER_UFØRETRYGD:
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
    case TypeMelding.PENSJON_UFORETRYGD_LAGT_TIL_FOR_PENSJON_PERIODE:
      return PensjonUføretrygdLagtInnForPeriodeMedKunPensjon;
    case TypeMelding.PLIKTIG_MEDLEM_OG_INNTEKT_KUN_FRA_PENSJON_ELLER_UFØRETRYGD:
      return PliktigMedlemOgInntektKunFraPensjonEllerUføretrygd;
    default:
      return null;
  }
};
