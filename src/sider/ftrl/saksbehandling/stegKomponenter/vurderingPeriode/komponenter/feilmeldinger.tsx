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

const SøknadsperiodenStarterFørEllerSlutterEtter = (
  <Nav.AlertStripeAdvarsel className="alertstripe_feilmelding">
    Søknadsperioden starter før og/eller slutter etter medlemskapsperioden(e).
  </Nav.AlertStripeAdvarsel>
);

const erIkkeStøttetIMelosys = (medlemskapsperioder: MedlemskapsperiodeProp[]) =>
  medlemskapsperioder.every((periode) => periode.innvilgelsesResultat === AVSLAATT);

const søknadsperiodeStarterFørEllerSlutterEtterPeriodene = (
  medlemskapsperioder: MedlemskapsperiodeProp[],
  søknadsperiodeFomDato: string,
  søknadsperiodeTomDato?: string
) => {
  if (Utils._isEmpty(medlemskapsperioder)) return false;
  const sortertePerioder = [...medlemskapsperioder].sort(Utils.dato.sorterEtterNorskFomDato).map((p) => ({
    fomDato: Utils.dato.formatterDatoTilISO(p.fomDato),
    tomDato: Utils.dato.formatterDatoTilISO(p.tomDato),
  }));
  const søknadsperiodeStarterFør = Utils.dato.erFør(søknadsperiodeFomDato, sortertePerioder[0].fomDato);
  const søknadsperiodeSlutterEtter =
    søknadsperiodeTomDato &&
    Utils.dato.erEtter(søknadsperiodeTomDato, sortertePerioder[sortertePerioder.length - 1].tomDato);
  return søknadsperiodeStarterFør || søknadsperiodeSlutterEtter;
};

const perioderErLike = (periode1: MedlemskapsperiodeProp, periode2: MedlemskapsperiodeProp) =>
  periode1.fomDato === periode2.fomDato && periode1.tomDato === periode2.tomDato;

const filtrerInnvilgedePerioder = (periode: { innvilgelsesResultat: any }) =>
  periode.innvilgelsesResultat === INNVILGET;

const finnesOverlappIInnvilgedePerioder = (medlemskapsperioder: MedlemskapsperiodeProp[]) => {
  return [...medlemskapsperioder]
    ?.filter(filtrerInnvilgedePerioder)
    .sort(Utils.dato.sorterEtterNorskFomDato)
    .some((periode, index, perioder) =>
      perioder
        .slice(index + 1)
        .some((nestePeriode) =>
          Utils.dato.perioderOverlapper(periode.fomDato, periode.tomDato, nestePeriode.fomDato, nestePeriode.tomDato)
        )
    );
};

const finnesOppholdIInnvilgedePerioder = (medlemskapsperioder: MedlemskapsperiodeProp[]) => {
  const sorterteInnvilgedePerioder = [...medlemskapsperioder]
    ?.filter(filtrerInnvilgedePerioder)
    .sort(Utils.dato.sorterEtterNorskFomDato);

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
  SØKNADSPERIODE_STARTER_FØR_SLUTTER_ETTER = "SØKNADSPERIODE_STARTER_FØR_SLUTTER_ETTER",
}

export function finnAktivFeilmelding(
  medlemskapsperioder: MedlemskapsperiodeProp[],
  søknadsperiodeFomDato: string,
  søknadsperiodeTomDato?: string
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

  if (
    søknadsperiodeStarterFørEllerSlutterEtterPeriodene(
      medlemskapsperioder,
      søknadsperiodeFomDato,
      søknadsperiodeTomDato
    )
  ) {
    return TypeFeilmelding.SØKNADSPERIODE_STARTER_FØR_SLUTTER_ETTER;
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
    case TypeFeilmelding.SØKNADSPERIODE_STARTER_FØR_SLUTTER_ETTER:
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
    case TypeFeilmelding.SØKNADSPERIODE_STARTER_FØR_SLUTTER_ETTER:
      return SøknadsperiodenStarterFørEllerSlutterEtter;
    default:
      return null;
  }
};
