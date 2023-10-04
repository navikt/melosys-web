import MKV from "../../../../../../melosyskodeverk";
import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";
import { IngenFlytMelding } from "../../../../../../felleskomponenter/alertmeldinger";
import { MedlemskapsperiodeProp } from "./types";

const { AVSLAATT, INNVILGET } = MKV.Koder.innvilgelsesResultat;

const IngenMedlemskapsperioder = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Du må legge inn minst én periode før du kan fortsette.
  </Nav.AlertStripeFeil>
);

const OppholdIInnvilgedePerioder = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Det er opphold mellom innvilgede perioder.
  </Nav.AlertStripeFeil>
);

const OverlappIInnvilgedePerioder = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">Innvilgede perioder overlapper.</Nav.AlertStripeFeil>
);

const IngenSluttdato = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Du må oppgi sluttdato for å kunne angi resultat. Dette blir sluttdatoen på vedtaket.
  </Nav.AlertStripeFeil>
);

const OppholdMellomSøknadFomOgMedlemskapsFom = (
  <Nav.AlertStripeAdvarsel className="alertstripe_feilmelding">
    Det er opphold mellom startdato for søknadsperiode og startdato for medlemskapsperiode.
  </Nav.AlertStripeAdvarsel>
);

const erIkkeStøttetIMelosys = (medlemskapsperioder: MedlemskapsperiodeProp[]) =>
  medlemskapsperioder.every((periode) => periode.innvilgelsesResultat === AVSLAATT);

const finnesPeriodeSomStarterSamtidigSomSøknadsperioden = (
  medlemskapsperioder: MedlemskapsperiodeProp[],
  søknadsperiodeFomDato: string
) => medlemskapsperioder.some((periode) => Utils.dato.formatterDatoTilISO(periode.fomDato) === søknadsperiodeFomDato);

const perioderErLike = (periode1: MedlemskapsperiodeProp, periode2: MedlemskapsperiodeProp) =>
  periode1.fomDato === periode2.fomDato && periode1.tomDato === periode2.tomDato;

const sorterPerioder = (a: MedlemskapsperiodeProp, b: MedlemskapsperiodeProp) =>
  (Utils.dato.norskStringTilDate(a.fomDato)?.getTime() ?? 0) -
  (Utils.dato.norskStringTilDate(b.fomDato)?.getTime() ?? 0);

const filtrerInnvilgedePerioder = (periode: { innvilgelsesResultat: any }) =>
  periode.innvilgelsesResultat === INNVILGET;

const finnesOverlappIInnvilgedePerioder = (medlemskapsperioder: MedlemskapsperiodeProp[]) => {
  return [...medlemskapsperioder]
    ?.filter(filtrerInnvilgedePerioder)
    .sort(sorterPerioder)
    .some((periode, index, perioder) =>
      perioder
        .slice(index + 1)
        .some((nestePeriode) =>
          Utils.dato.perioderOverlapper(periode.fomDato, periode.tomDato, nestePeriode.fomDato, nestePeriode.tomDato)
        )
    );
};

const finnesOppholdIInnvilgedePerioder = (medlemskapsperioder: MedlemskapsperiodeProp[]) => {
  const sorterteInnvilgedePerioder = [...medlemskapsperioder]?.filter(filtrerInnvilgedePerioder).sort(sorterPerioder);

  if (Utils._isEmpty(sorterteInnvilgedePerioder) || sorterteInnvilgedePerioder.length === 1) return false;

  for (let i = 0; i < sorterteInnvilgedePerioder.length - 1; i += 1) {
    const periode = sorterteInnvilgedePerioder[i];
    const nestePeriode = sorterteInnvilgedePerioder[i + 1];

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
  OPPHOLD_I_INNVILGEDE_PERIODER = "OPPHOLD_I_INNVILGEDE_PERIODER",
  OPPHOLD_MELLOM_SØKNADFOM_PERIODEFOM = "OPPHOLD_MELLOM_SØKNADFOM_PERIODEFOM",
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

  if (finnesOverlappIInnvilgedePerioder(medlemskapsperioder)) {
    return TypeFeilmelding.OVERLAPP_I_INNVILGEDE_PERIODER;
  }

  if (finnesOppholdIInnvilgedePerioder(medlemskapsperioder)) {
    return TypeFeilmelding.OPPHOLD_I_INNVILGEDE_PERIODER;
  }

  if (!finnesPeriodeSomStarterSamtidigSomSøknadsperioden(medlemskapsperioder, søknadsperiodeFomDato)) {
    return TypeFeilmelding.OPPHOLD_MELLOM_SØKNADFOM_PERIODEFOM;
  }

  return undefined;
}

export function feilMeldingBlokkerer(type?: string): boolean {
  switch (type) {
    case TypeFeilmelding.INGEN_MEDLEMSKAPSPERIODER:
    case TypeFeilmelding.IKKE_STØTTET_I_MELOSYS:
    case TypeFeilmelding.INGEN_SLUTTDATO:
    case TypeFeilmelding.OVERLAPP_I_INNVILGEDE_PERIODER:
    case TypeFeilmelding.OPPHOLD_I_INNVILGEDE_PERIODER:
      return true;
    case TypeFeilmelding.OPPHOLD_MELLOM_SØKNADFOM_PERIODEFOM:
    default:
      return false;
  }
}

export const Feilmelding = ({ type }: { type?: string }) => {
  switch (type) {
    case TypeFeilmelding.INGEN_MEDLEMSKAPSPERIODER:
      return IngenMedlemskapsperioder;
    case TypeFeilmelding.IKKE_STØTTET_I_MELOSYS:
      return <IngenFlytMelding />;
    case TypeFeilmelding.INGEN_SLUTTDATO:
      return IngenSluttdato;
    case TypeFeilmelding.OVERLAPP_I_INNVILGEDE_PERIODER:
      return OverlappIInnvilgedePerioder;
    case TypeFeilmelding.OPPHOLD_I_INNVILGEDE_PERIODER:
      return OppholdIInnvilgedePerioder;
    case TypeFeilmelding.OPPHOLD_MELLOM_SØKNADFOM_PERIODEFOM:
      return OppholdMellomSøknadFomOgMedlemskapsFom;
    default:
      return null;
  }
};
