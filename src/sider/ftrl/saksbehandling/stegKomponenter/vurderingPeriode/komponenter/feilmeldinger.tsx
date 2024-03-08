import MKV from "../../../../../../melosyskodeverk";
import * as Nav from "../../../../../../navFrontend";
import * as Utils from "../../../../../../utils";
import { IngenFlytMelding } from "../../../../../../felleskomponenter/alertmeldinger";
import { MedlemskapsperiodeProp } from "./types";

const { FTRL_KAP2_2_1, FTRL_KAP2_2_7_FJERDE_LEDD, FTRL_KAP2_2_8_FJERDE_LEDD } =
  MKV.Koder.folketrygdloven_kap2_bestemmelser;
const { MIDLERTIDIG_2_1_FJERDE_LEDD } = MKV.Koder.ikkeyrkesaktivoppholdtype;
const { AVSLAATT, INNVILGET, OPPHØRT } = MKV.Koder.innvilgelsesResultat;

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

const OverlappIOpphørtePerioder = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">Opphørte perioder overlapper.</Nav.AlertStripeFeil>
);

const OverlappOpphørtInnvilgetPeriode = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Opphørt periode overlapper med innvilget periode.
  </Nav.AlertStripeFeil>
);

const IngenSluttdato = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Du må oppgi sluttdato for å kunne angi resultat. Dette blir sluttdatoen på vedtaket.
  </Nav.AlertStripeFeil>
);

const MedlemskapsperiodenStarterFør2023 = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Du kan ikke fatte vedtak i stegvelgeren for årene før 2023. Du kan fatte fritekstvedtak i &quot;Send
    brev&quot;-fanen. Du må også vurdere om perioden skal registreres i avgiftssystemet.
  </Nav.AlertStripeFeil>
);

const BareOpphørtePerioder = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Hvis hele perioden skal opphøres, gå tilbake til inngangssteget og oppgi at betaling mangler for hele perioden.
  </Nav.AlertStripeFeil>
);

const OpphørtPeriodeFørAnnenPeriode = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">
    Opphørt periode kan ikke være før innvilget eller avslått periode.
  </Nav.AlertStripeFeil>
);

const PeriodeOverstiger12Mnd = (
  <Nav.AlertStripeFeil className="alertstripe_feilmelding">Perioden overstiger 12 måneder.</Nav.AlertStripeFeil>
);

const SøknadsperiodenStarterFørEllerSlutterEtter = (
  <Nav.AlertStripeAdvarsel className="alertstripe_feilmelding">
    Søknadsperioden starter før og/eller slutter etter medlemskapsperioden(e).
  </Nav.AlertStripeAdvarsel>
);

const IngenOpphørtePerioder = (
  <Nav.AlertStripeAdvarsel className="alertstripe_feilmelding">
    Ingen periode(r) er opphørt. Hvis det er riktig kan du likevel gå videre.
  </Nav.AlertStripeAdvarsel>
);

const BestemmelseForFamiliemedlemmerErValgt = (
  <Nav.AlertStripeAdvarsel className="alertstripe_feilmelding">
    Husk at søkeren må få dekning som er i samsvar med forsørgerens vedtak.
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
  Utils.dato.erLikeDatoer(periode1.fomDato, periode2.fomDato) &&
  Utils.dato.erLikeDatoer(periode1.tomDato, periode2.tomDato);

const innvilgedePerioder = (periode: { innvilgelsesResultat: any }) => periode.innvilgelsesResultat === INNVILGET;
const opphørtePerioder = (periode: { innvilgelsesResultat: any }) => periode.innvilgelsesResultat === OPPHØRT;

const finnesOverlappIInnvilgedePerioder = (medlemskapsperioder: MedlemskapsperiodeProp[]) => {
  return [...medlemskapsperioder]
    ?.filter(innvilgedePerioder)
    .sort(Utils.dato.sorterEtterNorskFomDato)
    .some((periode, index, perioder) =>
      perioder
        .slice(index + 1)
        .some((nestePeriode) =>
          Utils.dato.perioderOverlapper(periode.fomDato, periode.tomDato, nestePeriode.fomDato, nestePeriode.tomDato)
        )
    );
};
const finnesOverlappIOpphørtePerioder = (medlemskapsperioder: MedlemskapsperiodeProp[]) =>
  [...medlemskapsperioder]
    ?.filter(opphørtePerioder)
    .sort(Utils.dato.sorterEtterNorskFomDato)
    .some((periode, index, perioder) =>
      perioder
        .slice(index + 1)
        .some((nestePeriode) =>
          Utils.dato.perioderOverlapper(periode.fomDato, periode.tomDato, nestePeriode.fomDato, nestePeriode.tomDato)
        )
    );

const opphørtPeriodeOverlapperInnvilgetPeriode = (medlemskapsperioder: MedlemskapsperiodeProp[]) =>
  medlemskapsperioder
    ?.filter(opphørtePerioder)
    .some((opphørtPeriode) =>
      medlemskapsperioder
        ?.filter(innvilgedePerioder)
        .some((innvilgetPeriode) =>
          Utils.dato.perioderOverlapper(
            opphørtPeriode.fomDato,
            opphørtPeriode.tomDato,
            innvilgetPeriode.fomDato,
            innvilgetPeriode.tomDato
          )
        )
    );

const finnesOppholdIInnvilgedePerioder = (medlemskapsperioder: MedlemskapsperiodeProp[]) => {
  const sorterteInnvilgedePerioder = [...medlemskapsperioder]
    ?.filter(innvilgedePerioder)
    .sort(Utils.dato.sorterEtterNorskFomDato);

  if (Utils._isEmpty(sorterteInnvilgedePerioder) || sorterteInnvilgedePerioder.length === 1) return false;

  for (let i = 0; i < sorterteInnvilgedePerioder.length - 1; i += 1) {
    const periode = sorterteInnvilgedePerioder[i];
    const nestePeriode = sorterteInnvilgedePerioder[i + 1];

    const nestePeriodeErPåfølgende = Utils.dato.erLikeDatoer(
      nestePeriode.fomDato,
      Utils.dato.plussEnDag(periode.tomDato)
    );
    if (!(nestePeriodeErPåfølgende || perioderErLike(periode, nestePeriode))) {
      return true;
    }
  }
  return false;
};

const erManglendeInnbetaling = (behandlingstype: string) =>
  behandlingstype === MKV.Koder.behandlinger.behandlingstyper.MANGLENDE_INNBETALING_TRYGDEAVGIFT;

function bareOpphørtePerioder(medlemskapsperioder: MedlemskapsperiodeProp[], behandlingstype: string) {
  if (!erManglendeInnbetaling(behandlingstype)) return false;

  const finnesInnvilgetPeriode = medlemskapsperioder.some(innvilgedePerioder);
  return !finnesInnvilgetPeriode;
}

function harAndrePerioderEtterOpphørtPeriode(medlemskapsperioder: MedlemskapsperiodeProp[], behandlingstype: string) {
  if (!erManglendeInnbetaling(behandlingstype)) return false;

  const sortertePerioder = [...medlemskapsperioder].sort(Utils.dato.sorterEtterNorskFomDato);
  const førsteOpphørtePeriodeIndeks = sortertePerioder.findIndex(opphørtePerioder);
  if (førsteOpphørtePeriodeIndeks === -1) return false;

  return sortertePerioder.slice(førsteOpphørtePeriodeIndeks).some((periode) => !opphørtePerioder(periode));
}

function finnesIkkeOpphørtePerioder(medlemskapsperioder: MedlemskapsperiodeProp[], behandlingstype: string) {
  if (!erManglendeInnbetaling(behandlingstype)) return false;

  const finnesOpphørtePerioder = medlemskapsperioder.some(opphørtePerioder);
  return !finnesOpphørtePerioder;
}

const periodeStarterFoer2023 = (medlemskapsperioder: MedlemskapsperiodeProp[]) => {
  const perioder = [...medlemskapsperioder]?.sort(Utils.dato.sorterEtterNorskFomDato);
  if (Utils._isEmpty(perioder)) return false;

  const dateObj = Utils.dato.norskStringTilDate(perioder[0].fomDato);
  if (dateObj && dateObj.getFullYear() < 2023) {
    return true;
  }

  return false;
};

const bestemmelseEr2_2_1 = (bestemmelse: string) => {
  return bestemmelse === FTRL_KAP2_2_1;
};

const landErKunNorge = (land: string[]) => {
  return land.length === 1 && land[0] === MKV.Koder.landkoder.NO;
};

export const harIkkeLovligSluttDato = (medlemskapsperioder: MedlemskapsperiodeProp[], land: string[]) => {
  const sortertePerioder = [...medlemskapsperioder].sort(Utils.dato.sorterEtterNorskFomDato);
  const manglerSluttdato = Utils._isEmpty(sortertePerioder[sortertePerioder.length - 1].tomDato);
  const tillattMedManglendeSluttDato = landErKunNorge(land) && bestemmelseEr2_2_1(sortertePerioder[0].bestemmelse);
  return manglerSluttdato && !tillattMedManglendeSluttDato;
};

const periodeOver12MånederIkkeTillatt = (
  medlemskapsperioder: MedlemskapsperiodeProp[],
  ikkeyrkesaktivOppholdstype?: string
) => {
  const periode = medlemskapsperioder[0];
  const periodeOverstiger12Mnd = Utils.dato.datoDiffNorskFormat(periode.fomDato, periode.tomDato, "years") > 1;
  const periodeOver12MndIkkeTillatt =
    bestemmelseEr2_2_1(periode.bestemmelse) && ikkeyrkesaktivOppholdstype === MIDLERTIDIG_2_1_FJERDE_LEDD;
  return periodeOverstiger12Mnd && periodeOver12MndIkkeTillatt;
};

enum TypeFeilmelding {
  INGEN_MEDLEMSKAPSPERIODER = "INGEN_MEDLEMSKAPSPERIODER",
  IKKE_STØTTET_I_MELOSYS = "IKKE_STØTTET_I_MELOSYS",
  INGEN_SLUTTDATO = "INGEN_SLUTTDATO",
  OVERLAPP_I_INNVILGEDE_PERIODER = "OVERLAPP_I_INNVILGEDE_PERIODER",
  OVERLAPP_I_OPPHØRTE_PERIODER = "OVERLAPP_I_OPPHØRTE_PERIODER",
  OVERLAPP_OPPHØRT_INNVILGET = "OVERLAPP_OPPHØRT_INNVILGET",
  OPPHOLD_I_INNVILGEDE_PERIODER = "OPPHOLD_I_INNVILGEDE_PERIODER",
  SØKNADSPERIODE_STARTER_FØR_SLUTTER_ETTER = "SØKNADSPERIODE_STARTER_FØR_SLUTTER_ETTER",
  MEDLEMSKAPSPERIODE_STARTER_FØR_2023 = "MEDLEMSKAPSPERIODE_STARTER_FØR_2023",
  INGEN_OPPHØRTE_PERIODER = "INGEN_OPPHØRTE_PERIODER",
  BARE_OPPHØRTE_PERIODER = "BARE_OPPHØRTE_PERIODER",
  OPPHØRT_PERIODE_FØR_ANNEN_PERIODE = "OPPHØRT_PERIODE_FØR_ANNEN_PERIODE",
  PERIODE_OVERSTIGER_12_MND = "PERIODE_OVERSTIGER_12_MND",
  BESTEMMELSE_FOR_FAMILIEMEDLEMMER = "BESTEMMELSE_FOR_FAMILIEMEDLEMMER",
}

export function finnAktivFeilmelding(
  medlemskapsperioder: MedlemskapsperiodeProp[],
  behandlingstype: string,
  land: string[],
  begrensePeriodeVedtakToggleEnabled: boolean | undefined,
  manglendeInnbetalingToggleEnabled: boolean | undefined,
  søknadsperiodeFomDato: string,
  søknadsperiodeTomDato?: string,
  ikkeyrkesaktivOppholdstype?: string
): string | undefined {
  // Sjekk feil
  const ingenMedlemskapsperioder = medlemskapsperioder?.length === undefined || medlemskapsperioder?.length === 0;
  if (ingenMedlemskapsperioder) {
    return TypeFeilmelding.INGEN_MEDLEMSKAPSPERIODER;
  }

  if (erIkkeStøttetIMelosys(medlemskapsperioder)) {
    return TypeFeilmelding.IKKE_STØTTET_I_MELOSYS;
  }

  if (harIkkeLovligSluttDato(medlemskapsperioder, land)) {
    return TypeFeilmelding.INGEN_SLUTTDATO;
  }

  if (finnesOverlappIInnvilgedePerioder(medlemskapsperioder)) {
    return TypeFeilmelding.OVERLAPP_I_INNVILGEDE_PERIODER;
  }

  if (manglendeInnbetalingToggleEnabled && finnesOverlappIOpphørtePerioder(medlemskapsperioder)) {
    return TypeFeilmelding.OVERLAPP_I_OPPHØRTE_PERIODER;
  }

  if (manglendeInnbetalingToggleEnabled && opphørtPeriodeOverlapperInnvilgetPeriode(medlemskapsperioder)) {
    return TypeFeilmelding.OVERLAPP_OPPHØRT_INNVILGET;
  }

  if (finnesOppholdIInnvilgedePerioder(medlemskapsperioder)) {
    return TypeFeilmelding.OPPHOLD_I_INNVILGEDE_PERIODER;
  }

  if (begrensePeriodeVedtakToggleEnabled && periodeStarterFoer2023(medlemskapsperioder)) {
    return TypeFeilmelding.MEDLEMSKAPSPERIODE_STARTER_FØR_2023;
  }

  if (manglendeInnbetalingToggleEnabled && bareOpphørtePerioder(medlemskapsperioder, behandlingstype)) {
    return TypeFeilmelding.BARE_OPPHØRTE_PERIODER;
  }

  if (manglendeInnbetalingToggleEnabled && harAndrePerioderEtterOpphørtPeriode(medlemskapsperioder, behandlingstype)) {
    return TypeFeilmelding.OPPHØRT_PERIODE_FØR_ANNEN_PERIODE;
  }

  if (periodeOver12MånederIkkeTillatt(medlemskapsperioder, ikkeyrkesaktivOppholdstype)) {
    return TypeFeilmelding.PERIODE_OVERSTIGER_12_MND;
  }

  // Sjekk advarsler
  if (manglendeInnbetalingToggleEnabled && finnesIkkeOpphørtePerioder(medlemskapsperioder, behandlingstype)) {
    return TypeFeilmelding.INGEN_OPPHØRTE_PERIODER;
  }

  const { bestemmelse } = medlemskapsperioder[0];
  if (bestemmelse === FTRL_KAP2_2_7_FJERDE_LEDD || bestemmelse === FTRL_KAP2_2_8_FJERDE_LEDD) {
    return TypeFeilmelding.BESTEMMELSE_FOR_FAMILIEMEDLEMMER;
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
    case TypeFeilmelding.OVERLAPP_OPPHØRT_INNVILGET:
    case TypeFeilmelding.OVERLAPP_I_OPPHØRTE_PERIODER:
    case TypeFeilmelding.OPPHOLD_I_INNVILGEDE_PERIODER:
    case TypeFeilmelding.MEDLEMSKAPSPERIODE_STARTER_FØR_2023:
    case TypeFeilmelding.BARE_OPPHØRTE_PERIODER:
    case TypeFeilmelding.OPPHØRT_PERIODE_FØR_ANNEN_PERIODE:
    case TypeFeilmelding.PERIODE_OVERSTIGER_12_MND:
      return true;
    case TypeFeilmelding.INGEN_OPPHØRTE_PERIODER:
    case TypeFeilmelding.SØKNADSPERIODE_STARTER_FØR_SLUTTER_ETTER:
    case TypeFeilmelding.BESTEMMELSE_FOR_FAMILIEMEDLEMMER:
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
    case TypeFeilmelding.OVERLAPP_I_OPPHØRTE_PERIODER:
      return OverlappIOpphørtePerioder;
    case TypeFeilmelding.OVERLAPP_OPPHØRT_INNVILGET:
      return OverlappOpphørtInnvilgetPeriode;
    case TypeFeilmelding.OPPHOLD_I_INNVILGEDE_PERIODER:
      return OppholdIInnvilgedePerioder;
    case TypeFeilmelding.MEDLEMSKAPSPERIODE_STARTER_FØR_2023:
      return MedlemskapsperiodenStarterFør2023;
    case TypeFeilmelding.BARE_OPPHØRTE_PERIODER:
      return BareOpphørtePerioder;
    case TypeFeilmelding.OPPHØRT_PERIODE_FØR_ANNEN_PERIODE:
      return OpphørtPeriodeFørAnnenPeriode;
    case TypeFeilmelding.INGEN_OPPHØRTE_PERIODER:
      return IngenOpphørtePerioder;
    case TypeFeilmelding.SØKNADSPERIODE_STARTER_FØR_SLUTTER_ETTER:
      return SøknadsperiodenStarterFørEllerSlutterEtter;
    case TypeFeilmelding.PERIODE_OVERSTIGER_12_MND:
      return PeriodeOverstiger12Mnd;
    case TypeFeilmelding.BESTEMMELSE_FOR_FAMILIEMEDLEMMER:
      return BestemmelseForFamiliemedlemmerErValgt;
    default:
      return null;
  }
};
