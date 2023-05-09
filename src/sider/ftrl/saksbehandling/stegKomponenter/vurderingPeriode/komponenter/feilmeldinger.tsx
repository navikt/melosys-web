import React from "react";
import MKV from "../../../../../../melosyskodeverk";
import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";
import { MedlemskapsperiodeProp } from "../vurderingPerioder";
import { TomFlytMelding } from "../../../../../../felleskomponenter/alertmeldinger";

const { AVSLAATT, INNVILGET } = MKV.Koder.innvilgelsesResultat;

const IngenMedlemskapsperioder = (
  <Nav.AlertStripeAdvarsel className="alertstripe_feilmelding">
    Du må legge inn minst én periode før du kan fortsette.
  </Nav.AlertStripeAdvarsel>
);

const OppholdIPeriodene = (
  <Nav.AlertStripeAdvarsel className="alertstripe_feilmelding">Det er opphold mellom perioder.</Nav.AlertStripeAdvarsel>
);

const OverlappIInnvilgedePerioder = (
  <Nav.AlertStripeAdvarsel className="alertstripe_feilmelding">Innvilgede perioder overlapper.</Nav.AlertStripeAdvarsel>
);

const OverlappMenIkkeLikPeriode = (
  <Nav.AlertStripeAdvarsel className="alertstripe_feilmelding">
    Innvilget og avslått periode som overlapper må ha lik periode.
  </Nav.AlertStripeAdvarsel>
);

const IngenSluttdato = (
  <Nav.AlertStripeAdvarsel className="alertstripe_feilmelding">
    Du må oppgi sluttdato for å kunne angi resultat. Dette blir sluttdatoen på vedtaket.
  </Nav.AlertStripeAdvarsel>
);

const MåStartePåSøknadsperiodeFom = (
  <Nav.AlertStripeAdvarsel className="alertstripe_feilmelding">
    Minst én periode må starte samme dato som søknadsperioden .
  </Nav.AlertStripeAdvarsel>
);

const erIkkeStøttetIMelosys = (medlemskapsperioder: MedlemskapsperiodeProp[]) =>
  medlemskapsperioder.every((periode) => periode.innvilgelsesResultat === AVSLAATT);

const finnesPeriodeSomStarterSamtidigSomSøknadsperioden = (
  medlemskapsperioder: MedlemskapsperiodeProp[],
  søknadsperiodeFomDato: string
) => medlemskapsperioder.some((periode) => periode.fomDato === Utils.dato.formatterDatoTilNorsk(søknadsperiodeFomDato));

const perioderErLike = (periode1: MedlemskapsperiodeProp, periode2: MedlemskapsperiodeProp) =>
  periode1.fomDato === periode2.fomDato && periode1.tomDato === periode2.tomDato;

const sorterPerioder = (a: MedlemskapsperiodeProp, b: MedlemskapsperiodeProp) =>
  (Utils.dato.norskStringTilDate(a.fomDato)?.getTime() ?? 0) -
  (Utils.dato.norskStringTilDate(b.fomDato)?.getTime() ?? 0);

const finnesOverlappIInnvilgedePerioder = (medlemskapsperioder: MedlemskapsperiodeProp[]) => {
  return [...medlemskapsperioder]
    ?.filter((periode) => periode.innvilgelsesResultat === INNVILGET)
    .sort(sorterPerioder)
    .some((periode, index, perioder) =>
      perioder
        .slice(index + 1)
        .some((nestePeriode) =>
          Utils.dato.perioderOverlapper(periode.fomDato, periode.tomDato, nestePeriode.fomDato, nestePeriode.tomDato)
        )
    );
};

const finnesInnvilgetOgAvslåttPeriodeSomOverlapperMenIkkeHarLikPeriode = (
  medlemskapsperioder: MedlemskapsperiodeProp[]
) => {
  const sortertePerioder = [...medlemskapsperioder].sort(sorterPerioder);

  if (!sortertePerioder?.length || sortertePerioder.length < 2) return false;

  for (let i = 0; i < sortertePerioder.length - 1; i += 1) {
    const periode = sortertePerioder[i];
    const nestePeriode = sortertePerioder[i + 1];

    const periodeneOverlapper = Utils.dato.perioderOverlapper(
      periode.fomDato,
      periode.tomDato,
      nestePeriode.fomDato,
      nestePeriode.tomDato
    );
    const innvilgelsesResultater = [periode.innvilgelsesResultat, nestePeriode.innvilgelsesResultat];
    const énAvslåttÉnInnvilget =
      innvilgelsesResultater.includes(AVSLAATT) && innvilgelsesResultater.includes(INNVILGET);

    if (periodeneOverlapper && énAvslåttÉnInnvilget && !perioderErLike(periode, nestePeriode)) {
      return true;
    }
  }
  return false;
};

const finnesOppholdIPerioder = (medlemskapsperioder: MedlemskapsperiodeProp[]) => {
  const sortertePerioder = [...medlemskapsperioder].sort(sorterPerioder);

  if (!sortertePerioder?.length || sortertePerioder.length < 2) return false;

  for (let i = 0; i < sortertePerioder.length - 1; i += 1) {
    const periode = sortertePerioder[i];
    const nestePeriode = sortertePerioder[i + 1];

    const nestePeriodeErPåfølgende = nestePeriode.fomDato === Utils.dato.plussEnDag(periode.tomDato);
    if (!(nestePeriodeErPåfølgende || perioderErLike(periode, nestePeriode))) {
      return true;
    }
  }
  return false;
};

enum TypeFeilmelding {
  INGEN_MEDLEMSKAPSPERIODER = "INGEN_MEDLEMSKAPSPERIODER",
  IKKE_STØTTET_I_MELOSYS = "IKKE_STØTTET_I_MELOSYS",
  INGEN_SLUTTDATO = "INGEN_SLUTTDATO",
  OVERLAPP_I_INNVILGEDE_PERIODER = "OVERLAPP_I_INNVILGEDE_PERIODER",
  OVERLAPP_MEN_FORSKJELLIG_PERIODE = "OVERLAPP_MEN_FORSKJELLIG_PERIODE",
  OPPHOLD_I_PERIODENE = "OPPHOLD_I_PERIODENE",
  MÅ_STARTE_PÅ_SØKNADSFOM = "MÅ_STARTE_PÅ_SØKNADSFOM",
}

export function finnAktivFeilmelding(
  medlemskapsperioder: MedlemskapsperiodeProp[],
  søknadsperiodeFomDato: string
): string | undefined {
  const ingenMedlemskapsperioder = medlemskapsperioder?.length === undefined || medlemskapsperioder?.length === 0;
  if (ingenMedlemskapsperioder) {
    return TypeFeilmelding.INGEN_MEDLEMSKAPSPERIODER;
  }

  if (erIkkeStøttetIMelosys(medlemskapsperioder)) {
    return TypeFeilmelding.IKKE_STØTTET_I_MELOSYS;
  }

  const manglerSluttdato = Utils._isEmpty(medlemskapsperioder[medlemskapsperioder.length - 1].tomDato);
  if (manglerSluttdato) {
    return TypeFeilmelding.INGEN_SLUTTDATO;
  }

  if (!finnesPeriodeSomStarterSamtidigSomSøknadsperioden(medlemskapsperioder, søknadsperiodeFomDato)) {
    return TypeFeilmelding.MÅ_STARTE_PÅ_SØKNADSFOM;
  }

  if (finnesOverlappIInnvilgedePerioder(medlemskapsperioder)) {
    return TypeFeilmelding.OVERLAPP_I_INNVILGEDE_PERIODER;
  }

  if (finnesInnvilgetOgAvslåttPeriodeSomOverlapperMenIkkeHarLikPeriode(medlemskapsperioder)) {
    return TypeFeilmelding.OVERLAPP_MEN_FORSKJELLIG_PERIODE;
  }

  if (finnesOppholdIPerioder(medlemskapsperioder)) {
    return TypeFeilmelding.OPPHOLD_I_PERIODENE;
  }

  return undefined;
}

export const Feilmelding = ({ type }: { type?: string }) => {
  switch (type) {
    case TypeFeilmelding.INGEN_MEDLEMSKAPSPERIODER:
      return IngenMedlemskapsperioder;
    case TypeFeilmelding.IKKE_STØTTET_I_MELOSYS:
      return <TomFlytMelding />;
    case TypeFeilmelding.INGEN_SLUTTDATO:
      return IngenSluttdato;
    case TypeFeilmelding.MÅ_STARTE_PÅ_SØKNADSFOM:
      return MåStartePåSøknadsperiodeFom;
    case TypeFeilmelding.OVERLAPP_I_INNVILGEDE_PERIODER:
      return OverlappIInnvilgedePerioder;
    case TypeFeilmelding.OVERLAPP_MEN_FORSKJELLIG_PERIODE:
      return OverlappMenIkkeLikPeriode;
    case TypeFeilmelding.OPPHOLD_I_PERIODENE:
      return OppholdIPeriodene;
    default:
      return null;
  }
};
